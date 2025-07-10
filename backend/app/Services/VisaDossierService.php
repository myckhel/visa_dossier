<?php

namespace App\Services;

use App\Enums\ApplicationStatus;
use App\Enums\VisaType;
use App\Models\User;
use App\Models\VisaDossier;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class VisaDossierService
{
    public function createDossier(
        string $passportNumber,
        string $nationality,
        string $dateOfBirth,
        VisaType $visaType,
        ?array $additionalData = null,
        ?User $user = null
    ): VisaDossier {
        $user = $user ?? Auth::user();

        return VisaDossier::create([
            'user_id' => $user->id,
            'passport_number' => $passportNumber,
            'nationality' => $nationality,
            'date_of_birth' => $dateOfBirth,
            'visa_type' => $visaType,
            'application_status' => ApplicationStatus::DRAFT,
            'additional_data' => $additionalData,
        ]);
    }

    public function updateDossier(
        VisaDossier $dossier,
        array $data
    ): VisaDossier {
        $dossier->update($data);
        return $dossier->fresh();
    }

    public function getUserDossiers(?User $user = null): Collection
    {
        $user = $user ?? Auth::user();

        return VisaDossier::with(['documents.media', 'assignedOfficer'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getUserDossiersPaginated(
        ?User $user = null,
        int $perPage = 15,
        ?string $status = null,
        ?string $visaType = null
    ): LengthAwarePaginator {
        $user = $user ?? Auth::user();

        $query = VisaDossier::with(['documents.media', 'assignedOfficer'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc');

        if ($status) {
            $query->where('application_status', $status);
        }

        if ($visaType) {
            $query->where('visa_type', $visaType);
        }

        return $query->paginate($perPage);
    }

    public function findDossier(int $id, ?User $user = null): ?VisaDossier
    {
        $user = $user ?? Auth::user();

        return VisaDossier::with(['documents.media', 'assignedOfficer'])
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->first();
    }

    public function deleteDossier(VisaDossier $dossier): bool
    {
        return DB::transaction(function () use ($dossier) {
            // Delete all documents and their media files
            foreach ($dossier->documents as $document) {
                $document->clearMediaCollection('documents');
                $document->delete();
            }

            // Delete the dossier
            return $dossier->delete();
        });
    }

    public function updateStatus(VisaDossier $dossier, ApplicationStatus $newStatus): bool
    {
        if (!$dossier->canTransitionTo($newStatus)) {
            return false;
        }

        return $dossier->updateStatus($newStatus);
    }

    public function assignOfficer(VisaDossier $dossier, User $officer): VisaDossier
    {
        $dossier->update(['assigned_officer_id' => $officer->id]);
        return $dossier->fresh(['assignedOfficer']);
    }

    public function addNotes(VisaDossier $dossier, string $notes): VisaDossier
    {
        $existingNotes = $dossier->notes ?? '';
        $timestamp = now()->format('Y-m-d H:i:s');
        $newNotes = $existingNotes . "\n[{$timestamp}] {$notes}";

        $dossier->update(['notes' => trim($newNotes)]);
        return $dossier->fresh();
    }

    public function getDossierStats(?User $user = null): array
    {
        $user = $user ?? Auth::user();

        $dossiers = $this->getUserDossiers($user);

        $stats = [
            'total' => $dossiers->count(),
            'by_status' => [],
            'by_visa_type' => [],
            'recent_activity' => $dossiers->take(5),
        ];

        // Group by status
        $statusGroups = $dossiers->groupBy('application_status');
        foreach (ApplicationStatus::cases() as $status) {
            $stats['by_status'][$status->value] = [
                'count' => $statusGroups->get($status->value)?->count() ?? 0,
                'label' => $status->label(),
                'color' => $status->color(),
            ];
        }

        // Group by visa type
        $visaTypeGroups = $dossiers->groupBy('visa_type');
        foreach (VisaType::cases() as $visaType) {
            $stats['by_visa_type'][$visaType->value] = [
                'count' => $visaTypeGroups->get($visaType->value)?->count() ?? 0,
                'label' => $visaType->label(),
            ];
        }

        return $stats;
    }

    public function getVisaTypes(): array
    {
        return VisaType::options();
    }

    public function getApplicationStatuses(): array
    {
        return ApplicationStatus::options();
    }
}
