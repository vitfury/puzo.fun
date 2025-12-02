<?php

use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\Admin\AdminActivityController;
use App\Http\Controllers\Api\Admin\AdminEquipmentController;
use App\Http\Controllers\Api\Admin\AdminSettingsController;
use App\Http\Controllers\Api\AdminGenreController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GenreController;
use App\Http\Controllers\Api\LocalizationController;
use App\Http\Controllers\Api\PointController;
use App\Http\Controllers\Api\RatingController;
use App\Http\Controllers\Api\ShopController;
use App\Http\Controllers\Api\ProfileChartsController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\OnboardingController;
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

        // Onboarding routes
        Route::post('/onboarding/complete', [OnboardingController::class, 'complete'])->name('onboarding.complete');

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
            Route::get('/streaks', [ActivityController::class, 'streaks'])->name('streaks');
            Route::get('/favorites', [ActivityController::class, 'getFavorites'])->name('favorites');
            Route::post('/{id}/favorite', [ActivityController::class, 'toggleFavorite'])->name('favorite.toggle');
        });

        // Stats routes
        Route::prefix('stats')->name('stats.')->group(function () {
            Route::post('/steps', [StatsController::class, 'updateSteps'])->name('updateSteps');
        });

        // Profile charts data
        Route::get('/profile/charts', [ProfileChartsController::class, 'index'])->name('profile.charts');

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

        // Shop routes
        Route::prefix('shop')->name('shop.')->group(function () {
            Route::get('/', [ShopController::class, 'index'])->name('index');
            Route::get('/inventory', [ShopController::class, 'inventory'])->name('inventory');
            Route::post('/purchase/{equipment}', [ShopController::class, 'purchase'])->name('purchase');
            Route::post('/sell/{equipment}', [ShopController::class, 'sell'])->name('sell');
            Route::post('/equip/{equipment}', [ShopController::class, 'equip'])->name('equip');
            Route::post('/unequip', [ShopController::class, 'unequip'])->name('unequip');
            Route::get('/level-progress', [ShopController::class, 'levelProgress'])->name('level-progress');
            Route::get('/coins/history', [ShopController::class, 'coinHistory'])->name('coins.history');
        });

        // Rating routes
        Route::get('/rating', [RatingController::class, 'index'])->name('rating.index');

        // Admin routes
        Route::prefix('admin')->name('admin.')->middleware('admin')->group(function () {
            Route::apiResource('activities', AdminActivityController::class);
            Route::apiResource('genres', AdminGenreController::class);
            
            // Equipment management
            Route::apiResource('equipment', AdminEquipmentController::class);
            Route::post('equipment/bulk-prices', [AdminEquipmentController::class, 'bulkUpdatePrices'])
                ->name('equipment.bulk-prices');

            // Game settings management
            Route::prefix('settings')->name('settings.')->group(function () {
                Route::get('/', [AdminSettingsController::class, 'index'])->name('index');
                Route::get('/group/{group}', [AdminSettingsController::class, 'byGroup'])->name('byGroup');
                Route::put('/{key}', [AdminSettingsController::class, 'update'])->name('update');
                Route::post('/bulk', [AdminSettingsController::class, 'bulkUpdate'])->name('bulk');
                
                // Dev tools - user stats modification
                Route::get('/user-stats', [AdminSettingsController::class, 'getCurrentUserStats'])->name('user-stats');
                Route::post('/user-stats', [AdminSettingsController::class, 'updateUserStats'])->name('user-stats.update');
                Route::post('/user-race', [AdminSettingsController::class, 'updateUserRace'])->name('user-race.update');
            });

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
