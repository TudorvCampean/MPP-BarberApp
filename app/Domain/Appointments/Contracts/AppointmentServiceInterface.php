<?php

namespace App\Domain\Appointments\Contracts;

interface AppointmentServiceInterface
{
    /**
     * @param array<string, mixed> $filters
     * @return array{data: array<int, array<string, mixed>>, meta: array<string, int>}
     */
    public function paginate(array $filters, int $page, int $perPage): array;

    /**
     * @param array<string, mixed> $payload
     * @return array<string, mixed>
     */
    public function create(array $payload): array;

    /**
     * @return array<string, mixed>|null
     */
    public function find(int $id): ?array;

    /**
     * @param array<string, mixed> $payload
     * @return array<string, mixed>|null
     */
    public function update(int $id, array $payload): ?array;

    public function delete(int $id): bool;

    /**
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function statistics(array $filters): array;
}

