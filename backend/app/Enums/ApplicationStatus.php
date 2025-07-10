<?php

namespace App\Enums;

enum ApplicationStatus: string
{
    case DRAFT = 'draft';
    case SUBMITTED = 'submitted';
    case PROCESSING = 'processing';
    case UNDER_REVIEW = 'under_review';
    case ADDITIONAL_DOCS_REQUIRED = 'additional_docs_required';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::SUBMITTED => 'Submitted',
            self::PROCESSING => 'Processing',
            self::UNDER_REVIEW => 'Under Review',
            self::ADDITIONAL_DOCS_REQUIRED => 'Additional Documents Required',
            self::APPROVED => 'Approved',
            self::REJECTED => 'Rejected',
            self::CANCELLED => 'Cancelled',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::DRAFT => 'gray',
            self::SUBMITTED => 'blue',
            self::PROCESSING => 'yellow',
            self::UNDER_REVIEW => 'orange',
            self::ADDITIONAL_DOCS_REQUIRED => 'purple',
            self::APPROVED => 'green',
            self::REJECTED => 'red',
            self::CANCELLED => 'gray',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function options(): array
    {
        return array_map(
            fn(self $status) => [
                'value' => $status->value,
                'label' => $status->label(),
                'color' => $status->color()
            ],
            self::cases()
        );
    }

    public function canTransitionTo(self $newStatus): bool
    {
        return match ($this) {
            self::DRAFT => in_array($newStatus, [self::SUBMITTED, self::CANCELLED]),
            self::SUBMITTED => in_array($newStatus, [self::PROCESSING, self::CANCELLED]),
            self::PROCESSING => in_array($newStatus, [self::UNDER_REVIEW, self::ADDITIONAL_DOCS_REQUIRED, self::APPROVED, self::REJECTED]),
            self::UNDER_REVIEW => in_array($newStatus, [self::ADDITIONAL_DOCS_REQUIRED, self::APPROVED, self::REJECTED]),
            self::ADDITIONAL_DOCS_REQUIRED => in_array($newStatus, [self::PROCESSING, self::CANCELLED]),
            self::APPROVED => false, // Final state
            self::REJECTED => false, // Final state
            self::CANCELLED => false, // Final state
        };
    }
}
