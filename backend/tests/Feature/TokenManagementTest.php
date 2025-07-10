<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TokenManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/tokens', [
            'name' => 'mobile-app',
            'abilities' => ['read', 'write'],
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'token',
                'message',
            ]);
    }

    public function test_user_can_list_tokens(): void
    {
        $user = User::factory()->create();
        $user->createToken('token-1');
        $user->createToken('token-2');
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/tokens');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'tokens' => [
                    '*' => [
                        'id',
                        'name',
                        'abilities',
                        'created_at',
                        'updated_at',
                    ],
                ],
            ]);
    }

    public function test_user_can_revoke_token(): void
    {
        $user = User::factory()->create();
        $tokenToRevoke = $user->createToken('token-to-revoke');
        $authToken = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $authToken,
        ])->deleteJson('/api/tokens/' . $tokenToRevoke->accessToken->id);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Token revoked successfully',
            ]);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $tokenToRevoke->accessToken->id,
        ]);
    }

    public function test_user_cannot_revoke_token_that_does_not_belong_to_them(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $user1Token = $user1->createToken('user1-token');
        $user2Token = $user2->createToken('user2-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $user2Token,
        ])->deleteJson('/api/tokens/' . $user1Token->accessToken->id);

        $response->assertStatus(404);
    }

    public function test_token_creation_validation_fails_with_invalid_data(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/tokens', [
            'name' => '',
            'abilities' => 'invalid',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'abilities']);
    }
}
