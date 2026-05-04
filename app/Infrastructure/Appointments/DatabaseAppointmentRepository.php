<?php

namespace App\Infrastructure\Appointments;

use App\Domain\Appointments\Contracts\AppointmentRepositoryInterface;
use App\Models\Appointment;
use App\Models\Client;
use Illuminate\Support\Facades\DB;

/**
 * Eloquent-backed implementation of AppointmentRepositoryInterface.
 *
 * This class bridges the 3NF relational schema (clients + appointments)
 * and the flat array contract that AppointmentService depends on.
 *
 * The key adapter responsibility is translating between:
 *   - DB layer  : Appointment Eloquent model (has client_id FK, belongsTo Client)
 *   - App layer : plain PHP array with 'client_name' key (legacy contract)
 *
 * Because the returned array shape is identical to what InMemoryAppointmentRepository
 * produced, AppointmentService requires zero changes.
 */
class DatabaseAppointmentRepository implements AppointmentRepositoryInterface
{
    /**
     * Retrieve all appointments as a flat array, eager-loading the client
     * relation so we avoid N+1 queries.
     *
     * @return array<int, array<string, mixed>>
     */
    public function all(): array
    {
        return Appointment::with('client')
            ->get()
            ->map(fn (Appointment $a) => $this->toArray($a))
            ->values()
            ->all();
    }

    /**
     * Find a single appointment by its primary key.
     *
     * @return array<string, mixed>|null
     */
    public function find(int $id): ?array
    {
        $appointment = Appointment::with('client')->find($id);

        return $appointment ? $this->toArray($appointment) : null;
    }

    /**
     * Persist a new appointment.
     *
     * Uses Client::firstOrCreate so that multiple appointments for
     * the same client name point to the same clients row, which is
     * the correct 1-to-many relationship in 3NF.
     *
     * @param  array<string, mixed> $attributes
     * @return array<string, mixed>
     */
    public function create(array $attributes): array
    {
        $client = Client::firstOrCreate(['name' => (string) $attributes['client_name']]);

        $appointment = Appointment::create([
            'client_id' => $client->id,
            'date'      => (string) $attributes['date'],
            'time'      => (string) $attributes['time'],
            'status'    => (string) $attributes['status'],
            'income'    => $attributes['income'] ?? null,
        ]);

        // Load the relation so toArray() can read $appointment->client->name.
        $appointment->setRelation('client', $client);

        return $this->toArray($appointment);
    }

    /**
     * Update an existing appointment.
     *
     * If client_name is present in $attributes, the appointment is
     * re-associated with the matching (or newly created) Client row.
     *
     * @param  array<string, mixed>      $attributes
     * @return array<string, mixed>|null
     */
    public function update(int $id, array $attributes): ?array
    {
        $appointment = Appointment::with('client')->find($id);

        if (!$appointment) {
            return null;
        }

        // Re-associate the client only when the caller provides a new name.
        if (array_key_exists('client_name', $attributes)) {
            $client = Client::firstOrCreate(['name' => (string) $attributes['client_name']]);
            $attributes['client_id'] = $client->id;
            $appointment->setRelation('client', $client);
        }

        // Remove the virtual key so Eloquent fill() doesn't choke on it.
        unset($attributes['client_name']);

        $appointment->fill($attributes);
        $appointment->save();

        // Reload the client relation in case it wasn't changed above,
        // ensuring toArray() always has access to client->name.
        if (!$appointment->relationLoaded('client')) {
            $appointment->load('client');
        }

        return $this->toArray($appointment);
    }

    /**
     * Delete an appointment by its primary key.
     */
    public function delete(int $id): bool
    {
        return (bool) Appointment::destroy($id);
    }

    /**
     * Truncate the database back to a pristine state (used in tests and
     * the /testing/reset-appointments development endpoint).
     *
     * The order matters: appointments first (FK child), clients second.
     */
    public function reset(): void
    {
        DB::statement('PRAGMA foreign_keys = OFF');
        Appointment::truncate();
        Client::truncate();
        DB::statement('PRAGMA foreign_keys = ON');
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Convert an Appointment Eloquent model (with its `client` relation loaded)
     * into the flat array shape the rest of the application expects.
     *
     * @return array<string, mixed>
     */
    private function toArray(Appointment $appointment): array
    {
        return [
            'id'          => $appointment->id,
            'client_name' => $appointment->client->name,
            'date'        => $appointment->date,
            'time'        => $appointment->time,
            'status'      => $appointment->status,
            'income'      => $appointment->income,
        ];
    }
}
