<?php

namespace Tests\Feature;

use App\Enums\DocumentType;
use App\Models\DossierDocument;
use App\Models\User;
use App\Models\VisaDossier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DocumentManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

    public function test_can_get_document_types(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/dossiers/1/documents/types');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'value',
                        'label',
                    ],
                ],
            ]);
    }

    public function test_can_upload_document_to_dossier(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $dossier = VisaDossier::factory()->create(['user_id' => $user->id]);

        $file = UploadedFile::fake()->create('passport.pdf', 1024, 'application/pdf');

        $response = $this->postJson("/api/dossiers/{$dossier->id}/documents", [
            'files' => [$file],
            'document_type' => DocumentType::PASSPORT->value,
            'name' => 'My Passport',
            'description' => 'Passport document for visa application',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id',
                    'document_type',
                    'document_type_label',
                    'name',
                    'description',
                    'file_size',
                    'mime_type',
                    'original_filename',
                    'uploaded_at',
                ],
            ]);

        $this->assertDatabaseHas('dossier_documents', [
            'dossier_id' => $dossier->id,
            'document_type' => DocumentType::PASSPORT->value,
            'name' => 'My Passport',
        ]);
    }

    public function test_cannot_upload_document_to_other_user_dossier(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        Sanctum::actingAs($user);

        $dossier = VisaDossier::factory()->create(['user_id' => $otherUser->id]);

        $file = UploadedFile::fake()->create('passport.pdf', 1024, 'application/pdf');

        $response = $this->postJson("/api/dossiers/{$dossier->id}/documents", [
            'files' => [$file],
            'document_type' => DocumentType::PASSPORT->value,
            'name' => 'My Passport',
        ]);

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'Dossier not found.',
            ]);
    }

    public function test_can_list_dossier_documents(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $dossier = VisaDossier::factory()->create(['user_id' => $user->id]);

        // Create documents for this dossier
        DossierDocument::factory()->count(3)->create(['dossier_id' => $dossier->id]);

        $response = $this->getJson("/api/dossiers/{$dossier->id}/documents");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'document_type',
                        'name',
                        'file_size',
                        'uploaded_at',
                    ],
                ],
                'meta' => [
                    'total',
                ],
            ])
            ->assertJsonCount(3, 'data');
    }

    public function test_can_get_specific_document(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $dossier = VisaDossier::factory()->create(['user_id' => $user->id]);
        $document = DossierDocument::factory()->create(['dossier_id' => $dossier->id]);

        $response = $this->getJson("/api/dossiers/{$dossier->id}/documents/{$document->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'document_type',
                    'name',
                    'description',
                    'file_size',
                    'mime_type',
                    'original_filename',
                ],
            ])
            ->assertJson([
                'data' => [
                    'id' => $document->id,
                    'name' => $document->name,
                ],
            ]);
    }

    public function test_can_delete_document(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $dossier = VisaDossier::factory()->create(['user_id' => $user->id]);
        $document = DossierDocument::factory()->create(['dossier_id' => $dossier->id]);

        $response = $this->deleteJson("/api/dossiers/{$dossier->id}/documents/{$document->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Document deleted successfully.',
            ]);

        $this->assertDatabaseMissing('dossier_documents', [
            'id' => $document->id,
        ]);
    }

    public function test_document_validation_errors(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $dossier = VisaDossier::factory()->create(['user_id' => $user->id]);

        $response = $this->postJson("/api/dossiers/{$dossier->id}/documents", []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'files',
                'document_type',
                'name',
            ]);
    }

    public function test_invalid_file_type_validation(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $dossier = VisaDossier::factory()->create(['user_id' => $user->id]);

        $file = UploadedFile::fake()->create('document.txt', 1024, 'text/plain');

        $response = $this->postJson("/api/dossiers/{$dossier->id}/documents", [
            'files' => [$file],
            'document_type' => DocumentType::PASSPORT->value,
            'name' => 'My Document',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['files.0']);
    }

    public function test_file_size_validation(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $dossier = VisaDossier::factory()->create(['user_id' => $user->id]);

        // Create a file larger than 4MB (4 * 1024 * 1024 + 1 bytes)
        $file = UploadedFile::fake()->create('large_document.pdf', 4194305, 'application/pdf');

        $response = $this->postJson("/api/dossiers/{$dossier->id}/documents", [
            'files' => [$file],
            'document_type' => DocumentType::PASSPORT->value,
            'name' => 'Large Document',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['files.0']);
    }

    public function test_document_belongs_to_correct_dossier(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $dossier1 = VisaDossier::factory()->create(['user_id' => $user->id]);
        $dossier2 = VisaDossier::factory()->create(['user_id' => $user->id]);

        $document = DossierDocument::factory()->create(['dossier_id' => $dossier1->id]);

        // Try to access document through wrong dossier
        $response = $this->getJson("/api/dossiers/{$dossier2->id}/documents/{$document->id}");

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'Document not found.',
            ]);
    }

    public function test_can_upload_multiple_files_to_dossier(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $dossier = VisaDossier::factory()->create(['user_id' => $user->id]);

        $file1 = UploadedFile::fake()->create('passport_page1.pdf', 1024, 'application/pdf');
        $file2 = UploadedFile::fake()->create('passport_page2.jpg', 512, 'image/jpeg');
        $file3 = UploadedFile::fake()->create('passport_page3.png', 768, 'image/png');

        $response = $this->postJson("/api/dossiers/{$dossier->id}/documents", [
            'files' => [$file1, $file2, $file3],
            'document_type' => DocumentType::PASSPORT->value,
            'name' => 'Complete Passport Document',
            'description' => 'Multiple pages of passport document',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id',
                    'document_type',
                    'document_type_label',
                    'name',
                    'description',
                    'file_size',
                    'mime_type',
                    'original_filename',
                    'uploaded_at',
                ],
            ]);

        // Verify the message indicates multiple files
        $responseData = $response->json();
        $this->assertStringContainsString('3 files uploaded successfully', $responseData['message']);

        // Verify document was created with first file's properties
        $this->assertDatabaseHas('dossier_documents', [
            'dossier_id' => $dossier->id,
            'document_type' => DocumentType::PASSPORT->value,
            'name' => 'Complete Passport Document',
            'description' => 'Multiple pages of passport document',
            'file_size' => $file1->getSize(), // Should use first file's size
            'mime_type' => $file1->getMimeType(), // Should use first file's mime type
            'original_filename' => $file1->getClientOriginalName(), // Should use first file's name
        ]);

        // Verify all files were uploaded to media collection
        $document = DossierDocument::where('dossier_id', $dossier->id)->first();
        $this->assertCount(3, $document->getMedia('documents'));
    }

    public function test_validation_fails_for_too_many_files(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $dossier = VisaDossier::factory()->create(['user_id' => $user->id]);

        // Create 11 files (exceeds max of 10)
        $files = [];
        for ($i = 1; $i <= 11; $i++) {
            $files[] = UploadedFile::fake()->create("file_{$i}.pdf", 100, 'application/pdf');
        }

        $response = $this->postJson("/api/dossiers/{$dossier->id}/documents", [
            'files' => $files,
            'document_type' => DocumentType::PASSPORT->value,
            'name' => 'Too Many Files',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['files']);
    }

    public function test_validation_fails_for_empty_files_array(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $dossier = VisaDossier::factory()->create(['user_id' => $user->id]);

        $response = $this->postJson("/api/dossiers/{$dossier->id}/documents", [
            'files' => [],
            'document_type' => DocumentType::PASSPORT->value,
            'name' => 'No Files',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['files']);
    }
}
