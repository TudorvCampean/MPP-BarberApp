<?php


namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    // Resetează baza de date la fiecare test

    public function test_user_can_register_successfully()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Tudor Test',
            'email' => 'tudor@test.ro',
            'password' => 'parola123',
            'password_confirmation' => 'parola123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['access_token', 'user']);

        $this->assertDatabaseHas('users', ['email' => 'tudor@test.ro']);
    }

    public function test_user_can_login_and_receive_token()
    {
        $user = User::factory()->create([
            'password' => bcrypt('secret123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'secret123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['access_token']);
    }

    public function test_unauthenticated_user_cannot_access_appointments()
    {
        // Încercăm să accesăm rutele protejate de Assignment 3/4 fără token
        $response = $this->getJson('/api/appointments');

        $response->assertStatus(401); // Trebuie să returneze Unauthorized
    }
}
