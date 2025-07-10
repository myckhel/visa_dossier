<?php

namespace App\Enums;

enum DocumentType: string
{
    case PASSPORT = 'passport';
    case BIRTH_CERTIFICATE = 'birth_certificate';
    case MARRIAGE_CERTIFICATE = 'marriage_certificate';
    case PROOF_OF_INCOME = 'proof_of_income';
    case BANK_STATEMENT = 'bank_statement';
    case ACCOMMODATION_PROOF = 'accommodation_proof';
    case HEALTH_INSURANCE = 'health_insurance';
    case CRIMINAL_RECORD = 'criminal_record';
    case EDUCATIONAL_CERTIFICATE = 'educational_certificate';
    case EMPLOYMENT_CONTRACT = 'employment_contract';
    case VISA_APPLICATION_FORM = 'visa_application_form';
    case PASSPORT_PHOTO = 'passport_photo';
    case OTHER = 'other';

    public function label(): string
    {
        return match ($this) {
            self::PASSPORT => 'Passport',
            self::BIRTH_CERTIFICATE => 'Birth Certificate',
            self::MARRIAGE_CERTIFICATE => 'Marriage Certificate',
            self::PROOF_OF_INCOME => 'Proof of Income',
            self::BANK_STATEMENT => 'Bank Statement',
            self::ACCOMMODATION_PROOF => 'Accommodation Proof',
            self::HEALTH_INSURANCE => 'Health Insurance',
            self::CRIMINAL_RECORD => 'Criminal Record',
            self::EDUCATIONAL_CERTIFICATE => 'Educational Certificate',
            self::EMPLOYMENT_CONTRACT => 'Employment Contract',
            self::VISA_APPLICATION_FORM => 'Visa Application Form',
            self::PASSPORT_PHOTO => 'Passport Photo',
            self::OTHER => 'Other',
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
