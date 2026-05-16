<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AppointmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'client_id' => Client::factory(),
            'date' => $this->faker->date(),
            'time' => $this->faker->time('H:i'),
            'status' => 'upcoming',
            'income' => null,
        ];
    }
}
