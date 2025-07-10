<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DossierDocumentController;
use App\Http\Controllers\Api\TokenController;
use App\Http\Controllers\Api\VisaDossierController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes (no authentication required)
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

// Protected routes (authentication required)
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('user', [AuthController::class, 'user']);
    });

    // Token management routes
    Route::prefix('tokens')->group(function () {
        Route::get('/', [TokenController::class, 'index']);
        Route::post('/', [TokenController::class, 'store']);
        Route::delete('{tokenId}', [TokenController::class, 'destroy']);
    });

    // Dossier routes
    Route::prefix('dossiers')->group(function () {
        Route::get('/', [VisaDossierController::class, 'index']);
        Route::post('/', [VisaDossierController::class, 'store']);
        Route::get('/{id}', [VisaDossierController::class, 'show']);
        Route::put('/{id}', [VisaDossierController::class, 'update']);
        Route::delete('/{id}', [VisaDossierController::class, 'destroy']);

        // Document routes within dossiers
        Route::prefix('{dossier}/documents')->group(function () {
            Route::get('/', [DossierDocumentController::class, 'index']);
            Route::post('/', [DossierDocumentController::class, 'store']);
            Route::get('/types', [DossierDocumentController::class, 'types']);
            Route::get('/{document}', [DossierDocumentController::class, 'show']);
            Route::get('/{document}/download', [DossierDocumentController::class, 'download']);
            Route::delete('/{document}', [DossierDocumentController::class, 'destroy']);
        });
    });

    // Example protected route
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});
