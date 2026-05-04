<?php

namespace App\Infrastructure\Appointments;

use App\Domain\Appointments\Contracts\AppointmentRepositoryInterface;
use RuntimeException;
use Throwable;

class InMemoryAppointmentRepository implements AppointmentRepositoryInterface
{
    private const DEFAULT_SHM_KEY = 0x454c43;
    private const SHM_SIZE = 1048576;

    /**
     * @var array<string, mixed>
     */
    private static array $fallbackState = [
        'appointments' => [],
        'next_id' => 1,
    ];

    /**
     * @var array<int, array<string, mixed>>
     */
    private static array $seedAppointments = [
        1 => ['id' => 1, 'client_name' => 'Ionut Popa', 'date' => '2026-03-10', 'time' => '12:00', 'status' => 'upcoming', 'income' => null],
        2 => ['id' => 2, 'client_name' => 'Marius Stan', 'date' => '2026-03-10', 'time' => '14:30', 'status' => 'completed', 'income' => 120],
        3 => ['id' => 3, 'client_name' => 'Alexandru Vlad', 'date' => '2026-03-11', 'time' => '09:00', 'status' => 'upcoming', 'income' => null],
    ];

    private static int $seedNextId = 4;

    private function hasShmop(): bool
    {
        return function_exists('shmop_open') && function_exists('shmop_read') && function_exists('shmop_write');
    }

    private function shmKey(): int
    {
        $configuredKey = env('APPOINTMENTS_SHM_KEY');

        if ($configuredKey !== null && $configuredKey !== '') {
            return (int) $configuredKey;
        }

        if (request()->headers->get('X-E2E-Isolated') === '1') {
            return self::DEFAULT_SHM_KEY + 1000;
        }

        return self::DEFAULT_SHM_KEY;
    }

    /**
     * @return array<string, mixed>
     */
    private function defaultState(bool $seed = true): array
    {
        return [
            'appointments' => $seed ? self::$seedAppointments : [],
            'next_id' => $seed ? self::$seedNextId : 1,
        ];
    }

    private function encodeState(array $state): string
    {
        $json = json_encode($state, JSON_THROW_ON_ERROR);

        if (!is_string($json)) {
            throw new RuntimeException('Unable to encode shared state.');
        }

        return $json;
    }

    /**
     * @return array<string, mixed>
     */
    private function decodeState(string $payload): array
    {
        $decoded = json_decode($payload, true);

        if (!is_array($decoded)) {
            throw new RuntimeException('Invalid shared memory payload.');
        }

        return [
            'appointments' => is_array($decoded['appointments'] ?? null) ? $decoded['appointments'] : [],
            'next_id' => (int) ($decoded['next_id'] ?? 1),
        ];
    }

    /**
     * @return resource|null
     */
    private function openSegment(string $mode)
    {
        if (!$this->hasShmop()) {
            return null;
        }

        try {
            return @shmop_open($this->shmKey(), $mode, 0644, self::SHM_SIZE);
        } catch (Throwable) {
            return null;
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function readState(): array
    {
        if ($this->hasShmop()) {
            $segment = $this->openSegment('a');

            if ($segment !== null) {
                try {
                    $header = shmop_read($segment, 0, 4);
                    $length = is_string($header) && strlen($header) === 4
                        ? unpack('Nlength', $header)['length']
                        : 0;

                    if ($length > 0) {
                        $payload = shmop_read($segment, 4, $length);
                        if (is_string($payload) && $payload !== '') {
                            return $this->decodeState($payload);
                        }
                    }
                } catch (Throwable) {
                    // Fallback below.
                }
            }

            $state = $this->defaultState(true);
            $this->writeState($state);

            return $state;
        }

        return self::$fallbackState;
    }

    /**
     * @param array<string, mixed> $state
     */
    private function writeState(array $state): void
    {
        if ($this->hasShmop()) {
            $segment = $this->openSegment('c');

            if ($segment !== null) {
                try {
                    $payload = $this->encodeState($state);
                    $lengthPrefix = pack('N', strlen($payload));
                    shmop_write($segment, $lengthPrefix.$payload, 0);
                    return;
                } catch (Throwable) {
                    // Fallback below.
                }
            }
        }

        self::$fallbackState = $state;
    }

    public function all(): array
    {
        $state = $this->readState();

        return array_values($state['appointments']);
    }

    public function find(int $id): ?array
    {
        $state = $this->readState();

        return $state['appointments'][$id] ?? null;
    }

    public function create(array $attributes): array
    {
        $state = $this->readState();
        $id = (int) $state['next_id'];

        $record = [
            'id' => $id,
            'client_name' => (string) $attributes['client_name'],
            'date' => (string) $attributes['date'],
            'time' => (string) $attributes['time'],
            'status' => (string) $attributes['status'],
            'income' => $attributes['income'],
        ];

        $state['appointments'][$id] = $record;
        $state['next_id'] = $id + 1;
        $this->writeState($state);

        return $record;
    }

    public function update(int $id, array $attributes): ?array
    {
        $state = $this->readState();

        if (!isset($state['appointments'][$id])) {
            return null;
        }

        $current = $state['appointments'][$id];
        $updated = [
            'id' => $id,
            'client_name' => (string) ($attributes['client_name'] ?? $current['client_name']),
            'date' => (string) ($attributes['date'] ?? $current['date']),
            'time' => (string) ($attributes['time'] ?? $current['time']),
            'status' => (string) ($attributes['status'] ?? $current['status']),
            'income' => array_key_exists('income', $attributes) ? $attributes['income'] : $current['income'],
        ];

        $state['appointments'][$id] = $updated;
        $this->writeState($state);

        return $updated;
    }

    public function delete(int $id): bool
    {
        $state = $this->readState();

        if (!isset($state['appointments'][$id])) {
            return false;
        }

        unset($state['appointments'][$id]);
        $this->writeState($state);

        return true;
    }

    public function reset(): void
    {
        $seed = !app()->environment('testing');
        $this->writeState($this->defaultState($seed));
    }
}
