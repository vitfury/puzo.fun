<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreActivityRequest;
use App\Http\Requests\UpdateActivityRequest;
use App\Http\Resources\ActivityResource;
use App\Models\Activity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminActivityController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $activities = Activity::ordered()->get();
        return ActivityResource::collection($activities);
    }

    public function store(StoreActivityRequest $request): ActivityResource
    {
        $validated = $request->validated();
        $activity = Activity::create($validated);
        
        // Create translations for all locales
        $locales = ['en', 'uk'];
        foreach ($locales as $locale) {
            $activity->translations()->create([
                'locale' => $locale,
                'name' => $validated['name'] ?? '',
                'description' => $validated['description'] ?? '',
            ]);
        }
        
        return new ActivityResource($activity);
    }

    public function show(int $id): ActivityResource
    {
        $activity = Activity::findOrFail($id);
        return new ActivityResource($activity);
    }

    public function update(UpdateActivityRequest $request, int $id): ActivityResource
    {
        $activity = Activity::findOrFail($id);
        $validated = $request->validated();
        
        $activity->update($validated);
        
        // Also update translations if name or description changed
        if (isset($validated['name']) || isset($validated['description'])) {
            $locales = ['en', 'uk'];
            foreach ($locales as $locale) {
                $translationData = [];
                if (isset($validated['name'])) {
                    $translationData['name'] = $validated['name'];
                }
                if (isset($validated['description'])) {
                    $translationData['description'] = $validated['description'];
                }
                
                if (!empty($translationData)) {
                    $activity->translations()->updateOrCreate(
                        ['locale' => $locale],
                        $translationData
                    );
                }
            }
        }
        
        return new ActivityResource($activity->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $activity = Activity::findOrFail($id);
        $activity->delete();

        return response()->json([
            'message' => 'Activity deleted successfully.',
        ]);
    }
}
