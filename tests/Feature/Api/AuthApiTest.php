<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase; // Resets the database after each test

    public function test_user_can_register_via_api(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'testuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email'],
                'access_token'
            ]);

        // Verify the user was actually inserted into the database
        $this->assertDatabaseHas('users', [
            'email' => 'testuser@example.com',
        ]);
    }

    public function test_user_can_login_via_api(): void
    {
        // 1. Create a user in the test database
        User::factory()->create([
            'email' => 'login@example.com',
            'password' => bcrypt('StrongPassword!'),
        ]);

        // 2. Call the login endpoint
        $response = $this->postJson('/api/login', [
            'email' => 'login@example.com',
            'password' => 'StrongPassword!',
        ]);

        // 3. Expect a successful response containing the token
        $response->assertStatus(200)
            ->assertJsonStructure(['user', 'access_token']);
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'login@example.com',
            'password' => bcrypt('StrongPassword!'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'login@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401);
    }
}
