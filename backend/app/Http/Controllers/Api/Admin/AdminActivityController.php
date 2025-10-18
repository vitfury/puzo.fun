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
        $activity = Activity::create($request->validated());
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
        $activity->update($request->validated());
        return new ActivityResource($activity);
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
