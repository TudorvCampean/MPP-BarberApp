<?php

namespace App\Infrastructure\Appointments;

use App\Domain\Appointments\Contracts\AppointmentRepositoryInterface;

class InMemoryAppointmentRepository implements AppointmentRepositoryInterface
{
    /**
     * @var array<int, array<string, mixed>>
     */
    private static array $appointments = [
        1 => ['id' => 1, 'client_name' => 'Ionut Popa', 'date' => '2026-03-10', 'time' => '12:00', 'status' => 'upcoming', 'income' => null],
        2 => ['id' => 2, 'client_name' => 'Marius Stan', 'date' => '2026-03-10', 'time' => '14:30', 'status' => 'completed', 'income' => 120],
        3 => ['id' => 3, 'client_name' => 'Alexandru Vlad', 'date' => '2026-03-11', 'time' => '09:00', 'status' => 'upcoming', 'income' => null],
    ];

    private static int $nextId = 4;

    public function all(): array
    {
        return array_values(self::$appointments);
    }

    public function find(int $id): ?array
    {
        return self::$appointments[$id] ?? null;
    }

    public function create(array $attributes): array
    {
        $id = self::$nextId++;

        $record = [
            'id' => $id,
            'client_name' => (string) $attributes['client_name'],
            'date' => (string) $attributes['date'],
            'time' => (string) $attributes['time'],
            'status' => (string) $attributes['status'],
            'income' => $attributes['income'],
        ];

        self::$appointments[$id] = $record;

        return $record;
    }

    public function update(int $id, array $attributes): ?array
    {
        if (!isset(self::$appointments[$id])) {
            return null;
        }

        $current = self::$appointments[$id];
        $updated = [
            'id' => $id,
            'client_name' => (string) ($attributes['client_name'] ?? $current['client_name']),
            'date' => (string) ($attributes['date'] ?? $current['date']),
            'time' => (string) ($attributes['time'] ?? $current['time']),
            'status' => (string) ($attributes['status'] ?? $current['status']),
            'income' => array_key_exists('income', $attributes) ? $attributes['income'] : $current['income'],
        ];

        self::$appointments[$id] = $updated;

        return $updated;
    }

    public function delete(int $id): bool
    {
        if (!isset(self::$appointments[$id])) {
            return false;
        }

        unset(self::$appointments[$id]);

        return true;
    }

    public function reset(): void
    {
        self::$appointments = [];
        self::$nextId = 1;
    }
}

