<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Legacy VisaDossierTest - Keep for backward compatibility testing
 * Main functionality moved to DossierManagementTest and DocumentManagementTest
 */
class VisaDossierTest extends TestCase
{
    use RefreshDatabase;

    public function test_legacy_endpoints_redirect_appropriately(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Test legacy document list endpoint (should work as it redirects to dossier list)
        $response = $this->getJson('/api/visa-dossier');
        $response->assertStatus(200);

        // Test legacy types endpoint
        $response = $this->getJson('/api/visa-dossier/types');
        $response->assertStatus(410)
            ->assertJson([
                'message' => 'Please use the new document endpoints'
            ]);

        // Test legacy download endpoint
        $response = $this->getJson('/api/visa-dossier/1/download');
        $response->assertStatus(410)
            ->assertJson([
                'message' => 'Please use the new document endpoints'
            ]);
    }
}
