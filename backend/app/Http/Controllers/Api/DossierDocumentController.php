<?php

namespace App\Http\Controllers\Api;

use App\Enums\DocumentType;
use App\Http\Controllers\Controller;
use App\Http\Requests\DocumentUploadRequest;
use App\Http\Resources\DossierDocumentCollection;
use App\Http\Resources\DossierDocumentResource;
use App\Services\DossierDocumentService;
use App\Services\VisaDossierService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\UploadedFile;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DossierDocumentController extends Controller
{
    public function __construct(
        private readonly DossierDocumentService $dossierDocumentService,
        private readonly VisaDossierService $visaDossierService
    ) {}

    /**
     * Display a listing of documents for a dossier.
     */
    public function index(int $dossierId, Request $request): JsonResponse
    {
        $dossier = $this->visaDossierService->findDossier($dossierId);

        if (!$dossier) {
            return response()->json([
                'message' => 'Dossier not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        $documentType = $request->get('document_type');
        $documents = $this->dossierDocumentService->getDossierDocuments($dossier, $documentType);

        return response()->json(new DossierDocumentCollection($documents));
    }

    /**
     * Store a newly uploaded document with multiple files.
     */
    public function store(int $dossierId, DocumentUploadRequest $request): JsonResponse
    {
        $dossier = $this->visaDossierService->findDossier($dossierId);

        if (!$dossier) {
            return response()->json([
                'message' => 'Dossier not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        $validated = $request->validated();

        // Get the uploaded files
        $files = $validated['files'];

        // Validate each file individually
        foreach ($files as $file) {
            if (!$this->dossierDocumentService->validateFileType($file)) {
                return response()->json([
                    'message' => "Invalid file type for file: {$file->getClientOriginalName()}. Only PDF, JPG, PNG files are allowed.",
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            if (!$this->dossierDocumentService->validateFileSize($file)) {
                return response()->json([
                    'message' => "File size too large for file: {$file->getClientOriginalName()}. Maximum size is 4MB.",
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        // Upload multiple files as a single document
        $document = $this->dossierDocumentService->uploadMultipleFiles(
            dossier: $dossier,
            files: $files,
            documentType: DocumentType::from($validated['document_type']),
            name: $validated['name'],
            description: $validated['description'] ?? null
        );

        $filesCount = count($files);
        $message = $filesCount === 1
            ? 'Document uploaded successfully.'
            : "Document with {$filesCount} files uploaded successfully.";

        return response()->json([
            'message' => $message,
            'data' => new DossierDocumentResource($document),
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified document.
     */
    public function show(int $dossierId, int $documentId): JsonResponse
    {
        $dossier = $this->visaDossierService->findDossier($dossierId);

        if (!$dossier) {
            return response()->json([
                'message' => 'Dossier not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        $document = $this->dossierDocumentService->findDocument($documentId, $dossier);

        if (!$document) {
            return response()->json([
                'message' => 'Document not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'data' => new DossierDocumentResource($document),
        ]);
    }

    /**
     * Remove the specified document.
     */
    public function destroy(int $dossierId, int $documentId): JsonResponse
    {
        $dossier = $this->visaDossierService->findDossier($dossierId);

        if (!$dossier) {
            return response()->json([
                'message' => 'Dossier not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        $document = $this->dossierDocumentService->findDocument($documentId, $dossier);

        if (!$document) {
            return response()->json([
                'message' => 'Document not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        $this->dossierDocumentService->deleteDocument($document);

        return response()->json([
            'message' => 'Document deleted successfully.',
        ]);
    }

    /**
     * Download the specified document.
     */
    public function download(int $dossierId, int $documentId): BinaryFileResponse|JsonResponse
    {
        $dossier = $this->visaDossierService->findDossier($dossierId);

        if (!$dossier) {
            return response()->json([
                'message' => 'Dossier not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        $document = $this->dossierDocumentService->findDocument($documentId, $dossier);

        if (!$document) {
            return response()->json([
                'message' => 'Document not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        $media = $document->getFirstMedia('documents');

        if (!$media) {
            return response()->json([
                'message' => 'File not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->download($media->getPath(), $document->original_filename);
    }

    /**
     * Get available document types.
     */
    public function types(): JsonResponse
    {
        $documentTypes = collect(DocumentType::cases())->map(function (DocumentType $type) {
            return [
                'value' => $type->value,
                'label' => $type->label(),
            ];
        });

        return response()->json([
            'data' => $documentTypes,
        ]);
    }
}
