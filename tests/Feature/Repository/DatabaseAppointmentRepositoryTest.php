<?php

namespace Tests\Feature\Repository;

use App\Infrastructure\Appointments\DatabaseAppointmentRepository;
use App\Models\Appointment;
use App\Models\Client;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Tests for DatabaseAppointmentRepository.
 *
 * These tests operate directly against the repository layer (not via HTTP),
 * giving us granular code coverage of every method and edge-case path.
 *
 * The in-memory SQLite database configured in phpunit.xml is used,
 * so tests run fast and never touch real data.
 */
class DatabaseAppointmentRepositoryTest extends TestCase
{
    use RefreshDatabase;

    private DatabaseAppointmentRepository $repo;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repo = new DatabaseAppointmentRepository();
    }

    // =========================================================================
    // all()
    // =========================================================================

    public function test_all_returns_empty_array_on_fresh_database(): void
    {
        $result = $this->repo->all();

        $this->assertIsArray($result);
        $this->assertEmpty($result);
    }

    public function test_all_returns_all_persisted_appointments(): void
    {
        $this->makeAppointment('Alice', '2026-06-01', '09:00', 'upcoming');
        $this->makeAppointment('Bob',   '2026-06-01', '10:00', 'completed', 80);

        $result = $this->repo->all();

        $this->assertCount(2, $result);
    }

    // =========================================================================
    // create()
    // =========================================================================

    public function test_create_persists_a_new_appointment_and_returns_correct_shape(): void
    {
        $record = $this->repo->create([
            'client_name' => 'John Doe',
            'date'        => '2026-07-10',
            'time'        => '11:00',
            'status'      => 'upcoming',
            'income'      => null,
        ]);

        // Returned shape matches the legacy contract.
        $this->assertArrayHasKey('id', $record);
        $this->assertSame('John Doe', $record['client_name']);
        $this->assertSame('2026-07-10', $record['date']);
        $this->assertSame('11:00', $record['time']);
        $this->assertSame('upcoming', $record['status']);
        $this->assertNull($record['income']);

        // The database actually has the rows.
        $this->assertDatabaseCount('appointments', 1);
        $this->assertDatabaseCount('clients', 1);
        $this->assertDatabaseHas('clients', ['name' => 'John Doe']);
    }

    public function test_create_stores_income_as_a_float(): void
    {
        $record = $this->repo->create([
            'client_name' => 'Rich Client',
            'date'        => '2026-08-01',
            'time'        => '08:00',
            'status'      => 'completed',
            'income'      => 150,
        ]);

        $this->assertSame(150.0, $record['income']);
    }

    // =========================================================================
    // 3NF: firstOrCreate — same client_name reuses the same client row
    // =========================================================================

    public function test_same_client_name_reuses_existing_client_row(): void
    {
        $this->repo->create([
            'client_name' => 'Repeat Client',
            'date'        => '2026-09-01',
            'time'        => '09:00',
            'status'      => 'upcoming',
            'income'      => null,
        ]);

        $this->repo->create([
            'client_name' => 'Repeat Client',
            'date'        => '2026-09-02',
            'time'        => '09:00',
            'status'      => 'upcoming',
            'income'      => null,
        ]);

        // Two appointments but only ONE client row — the 1-to-Many relationship.
        $this->assertDatabaseCount('appointments', 2);
        $this->assertDatabaseCount('clients', 1);

        // Both appointments reference the same client_id.
        $clientId = Client::where('name', 'Repeat Client')->value('id');
        $this->assertDatabaseCount('appointments', 2);
        $this->assertSame(
            2,
            Appointment::where('client_id', $clientId)->count()
        );
    }

    public function test_different_client_names_create_separate_client_rows(): void
    {
        $this->repo->create([
            'client_name' => 'Alice',
            'date'        => '2026-10-01',
            'time'        => '10:00',
            'status'      => 'upcoming',
            'income'      => null,
        ]);

        $this->repo->create([
            'client_name' => 'Bob',
            'date'        => '2026-10-01',
            'time'        => '11:00',
            'status'      => 'upcoming',
            'income'      => null,
        ]);

        $this->assertDatabaseCount('clients', 2);
    }

    // =========================================================================
    // find()
    // =========================================================================

    public function test_find_returns_the_correct_appointment(): void
    {
        $created = $this->repo->create([
            'client_name' => 'Find Me',
            'date'        => '2026-11-01',
            'time'        => '13:00',
            'status'      => 'upcoming',
            'income'      => null,
        ]);

        $found = $this->repo->find($created['id']);

        $this->assertNotNull($found);
        $this->assertSame($created['id'], $found['id']);
        $this->assertSame('Find Me', $found['client_name']);
    }

    public function test_find_returns_null_for_nonexistent_id(): void
    {
        $result = $this->repo->find(99999);

        $this->assertNull($result);
    }

    // =========================================================================
    // update()
    // =========================================================================

    public function test_update_modifies_status_and_income(): void
    {
        $created = $this->repo->create([
            'client_name' => 'Update Me',
            'date'        => '2026-12-01',
            'time'        => '14:00',
            'status'      => 'upcoming',
            'income'      => null,
        ]);

        $updated = $this->repo->update($created['id'], [
            'status' => 'completed',
            'income' => 120,
        ]);

        $this->assertNotNull($updated);
        $this->assertSame('completed', $updated['status']);
        $this->assertSame(120.0, $updated['income']);
        // Client name unchanged.
        $this->assertSame('Update Me', $updated['client_name']);
    }

    public function test_update_can_change_client_name_and_reuses_existing_client(): void
    {
        // Pre-create a client.
        $this->repo->create([
            'client_name' => 'Old Client',
            'date'        => '2026-12-10',
            'time'        => '09:00',
            'status'      => 'upcoming',
            'income'      => null,
        ]);

        $appt = $this->repo->create([
            'client_name' => 'Temp Name',
            'date'        => '2026-12-10',
            'time'        => '10:00',
            'status'      => 'upcoming',
            'income'      => null,
        ]);

        // Re-assign to an existing client name — should reuse the row.
        $updated = $this->repo->update($appt['id'], ['client_name' => 'Old Client']);

        $this->assertSame('Old Client', $updated['client_name']);
        // Still only 2 clients in total (Old Client + Temp Name).
        $this->assertDatabaseCount('clients', 2);
    }

    public function test_update_returns_null_for_nonexistent_id(): void
    {
        $result = $this->repo->update(99999, ['status' => 'completed']);

        $this->assertNull($result);
    }

    // =========================================================================
    // delete()
    // =========================================================================

    public function test_delete_removes_the_appointment_and_returns_true(): void
    {
        $created = $this->repo->create([
            'client_name' => 'Delete Me',
            'date'        => '2027-01-01',
            'time'        => '08:30',
            'status'      => 'upcoming',
            'income'      => null,
        ]);

        $result = $this->repo->delete($created['id']);

        $this->assertTrue($result);
        $this->assertNull($this->repo->find($created['id']));
        $this->assertDatabaseMissing('appointments', ['id' => $created['id']]);
    }

    public function test_delete_returns_false_for_nonexistent_id(): void
    {
        $result = $this->repo->delete(99999);

        $this->assertFalse($result);
    }

    // =========================================================================
    // reset()
    // =========================================================================

    public function test_reset_empties_both_appointments_and_clients_tables(): void
    {
        $this->repo->create([
            'client_name' => 'Reset Client A',
            'date'        => '2027-02-01',
            'time'        => '10:00',
            'status'      => 'upcoming',
            'income'      => null,
        ]);

        $this->repo->create([
            'client_name' => 'Reset Client B',
            'date'        => '2027-02-01',
            'time'        => '11:00',
            'status'      => 'completed',
            'income'      => 50,
        ]);

        $this->assertDatabaseCount('appointments', 2);
        $this->assertDatabaseCount('clients', 2);

        $this->repo->reset();

        $this->assertDatabaseCount('appointments', 0);
        $this->assertDatabaseCount('clients', 0);
        $this->assertEmpty($this->repo->all());
    }

    // =========================================================================
    // DB-level double-booking constraint
    // =========================================================================

    public function test_unique_date_time_constraint_prevents_double_booking_at_db_level(): void
    {
        $this->repo->create([
            'client_name' => 'First',
            'date'        => '2027-03-01',
            'time'        => '12:00',
            'status'      => 'upcoming',
            'income'      => null,
        ]);

        // The UNIQUE(date, time) index must throw a database exception when
        // a second appointment tries to occupy the same slot.
        $this->expectException(\Illuminate\Database\QueryException::class);

        $this->repo->create([
            'client_name' => 'Second',
            'date'        => '2027-03-01',
            'time'        => '12:00',
            'status'      => 'upcoming',
            'income'      => null,
        ]);
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    /**
     * Helper: directly create an appointment via the repository.
     *
     * @return array<string, mixed>
     */
    private function makeAppointment(
        string     $clientName,
        string     $date,
        string     $time,
        string     $status,
        float|null $income = null,
    ): array {
        return $this->repo->create(compact('clientName', 'date', 'time', 'status', 'income') + ['client_name' => $clientName]);
    }
}
