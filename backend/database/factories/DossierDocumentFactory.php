<?php

namespace Database\Factories;

use App\Enums\DocumentType;
use App\Models\DossierDocument;
use App\Models\VisaDossier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DossierDocument>
 */
class DossierDocumentFactory extends Factory
{
  protected $model = DossierDocument::class;

  /**
   * Define the model's default state.
   *
   * @return array<string, mixed>
   */
  public function definition(): array
  {
    return [
      'dossier_id' => VisaDossier::factory(),
      'document_type' => $this->faker->randomElement(DocumentType::cases()),
      'name' => $this->faker->sentence(3),
      'description' => $this->faker->optional()->paragraph(),
      'file_size' => $this->faker->numberBetween(1024, 4194304), // 1KB to 4MB
      'mime_type' => $this->faker->randomElement(['application/pdf', 'image/jpeg', 'image/png']),
      'original_filename' => $this->faker->word() . '.' . $this->faker->randomElement(['pdf', 'jpg', 'png']),
    ];
  }
}
