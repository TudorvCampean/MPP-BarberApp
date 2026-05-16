<?php

namespace App\Domain\Appointments\Services;

use App\Domain\Appointments\Contracts\AppointmentRepositoryInterface;
use App\Domain\Appointments\Contracts\AppointmentServiceInterface;
use Illuminate\Validation\ValidationException;

class AppointmentService implements AppointmentServiceInterface
{
    public function __construct(private readonly AppointmentRepositoryInterface $repository)
    {
    }

    public function paginate(array $filters, int $page, int $perPage): array
    {
        $all = $this->applyFilters($this->repository->all(), $filters);

        usort($all, fn (array $a, array $b) => strcmp($a['date'].' '.$a['time'], $b['date'].' '.$b['time']));

        $total = count($all);
        $lastPage = max(1, (int) ceil($total / $perPage));
        $page = min($page, $lastPage);
        $offset = ($page - 1) * $perPage;

        return [
            'data' => array_values(array_slice($all, $offset, $perPage)),
            'meta' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => $lastPage,
            ],
        ];
    }

    public function create(array $payload): array
    {
        // Trimitem auth()->id() ca target pentru a verifica conflictele pe persoana care creează
        $this->guardDateTimeSlotConflict($payload['date'], $payload['time'], null, auth()->id());

        return $this->repository->create($payload);
    }

    public function find(int $id): ?array
    {
        return $this->repository->find($id);
    }

    public function update(int $id, array $payload): ?array
    {
        $existing = $this->repository->find($id);

        if (!$existing) {
            return null;
        }

        $date = $payload['date'] ?? $existing['date'];
        $time = $payload['time'] ?? $existing['time'];

        // Când adminul editează programarea altcuiva, verificăm conflictul pe calendarul acelui coleg!
        $targetUserId = $existing['user_id'] ?? auth()->id();

        $this->guardDateTimeSlotConflict($date, $time, $id, $targetUserId);

        return $this->repository->update($id, $payload);
    }

    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }

    public function statistics(array $filters): array
    {
        $all = $this->applyFilters($this->repository->all(), $filters);

        $totalIncome = array_reduce(
            $all,
            fn (float $carry, array $apt) => $carry + (float) ($apt['income'] ?? 0),
            0.0
        );

        $completedCount = count(array_filter($all, fn (array $apt) => $apt['status'] === 'completed'));

        $byStatus = [];
        $byDay = [];

        foreach ($all as $apt) {
            $status = $apt['status'];
            $byStatus[$status] = ($byStatus[$status] ?? 0) + 1;

            $date = $apt['date'];
            $byDay[$date] = ($byDay[$date] ?? 0) + 1;
        }

        ksort($byDay);

        return [
            'totals' => [
                'appointments' => count($all),
                'upcoming' => count(array_filter($all, fn (array $apt) => $apt['status'] === 'upcoming')),
                'completed' => $completedCount,
                'cancelled' => count(array_filter($all, fn (array $apt) => $apt['status'] === 'cancelled')),
            ],
            'revenue' => [
                'total_income' => $totalIncome,
                'average_income_per_completed' => $completedCount > 0 ? round($totalIncome / $completedCount, 2) : 0,
            ],
            'by_status' => $byStatus,
            'by_day' => array_map(
                fn (string $date, int $count) => ['date' => $date, 'count' => $count],
                array_keys($byDay),
                array_values($byDay)
            ),
        ];
    }

    /**
     * @param array<int, array<string, mixed>> $appointments
     * @param array<string, mixed> $filters
     * @return array<int, array<string, mixed>>
     */
    private function applyFilters(array $appointments, array $filters): array
    {
        return array_values(array_filter($appointments, function (array $apt) use ($filters): bool {
            if (!empty($filters['status']) && $apt['status'] !== $filters['status']) {
                return false;
            }

            if (!empty($filters['date_from']) && $apt['date'] < $filters['date_from']) {
                return false;
            }

            if (!empty($filters['date_to']) && $apt['date'] > $filters['date_to']) {
                return false;
            }

            return true;
        }));
    }

    private function guardDateTimeSlotConflict(string $date, string $time, ?int $ignoreId = null, ?int $targetUserId = null): void
    {
        $targetUserId = $targetUserId ?? auth()->id();

        foreach ($this->repository->all() as $appointment) {
            if ($ignoreId !== null && $appointment['id'] === $ignoreId) {
                continue;
            }

            // REPARAT: Folosim cast-ul (int) pentru ca SQLite returnează ID-urile ca string-uri!
            if (isset($appointment['user_id']) && (int) $appointment['user_id'] !== (int) $targetUserId) {
                continue;
            }

            // REPARAT: Baza de date salvează ora ca 10:00:00. Noi trimitem 10:00. Comparăm doar primele 5 caractere!
            $dbTime = substr($appointment['time'], 0, 5);
            $reqTime = substr($time, 0, 5);

            if ($appointment['date'] === $date && $dbTime === $reqTime) {
                throw ValidationException::withMessages([
                    'time' => ['The selected time slot is already booked for this date.'],
                ]);
            }
        }
    }
}
