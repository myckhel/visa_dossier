<?php

namespace App\Http\Requests;

use App\Enums\DocumentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class DocumentUploadRequest extends FormRequest
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
            'files' => [
                'required',
                'array',
                'min:1',
                'max:10', // Maximum 10 files per upload
            ],
            'files.*' => [
                'required',
                'file',
                'mimes:pdf,png,jpg,jpeg',
                'max:4096', // 4MB in KB per file
            ],
            'document_type' => [
                'required',
                'string',
                Rule::in(DocumentType::values()),
            ],
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'files.required' => 'At least one file is required.',
            'files.array' => 'Files must be provided as an array.',
            'files.min' => 'At least one file must be uploaded.',
            'files.max' => 'Maximum 10 files can be uploaded at once.',
            'files.*.required' => 'Each file is required.',
            'files.*.file' => 'Each upload must be a valid file.',
            'files.*.mimes' => 'Each file must be a PDF, PNG, JPG, or JPEG.',
            'files.*.max' => 'Each file size must not exceed 4MB.',
            'document_type.required' => 'Document type is required.',
            'document_type.in' => 'Invalid document type selected.',
            'name.required' => 'Document name is required.',
            'name.max' => 'Document name must not exceed 255 characters.',
            'description.max' => 'Description must not exceed 1000 characters.',
        ];
    }
}
