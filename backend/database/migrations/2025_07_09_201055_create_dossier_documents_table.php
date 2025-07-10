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
        Schema::create('dossier_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dossier_id')->constrained('visa_dossiers')->onDelete('cascade');
            $table->string('document_type'); // DocumentType enum
            $table->string('name');
            $table->text('description')->nullable();
            $table->bigInteger('file_size')->nullable();
            $table->string('mime_type')->nullable();
            $table->string('original_filename')->nullable();
            $table->timestamps();

            // Indexes for better performance
            $table->index(['dossier_id', 'document_type']);
            $table->index(['document_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dossier_documents');
    }
};
