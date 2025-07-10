<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VisaDossierResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'passport_number' => $this->passport_number,
            'nationality' => $this->nationality,
            'date_of_birth' => $this->date_of_birth?->format('Y-m-d'),
            'visa_type' => $this->visa_type->value,
            'visa_type_label' => $this->visa_type->label(),
            'application_status' => $this->application_status->value,
            'application_status_label' => $this->application_status->label(),
            'application_status_color' => $this->application_status->color(),
            'assigned_officer' => $this->whenLoaded('assignedOfficer', function () {
                return [
                    'id' => $this->assignedOfficer->id,
                    'name' => $this->assignedOfficer->name,
                    'email' => $this->assignedOfficer->email,
                ];
            }),
            'notes' => $this->notes,
            'additional_data' => $this->additional_data,
            'documents_count' => $this->whenCounted('documents'),
            'documents' => DossierDocumentResource::collection($this->whenLoaded('documents')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Computed fields
            'has_required_documents' => $this->hasRequiredDocuments(),
            'can_submit' => $this->application_status->value === 'draft' && $this->hasRequiredDocuments(),
        ];
    }
}
