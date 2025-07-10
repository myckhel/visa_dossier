<?php

namespace App\Http\Controllers\Api;

use App\Enums\VisaType;
use App\Http\Controllers\Controller;
use App\Http\Requests\DossierCreateRequest;
use App\Http\Requests\DossierUpdateRequest;
use App\Http\Resources\VisaDossierCollection;
use App\Http\Resources\VisaDossierResource;
use App\Models\VisaDossier;
use App\Services\VisaDossierService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class VisaDossierController extends Controller
{
    public function __construct(
        private readonly VisaDossierService $visaDossierService
    ) {}

    /**
     * Display a listing of dossiers.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->integer('per_page', 15);

        if ($request->has('per_page')) {
            $dossiers = $this->visaDossierService->getUserDossiersPaginated(
                perPage: $perPage
            );
            return (new VisaDossierCollection($dossiers))->response();
        }

        $dossiers = $this->visaDossierService->getUserDossiers();
        return response()->json(new VisaDossierCollection($dossiers));
    }

    /**
     * Store a newly created dossier.
     */
    public function store(DossierCreateRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $dossier = $this->visaDossierService->createDossier(
            passportNumber: $validated['passport_number'],
            nationality: $validated['nationality'],
            dateOfBirth: $validated['date_of_birth'],
            visaType: VisaType::from($validated['visa_type']),
            additionalData: $validated['additional_data'] ?? null
        );

        return response()->json([
            'message' => 'Dossier created successfully.',
            'data' => new VisaDossierResource($dossier),
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified dossier.
     */
    public function show(int $id): JsonResponse
    {
        $dossier = $this->visaDossierService->findDossier($id);

        if (!$dossier) {
            return response()->json([
                'message' => 'Dossier not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'data' => new VisaDossierResource($dossier),
        ]);
    }

    /**
     * Update the specified dossier.
     */
    public function update(DossierUpdateRequest $request, int $id): JsonResponse
    {
        $validated = $request->validated();

        $dossier = $this->visaDossierService->findDossier($id);

        if (!$dossier) {
            return response()->json([
                'message' => 'Dossier not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        $updatedDossier = $this->visaDossierService->updateDossier($dossier, $validated);

        return response()->json([
            'message' => 'Dossier updated successfully.',
            'data' => new VisaDossierResource($updatedDossier),
        ]);
    }

    /**
     * Remove the specified dossier.
     */
    public function destroy(int $id): JsonResponse
    {
        $dossier = $this->visaDossierService->findDossier($id);

        if (!$dossier) {
            return response()->json([
                'message' => 'Dossier not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        $this->visaDossierService->deleteDossier($dossier);

        return response()->json([
            'message' => 'Dossier deleted successfully.',
        ]);
    }
}
