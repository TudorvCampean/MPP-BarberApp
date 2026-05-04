<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates the `appointments` table.
     *
     * 3NF rationale:
     *   - 1NF: every attribute is atomic; no repeating groups.
     *   - 2NF: single-column primary key — no partial dependencies.
     *   - 3NF: client_name has been moved to the `clients` table;
     *           appointments only stores client_id (FK), so there is no
     *           transitive dependency (non-key attribute depending on
     *           another non-key attribute) remaining in this table.
     *
     * The UNIQUE index on (date, time) enforces the business rule that
     * only one appointment can occupy a given time-slot, adding a
     * data-integrity guarantee at the database level in addition to the
     * application-level guard in AppointmentService.
     */
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('client_id')
                ->constrained('clients')
                ->cascadeOnDelete();

            $table->date('date');
            $table->time('time');
            $table->string('status', 20); // upcoming | completed | cancelled
            $table->decimal('income', 10, 2)->nullable();
            $table->timestamps();

            // Guarantees no double-booking at the database level.
            $table->unique(['date', 'time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
