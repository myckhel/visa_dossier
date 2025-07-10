<?php

namespace Tests\Feature;

use App\Enums\ApplicationStatus;
use App\Enums\VisaType;
use App\Models\User;
use App\Models\VisaDossier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DossierManagementTest extends TestCase
{
  use RefreshDatabase;

  public function test_can_create_dossier(): void
  {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $dossierData = [
      'passport_number' => 'AB123456',
      'nationality' => 'US',
      'date_of_birth' => '1990-01-01',
      'visa_type' => VisaType::TOURIST->value,
      'additional_data' => [
        'purpose' => 'Tourism',
        'duration' => '2 weeks',
      ],
    ];

    $response = $this->postJson('/api/dossiers', $dossierData);

    $response->assertStatus(201)
      ->assertJsonStructure([
        'message',
        'data' => [
          'id',
          'passport_number',
          'nationality',
          'date_of_birth',
          'visa_type',
          'visa_type_label',
          'application_status',
          'application_status_label',
          'additional_data',
          'created_at',
        ],
      ]);

    $this->assertDatabaseHas('visa_dossiers', [
      'user_id' => $user->id,
      'passport_number' => 'AB123456',
      'nationality' => 'US',
      'visa_type' => VisaType::TOURIST->value,
      'application_status' => ApplicationStatus::DRAFT->value,
    ]);
  }

  public function test_can_list_user_dossiers(): void
  {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    Sanctum::actingAs($user);

    // Create dossiers for the authenticated user
    VisaDossier::factory()->count(3)->create(['user_id' => $user->id]);

    // Create dossiers for another user (should not be visible)
    VisaDossier::factory()->count(2)->create(['user_id' => $otherUser->id]);

    $response = $this->getJson('/api/dossiers');

    $response->assertStatus(200)
      ->assertJsonStructure([
        'data' => [
          '*' => [
            'id',
            'passport_number',
            'nationality',
            'visa_type',
            'application_status',
            'documents',
          ],
        ],
      ])
      ->assertJsonCount(3, 'data');
  }

  public function test_can_get_specific_dossier(): void
  {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $dossier = VisaDossier::factory()->create(['user_id' => $user->id]);

    $response = $this->getJson("/api/dossiers/{$dossier->id}");

    $response->assertStatus(200)
      ->assertJsonStructure([
        'data' => [
          'id',
          'passport_number',
          'nationality',
          'date_of_birth',
          'visa_type',
          'application_status',
          'documents',
        ],
      ])
      ->assertJson([
        'data' => [
          'id' => $dossier->id,
          'passport_number' => $dossier->passport_number,
        ],
      ]);
  }

  public function test_cannot_access_other_user_dossier(): void
  {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    Sanctum::actingAs($user);

    $dossier = VisaDossier::factory()->create(['user_id' => $otherUser->id]);

    $response = $this->getJson("/api/dossiers/{$dossier->id}");

    $response->assertStatus(404)
      ->assertJson([
        'message' => 'Dossier not found.',
      ]);
  }

  public function test_can_update_dossier(): void
  {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $dossier = VisaDossier::factory()->create([
      'user_id' => $user->id,
      'nationality' => 'US',
      'visa_type' => VisaType::TOURIST,
    ]);

    $updateData = [
      'nationality' => 'CA',
      'visa_type' => VisaType::BUSINESS->value,
      'additional_data' => [
        'company' => 'Test Corp',
      ],
    ];

    $response = $this->putJson("/api/dossiers/{$dossier->id}", $updateData);

    $response->assertStatus(200)
      ->assertJsonStructure([
        'message',
        'data' => [
          'id',
          'nationality',
          'visa_type',
          'additional_data',
        ],
      ]);

    $this->assertDatabaseHas('visa_dossiers', [
      'id' => $dossier->id,
      'nationality' => 'CA',
      'visa_type' => VisaType::BUSINESS->value,
    ]);
  }

  public function test_can_delete_dossier(): void
  {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $dossier = VisaDossier::factory()->create(['user_id' => $user->id]);

    $response = $this->deleteJson("/api/dossiers/{$dossier->id}");

    $response->assertStatus(200)
      ->assertJson([
        'message' => 'Dossier deleted successfully.',
      ]);

    $this->assertDatabaseMissing('visa_dossiers', [
      'id' => $dossier->id,
    ]);
  }

  public function test_validation_errors_when_creating_dossier(): void
  {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $response = $this->postJson('/api/dossiers', []);

    $response->assertStatus(422)
      ->assertJsonValidationErrors([
        'passport_number',
        'nationality',
        'date_of_birth',
        'visa_type',
      ]);
  }

  public function test_duplicate_passport_number_validation(): void
  {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    // Create an existing dossier
    VisaDossier::factory()->create([
      'user_id' => $user->id,
      'passport_number' => 'AB123456',
    ]);

    $dossierData = [
      'passport_number' => 'AB123456',
      'nationality' => 'US',
      'date_of_birth' => '1990-01-01',
      'visa_type' => VisaType::TOURIST->value,
    ];

    $response = $this->postJson('/api/dossiers', $dossierData);

    $response->assertStatus(422)
      ->assertJsonValidationErrors(['passport_number']);
  }
}
