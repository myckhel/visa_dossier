<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DossierDocumentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $medias = $this->getMedia('documents');

        return [
            'id' => $this->id,
            'dossier_id' => $this->dossier_id,
            'document_type' => $this->document_type->value,
            'document_type_label' => $this->document_type->label(),
            'name' => $this->name,
            'description' => $this->description,
            'file_size' => $this->file_size,
            'file_size_formatted' => $this->formatFileSize($this->file_size),
            'mime_type' => $this->mime_type,
            'original_filename' => $this->original_filename,
            'files' => $medias->map(fn($media) => [
                'id' => $media->id,
                'name' => $media->file_name,
                'url' => $media->getUrl(),
                'thumbnail_url' => $media->getUrl('thumb'),
                'size' => $this->formatFileSize($media->size),
                'mime_type' => $media->mime_type,
            ]),
            'uploaded_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    private function formatFileSize(?int $bytes): ?string
    {
        if (!$bytes) return null;

        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;

        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }
}
