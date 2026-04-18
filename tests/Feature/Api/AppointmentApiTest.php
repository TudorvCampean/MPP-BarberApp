<?php

namespace Tests\Feature\Api;

use App\Domain\Appointments\Contracts\AppointmentRepositoryInterface;
use Tests\TestCase;

class AppointmentApiTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        app(AppointmentRepositoryInterface::class)->reset();
    }

    public function test_it_creates_and_shows_an_appointment(): void
    {
        $storeResponse = $this->postJson('/api/appointments', [
            'client_name' => 'John Doe',
            'date' => '2026-05-10',
            'time' => '10:00',
            'status' => 'upcoming',
            'income' => null,
        ]);

        $storeResponse->assertCreated()
            ->assertJsonPath('data.client_name', 'John Doe')
            ->assertJsonPath('data.status', 'upcoming');

        $id = $storeResponse->json('data.id');

        $this->getJson('/api/appointments/'.$id)
            ->assertOk()
            ->assertJsonPath('data.id', $id)
            ->assertJsonPath('data.client_name', 'John Doe');
    }

    public function test_it_validates_payload_on_create(): void
    {
        $this->postJson('/api/appointments', [
            'client_name' => '',
            'date' => 'invalid-date',
            'time' => '99:99',
            'status' => 'wrong',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['client_name', 'date', 'time', 'status']);
    }

    public function test_it_prevents_double_booking_for_same_date_and_time(): void
    {
        $payload = [
            'client_name' => 'Alice',
            'date' => '2026-06-01',
            'time' => '11:00',
            'status' => 'upcoming',
            'income' => null,
        ];

        $this->postJson('/api/appointments', $payload)->assertCreated();

        $this->postJson('/api/appointments', [
            ...$payload,
            'client_name' => 'Bob',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['time']);
    }

    public function test_it_updates_and_deletes_an_appointment(): void
    {
        $created = $this->postJson('/api/appointments', [
            'client_name' => 'Client One',
            'date' => '2026-05-11',
            'time' => '14:00',
            'status' => 'upcoming',
            'income' => null,
        ])->assertCreated();

        $id = $created->json('data.id');

        $this->putJson('/api/appointments/'.$id, [
            'status' => 'completed',
            'income' => 80,
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.income', 80);

        $this->deleteJson('/api/appointments/'.$id)->assertNoContent();
        $this->getJson('/api/appointments/'.$id)->assertNotFound();
    }

    public function test_it_returns_404_for_unknown_appointment(): void
    {
        $this->getJson('/api/appointments/999')->assertNotFound();
        $this->putJson('/api/appointments/999', ['status' => 'completed'])->assertNotFound();
        $this->deleteJson('/api/appointments/999')->assertNotFound();
    }

    public function test_it_returns_paginated_results_and_filters(): void
    {
        $items = [
            ['client_name' => 'A', 'date' => '2026-05-01', 'time' => '09:00', 'status' => 'upcoming', 'income' => null],
            ['client_name' => 'B', 'date' => '2026-05-01', 'time' => '10:00', 'status' => 'completed', 'income' => 50],
            ['client_name' => 'C', 'date' => '2026-05-02', 'time' => '11:00', 'status' => 'upcoming', 'income' => null],
        ];

        foreach ($items as $item) {
            $this->postJson('/api/appointments', $item)->assertCreated();
        }

        $this->getJson('/api/appointments?per_page=2&page=1')
            ->assertOk()
            ->assertJsonPath('meta.per_page', 2)
            ->assertJsonPath('meta.page', 1)
            ->assertJsonPath('meta.total', 3)
            ->assertJsonCount(2, 'data');

        $this->getJson('/api/appointments?status=completed')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.client_name', 'B');

        $this->getJson('/api/appointments?date_from=2026-05-02&date_to=2026-05-03')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.client_name', 'C');
    }

    public function test_it_returns_statistics(): void
    {
        $this->postJson('/api/appointments', [
            'client_name' => 'One',
            'date' => '2026-07-10',
            'time' => '10:00',
            'status' => 'completed',
            'income' => 100,
        ])->assertCreated();

        $this->postJson('/api/appointments', [
            'client_name' => 'Two',
            'date' => '2026-07-10',
            'time' => '11:00',
            'status' => 'completed',
            'income' => 50,
        ])->assertCreated();

        $this->postJson('/api/appointments', [
            'client_name' => 'Three',
            'date' => '2026-07-11',
            'time' => '09:30',
            'status' => 'upcoming',
            'income' => null,
        ])->assertCreated();

        $this->getJson('/api/appointments/statistics')
            ->assertOk()
            ->assertJsonPath('data.totals.appointments', 3)
            ->assertJsonPath('data.totals.completed', 2)
            ->assertJsonPath('data.revenue.total_income', 150)
            ->assertJsonPath('data.revenue.average_income_per_completed', 75);

        $this->getJson('/api/appointments/statistics?status=completed')
            ->assertOk()
            ->assertJsonPath('data.totals.appointments', 2)
            ->assertJsonPath('data.revenue.total_income', 150);
    }
}

