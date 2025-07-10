<?php

namespace App\Models;

use App\Enums\ApplicationStatus;
use App\Enums\VisaType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VisaDossier extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'passport_number',
        'nationality',
        'date_of_birth',
        'visa_type',
        'application_status',
        'assigned_officer_id',
        'notes',
        'additional_data',
    ];

    protected $casts = [
        'visa_type' => VisaType::class,
        'application_status' => ApplicationStatus::class,
        'date_of_birth' => 'date',
        'additional_data' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignedOfficer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_officer_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(DossierDocument::class, 'dossier_id');
    }

    public function canTransitionTo(ApplicationStatus $newStatus): bool
    {
        return $this->application_status->canTransitionTo($newStatus);
    }

    public function updateStatus(ApplicationStatus $newStatus): bool
    {
        if (!$this->canTransitionTo($newStatus)) {
            return false;
        }

        $this->application_status = $newStatus;
        return $this->save();
    }

    public function getDocumentsByType(string $documentType): HasMany
    {
        return $this->documents()->where('document_type', $documentType);
    }

    public function hasRequiredDocuments(): bool
    {
        // Define required documents based on visa type
        $requiredDocuments = match ($this->visa_type) {
            VisaType::TOURIST => ['passport', 'passport_photo'],
            VisaType::STUDENT => ['passport', 'passport_photo', 'educational_certificate'],
            VisaType::WORK => ['passport', 'passport_photo', 'employment_contract'],
            VisaType::BUSINESS => ['passport', 'passport_photo', 'proof_of_income'],
            default => ['passport', 'passport_photo'],
        };

        foreach ($requiredDocuments as $docType) {
            if ($this->getDocumentsByType($docType)->count() === 0) {
                return false;
            }
        }

        return true;
    }
}
