<?php

namespace App\Http\Requests;

use App\Enums\VisaType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class DossierCreateRequest extends FormRequest
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
                'required',
                'string',
                'max:20',
                'alpha_num',
                Rule::unique('visa_dossiers', 'passport_number')->where(function ($query) {
                    return $query->where('user_id', Auth::id());
                }),
            ],
            'nationality' => [
                'required',
                'string',
                'max:100',
            ],
            'date_of_birth' => [
                'required',
                'date',
                'before:today',
                'after:1900-01-01',
            ],
            'visa_type' => [
                'required',
                'string',
                Rule::in(VisaType::values()),
            ],
            'additional_data' => [
                'nullable',
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
            'passport_number.required' => 'Passport number is required.',
            'passport_number.alpha_num' => 'Passport number must contain only letters and numbers.',
            'nationality.required' => 'Nationality is required.',
            'date_of_birth.required' => 'Date of birth is required.',
            'date_of_birth.before' => 'Date of birth must be before today.',
            'date_of_birth.after' => 'Date of birth must be after 1900.',
            'visa_type.required' => 'Visa type is required.',
            'visa_type.in' => 'Invalid visa type selected.',
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
            'additional_data.emergency_contact' => 'emergency contact',
            'additional_data.purpose_of_visit' => 'purpose of visit',
            'additional_data.intended_duration' => 'intended duration',
        ];
    }
}
