<?php

use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\Admin\AdminActivityController;
use App\Http\Controllers\Api\AdminGenreController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GenreController;
use App\Http\Controllers\Api\LocalizationController;
use App\Http\Controllers\Api\PointController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\V1\HealthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// API V1 Routes
Route::prefix('v1')->name('v1.')->group(function () {

    // Public routes
    Route::get('/health', [HealthController::class, 'index'])->name('health');

    // Public localizations endpoint (for all users)
    Route::get('/localizations', [LocalizationController::class, 'index'])->name('localizations.public');

    // Authentication routes
    Route::prefix('auth')->name('auth.')->group(function () {
        Route::post('/register', [AuthController::class, 'register'])->name('register');
        Route::post('/login', [AuthController::class, 'login'])->name('login');
        Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum')->name('logout');
        Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum')->name('me');
        Route::put('/health', [AuthController::class, 'updateHealth'])->middleware('auth:sanctum')->name('health.update');
    });

    // Protected routes
    Route::middleware(['auth:sanctum'])->group(function () {

        // User routes
        Route::get('/user', function (Request $request) {
            return response()->json([
                'success' => true,
                'data' => $request->user(),
            ]);
        })->name('user');

        // Activity routes
        Route::prefix('activities')->name('activities.')->group(function () {
            Route::get('/today', [ActivityController::class, 'today'])->name('today');
            Route::post('/{id}/complete', [ActivityController::class, 'complete'])->name('complete');
            Route::delete('/{id}/complete', [ActivityController::class, 'uncomplete'])->name('uncomplete');
            Route::get('/history', [ActivityController::class, 'history'])->name('history');
        });

        // Stats routes
        Route::prefix('stats')->name('stats.')->group(function () {
            Route::post('/steps', [StatsController::class, 'updateSteps'])->name('updateSteps');
        });

        // Points routes
        Route::prefix('points')->name('points.')->group(function () {
            Route::get('/transactions', [PointController::class, 'transactions'])->name('transactions');
            Route::get('/balance', [PointController::class, 'balance'])->name('balance');
        });

        // Genre routes
        Route::prefix('genres')->name('genres.')->group(function () {
            Route::get('/tree', [GenreController::class, 'tree'])->name('tree');
            Route::get('/{genre}', [GenreController::class, 'show'])->name('show');
            Route::post('/{genre}/complete', [GenreController::class, 'complete'])->name('complete');
            Route::post('/{genre}/comments', [GenreController::class, 'addComment'])->name('comments.store');
        });

        // Admin routes
        Route::prefix('admin')->name('admin.')->middleware('admin')->group(function () {
            Route::apiResource('activities', AdminActivityController::class);
            Route::apiResource('genres', AdminGenreController::class);

            // Localization management
            Route::prefix('localizations')->name('localizations.')->group(function () {
                Route::get('/', [LocalizationController::class, 'index'])->name('index');
                Route::get('/{locale}', [LocalizationController::class, 'show'])->name('show');
                Route::put('/{locale}', [LocalizationController::class, 'update'])->name('update');
                Route::post('/update-key', [LocalizationController::class, 'updateKey'])->name('updateKey');
            });
        });

        // Feature routes will be added here as development progresses
        // - Food diary
        // - Rewards
        // - etc.
    });
});

// Legacy health check (for backwards compatibility)
Route::get('/health', [HealthController::class, 'index']);
