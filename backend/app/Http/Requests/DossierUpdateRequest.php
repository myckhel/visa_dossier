<?php

namespace App\Http\Requests;

use App\Enums\ApplicationStatus;
use App\Enums\VisaType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class DossierUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'passport_number' => [
                'sometimes',
                'string',
                'max:20',
                'alpha_num',
            ],
            'nationality' => [
                'sometimes',
                'string',
                'max:100',
            ],
            'date_of_birth' => [
                'sometimes',
                'date',
                'before:today',
                'after:1900-01-01',
            ],
            'visa_type' => [
                'sometimes',
                'string',
                Rule::in(VisaType::values()),
            ],
            'application_status' => [
                'sometimes',
                'string',
                Rule::in(ApplicationStatus::values()),
            ],
            'notes' => [
                'sometimes',
                'string',
                'max:2000',
            ],
            'additional_data' => [
                'sometimes',
                'array',
            ],
            'additional_data.emergency_contact' => [
                'nullable',
                'string',
                'max:255',
            ],
            'additional_data.purpose_of_visit' => [
                'nullable',
                'string',
                'max:500',
            ],
            'additional_data.intended_duration' => [
                'nullable',
                'string',
                'max:100',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'passport_number.alpha_num' => 'Passport number must contain only letters and numbers.',
            'date_of_birth.before' => 'Date of birth must be before today.',
            'date_of_birth.after' => 'Date of birth must be after 1900.',
            'visa_type.in' => 'Invalid visa type selected.',
            'application_status.in' => 'Invalid application status selected.',
            'notes.max' => 'Notes must not exceed 2000 characters.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'passport_number' => 'passport number',
            'date_of_birth' => 'date of birth',
            'visa_type' => 'visa type',
            'application_status' => 'application status',
            'additional_data.emergency_contact' => 'emergency contact',
            'additional_data.purpose_of_visit' => 'purpose of visit',
            'additional_data.intended_duration' => 'intended duration',
        ];
    }
}
