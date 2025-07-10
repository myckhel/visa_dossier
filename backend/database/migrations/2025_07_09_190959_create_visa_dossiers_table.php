<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('visa_dossiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Personal Information
            $table->string('passport_number');
            $table->string('nationality');
            $table->date('date_of_birth');

            // Visa Application Details
            $table->string('visa_type'); // VisaType enum
            $table->string('application_status')->default('draft'); // ApplicationStatus enum
            $table->foreignId('assigned_officer_id')->nullable()->constrained('users')->onDelete('set null');

            // Additional Information
            $table->text('notes')->nullable();
            $table->json('additional_data')->nullable();

            $table->timestamps();

            // Indexes for better performance
            $table->index(['user_id', 'application_status']);
            $table->index(['visa_type']);
            $table->index(['passport_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visa_dossiers');
    }
};
