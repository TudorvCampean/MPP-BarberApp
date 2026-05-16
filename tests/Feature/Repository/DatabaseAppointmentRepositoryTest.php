<?php

namespace Tests\Feature\Repository;

use App\Infrastructure\Appointments\DatabaseAppointmentRepository;
use App\Models\Appointment;
use App\Models\Client;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\QueryException;
use Tests\TestCase;

class DatabaseAppointmentRepositoryTest extends TestCase
{
    use RefreshDatabase;

    private DatabaseAppointmentRepository $repo;
    private User $testUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repo = new DatabaseAppointmentRepository();

        // Creăm un utilizator implicit pentru toate testele
        $this->testUser = User::factory()->create(['role' => 'user']);
        $this->actingAs($this->testUser);
    }

    // =========================================================================
    // Teste pentru all() și Izolare (Multi-tenancy)
    // =========================================================================

    public function test_all_returns_empty_array_on_fresh_database(): void
    {
        $result = $this->repo->all();
        $this->assertIsArray($result);
        $this->assertEmpty($result);
    }

    public function test_user_only_sees_their_own_appointments(): void
    {
        // Programările utilizatorului curent
        $this->makeAppointment('My Client 1', '2026-06-01', '09:00', 'upcoming');

        // Programarea altui utilizator
        $otherUser = User::factory()->create();
        Appointment::factory()->create([
            'user_id' => $otherUser->id,
            'client_id' => Client::factory()->create()->id
        ]);

        $result = $this->repo->all();

        // Trebuie să vadă doar programarea lui, nu și pe a colegului
        $this->assertCount(1, $result);
        $this->assertSame('My Client 1', $result[0]['client_name']);
    }

    public function test_admin_sees_all_appointments_from_everyone(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);

        // Creăm programări pentru useri diferiți
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $this->makeAppointmentForUser($user1, 'Client A', '2026-06-01', '09:00');
        $this->makeAppointmentForUser($user2, 'Client B', '2026-06-01', '10:00');

        $result = $this->repo->all();

        // Adminul trebuie să le vadă pe ambele
        $this->assertCount(2, $result);
    }

    // =========================================================================
    // Teste pentru create()
    // =========================================================================

    public function test_create_persists_a_new_appointment_linked_to_logged_user(): void
    {
        $record = $this->repo->create([
            'client_name' => 'John Doe',
            'date'        => '2026-07-10',
            'time'        => '11:00',
            'status'      => 'upcoming',
        ]);

        $this->assertDatabaseHas('appointments', [
            'id' => $record['id'],
            'user_id' => $this->testUser->id, // Verificăm legătura automată
            'date' => '2026-07-10'
        ]);
    }

    // =========================================================================
    // Teste pentru securitate (find/update/delete)
    // =========================================================================

    public function test_user_cannot_access_another_users_appointment(): void
    {
        $otherUser = User::factory()->create();
        $appt = Appointment::factory()->create([
            'user_id' => $otherUser->id,
            'client_id' => Client::factory()->create()->id
        ]);

        // Încercarea de a găsi programarea altuia trebuie să arunce 403
        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);
        $this->repo->find($appt->id);
    }

    public function test_update_modifies_own_appointment(): void
    {
        $appt = $this->makeAppointment('Original Name', '2026-12-01', '14:00', 'upcoming');

        $updated = $this->repo->update($appt['id'], [
            'status' => 'completed',
            'income' => 120,
        ]);

        $this->assertSame('completed', $updated['status']);
        $this->assertSame(120.0, (float)$updated['income']);
    }

    public function test_delete_removes_own_appointment(): void
    {
        $appt = $this->makeAppointment('Delete Me', '2027-01-01', '08:30', 'upcoming');

        $result = $this->repo->delete($appt['id']);

        $this->assertTrue($result);
        $this->assertDatabaseMissing('appointments', ['id' => $appt['id']]);
    }

    // =========================================================================
    // Constrângeri DB (Unique Constraint)
    // =========================================================================

    public function test_unique_constraint_allows_same_time_for_different_users(): void
    {
        $date = '2027-03-01';
        $time = '12:00';

        // User 1 ocupă slotul
        $this->makeAppointment('Client 1', $date, $time, 'upcoming');

        // User 2 ocupă ACELAȘI slot (trebuie să funcționeze)
        $user2 = User::factory()->create();
        $this->actingAs($user2);

        $record = $this->repo->create([
            'client_name' => 'Client 2',
            'date' => $date,
            'time' => $time,
            'status' => 'upcoming'
        ]);

        $this->assertNotNull($record);
        $this->assertDatabaseCount('appointments', 2);
    }

    public function test_unique_constraint_fails_for_same_user_same_slot(): void
    {
        $date = '2027-03-01';
        $time = '12:00';

        $this->makeAppointment('First', $date, $time, 'upcoming');

        // Același user încearcă să rezerve din nou aceeași oră
        $this->expectException(QueryException::class);
        $this->makeAppointment('Second', $date, $time, 'upcoming');
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private function makeAppointment(string $clientName, string $date, string $time, string $status): array
    {
        return $this->repo->create([
            'client_name' => $clientName,
            'date' => $date,
            'time' => $time,
            'status' => $status
        ]);
    }

    private function makeAppointmentForUser(User $user, string $clientName, string $date, string $time): void
    {
        Appointment::factory()->create([
            'user_id' => $user->id,
            'date' => $date,
            'time' => $time,
            'client_id' => Client::firstOrCreate(['name' => $clientName])->id
        ]);
    }
}
