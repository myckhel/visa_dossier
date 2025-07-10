<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TokenResource;
use App\Services\TokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TokenController extends Controller
{
    public function __construct(
        private readonly TokenService $tokenService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $tokens = $this->tokenService->getUserTokens($request->user());

        return response()->json([
            'tokens' => TokenResource::collection($tokens)
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'abilities' => 'array',
            'abilities.*' => 'string',
        ]);

        $token = $this->tokenService->createToken(
            $request->user(),
            $request->input('name'),
            $request->input('abilities', ['*'])
        );

        return response()->json([
            'token' => $token,
            'message' => 'Token created successfully'
        ], 201);
    }

    public function destroy(Request $request, int $tokenId): JsonResponse
    {
        try {
            $this->tokenService->revokeToken($request->user(), $tokenId);

            return response()->json([
                'message' => 'Token revoked successfully'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 404);
        }
    }
}
