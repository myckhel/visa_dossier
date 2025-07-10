<?php

namespace Database\Factories;

use App\Enums\ApplicationStatus;
use App\Enums\VisaType;
use App\Models\User;
use App\Models\VisaDossier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\VisaDossier>
 */
class VisaDossierFactory extends Factory
{
    protected $model = VisaDossier::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'passport_number' => strtoupper($this->faker->bothify('??######')),
            'nationality' => $this->faker->randomElement(['US', 'CA', 'GB', 'DE', 'FR', 'AU', 'JP']),
            'date_of_birth' => $this->faker->date('Y-m-d', '2000-01-01'),
            'visa_type' => $this->faker->randomElement(VisaType::cases()),
            'application_status' => $this->faker->randomElement(ApplicationStatus::cases()),
            'assigned_officer_id' => null,
            'notes' => $this->faker->optional()->paragraph(),
            'additional_data' => $this->faker->optional()->randomElement([
                ['purpose' => 'Tourism', 'duration' => '2 weeks'],
                ['company' => 'Tech Corp', 'position' => 'Developer'],
                ['university' => 'State University', 'program' => 'Computer Science'],
                null
            ]),
        ];
    }
}
