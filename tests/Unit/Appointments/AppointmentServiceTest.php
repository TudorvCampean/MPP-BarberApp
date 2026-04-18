<?php

namespace Tests\Unit\Appointments;

use App\Domain\Appointments\Services\AppointmentService;
use App\Infrastructure\Appointments\InMemoryAppointmentRepository;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class AppointmentServiceTest extends TestCase
{
    private InMemoryAppointmentRepository $repository;

    private AppointmentService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->repository = new InMemoryAppointmentRepository();
        $this->repository->reset();
        $this->service = new AppointmentService($this->repository);
    }

    public function test_paginate_returns_meta(): void
    {
        $this->service->create([
            'client_name' => 'A',
            'date' => '2026-05-01',
            'time' => '09:00',
            'status' => 'upcoming',
            'income' => null,
        ]);

        $this->service->create([
            'client_name' => 'B',
            'date' => '2026-05-01',
            'time' => '10:00',
            'status' => 'upcoming',
            'income' => null,
        ]);

        $result = $this->service->paginate([], 1, 1);

        $this->assertSame(1, $result['meta']['per_page']);
        $this->assertSame(2, $result['meta']['total']);
        $this->assertCount(1, $result['data']);
    }

    public function test_create_throws_exception_for_conflicting_slot(): void
    {
        $this->service->create([
            'client_name' => 'A',
            'date' => '2026-06-01',
            'time' => '10:00',
            'status' => 'upcoming',
            'income' => null,
        ]);

        $this->expectException(ValidationException::class);

        $this->service->create([
            'client_name' => 'B',
            'date' => '2026-06-01',
            'time' => '10:00',
            'status' => 'upcoming',
            'income' => null,
        ]);
    }

    public function test_statistics_aggregates_values_correctly(): void
    {
        $this->service->create([
            'client_name' => 'A',
            'date' => '2026-06-01',
            'time' => '10:00',
            'status' => 'completed',
            'income' => 40,
        ]);

        $this->service->create([
            'client_name' => 'B',
            'date' => '2026-06-01',
            'time' => '11:00',
            'status' => 'completed',
            'income' => 60,
        ]);

        $this->service->create([
            'client_name' => 'C',
            'date' => '2026-06-02',
            'time' => '11:00',
            'status' => 'upcoming',
            'income' => null,
        ]);

        $stats = $this->service->statistics([]);

        $this->assertSame(3, $stats['totals']['appointments']);
        $this->assertSame(2, $stats['totals']['completed']);
        $this->assertSame(100.0, $stats['revenue']['total_income']);
        $this->assertSame(50.0, $stats['revenue']['average_income_per_completed']);
        $this->assertCount(2, $stats['by_day']);
    }
}

