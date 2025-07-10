<?php

namespace App\Services;

use App\Enums\DocumentType;
use App\Models\DossierDocument;
use App\Models\VisaDossier;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DossierDocumentService
{
    public function uploadDocument(
        VisaDossier $dossier,
        UploadedFile $file,
        DocumentType $documentType,
        string $name,
        ?string $description = null
    ): DossierDocument {
        return DB::transaction(function () use ($dossier, $file, $documentType, $name, $description) {
            // Create the document record
            $document = DossierDocument::create([
                'dossier_id' => $dossier->id,
                'document_type' => $documentType,
                'name' => $name,
                'description' => $description,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'original_filename' => $file->getClientOriginalName(),
            ]);

            // Add the file to media collection
            $document->addMediaFromRequest('file')
                ->usingFileName($this->generateFileName($file, $documentType))
                ->toMediaCollection('documents');

            return $document->fresh(['media']);
        });
    }

    /**
     * Upload multiple files for a single document
     */
    public function uploadMultipleFiles(
        VisaDossier $dossier,
        array $files,
        DocumentType $documentType,
        string $name,
        ?string $description = null
    ): DossierDocument {
        return DB::transaction(function () use ($dossier, $files, $documentType, $name, $description) {
            // Use the first file to set the document properties
            $firstFile = $files[0];

            // Create the document record using first file properties
            $document = DossierDocument::create([
                'dossier_id' => $dossier->id,
                'document_type' => $documentType,
                'name' => $name,
                'description' => $description,
                'file_size' => $firstFile->getSize(),
                'mime_type' => $firstFile->getMimeType(),
                'original_filename' => $firstFile->getClientOriginalName(),
            ]);

            // Add all files to the media collection
            foreach ($files as $index => $file) {
                $document->addMedia($file->getRealPath())
                    ->usingName($file->getClientOriginalName())
                    ->usingFileName($this->generateFileName($file, $documentType, $index + 1))
                    ->toMediaCollection('documents');
            }

            return $document->fresh(['media']);
        });
    }

    public function getDossierDocuments(VisaDossier $dossier, ?string $documentType = null): Collection
    {
        $query = $dossier->documents()->with(['media'])->orderBy('created_at', 'desc');

        if ($documentType) {
            $query->where('document_type', $documentType);
        }

        return $query->get();
    }

    public function getDocumentsGroupedByType(VisaDossier $dossier): array
    {
        $documents = $this->getDossierDocuments($dossier);

        return $documents->groupBy('document_type')
            ->map(function (Collection $group, string $type) {
                return [
                    'type' => $type,
                    'type_label' => DocumentType::from($type)->label(),
                    'count' => $group->count(),
                    'documents' => $group->values(),
                ];
            })
            ->values()
            ->toArray();
    }

    public function findDocument(int $documentId, VisaDossier $dossier): ?DossierDocument
    {
        return $dossier->documents()
            ->with(['media'])
            ->where('id', $documentId)
            ->first();
    }

    public function deleteDocument(DossierDocument $document): bool
    {
        return DB::transaction(function () use ($document) {
            // Delete media files
            $document->clearMediaCollection('documents');

            // Delete the document record
            return $document->delete();
        });
    }

    public function validateFileType(UploadedFile $file): bool
    {
        $allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        return in_array($file->getMimeType(), $allowedTypes);
    }

    public function validateFileSize(UploadedFile $file, int $maxSizeInMB = 4): bool
    {
        $maxSizeInBytes = $maxSizeInMB * 1024 * 1024; // Convert MB to bytes
        return $file->getSize() <= $maxSizeInBytes;
    }

    private function generateFileName(UploadedFile $file, DocumentType $documentType, int $fileIndex = 1): string
    {
        $extension = $file->getClientOriginalExtension();
        $timestamp = now()->format('Y-m-d_H-i-s');
        $random = substr(md5(uniqid()), 0, 8);
        $fileNumber = $fileIndex > 1 ? "_{$fileIndex}" : '';

        return "{$documentType->value}_{$timestamp}_{$random}{$fileNumber}.{$extension}";
    }
}
