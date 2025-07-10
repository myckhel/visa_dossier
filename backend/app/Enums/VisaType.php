<?php

namespace App\Enums;

enum VisaType: string
{
    case TOURIST = 'tourist';
    case STUDENT = 'student';
    case WORK = 'work';
    case BUSINESS = 'business';
    case TRANSIT = 'transit';
    case FAMILY_REUNION = 'family_reunion';
    case MEDICAL = 'medical';
    case INVESTMENT = 'investment';

    public function label(): string
    {
        return match ($this) {
            self::TOURIST => 'Tourist Visa',
            self::STUDENT => 'Student Visa',
            self::WORK => 'Work Visa',
            self::BUSINESS => 'Business Visa',
            self::TRANSIT => 'Transit Visa',
            self::FAMILY_REUNION => 'Family Reunion Visa',
            self::MEDICAL => 'Medical Visa',
            self::INVESTMENT => 'Investment Visa',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function options(): array
    {
        return array_map(
            fn(self $type) => ['value' => $type->value, 'label' => $type->label()],
            self::cases()
        );
    }
}
