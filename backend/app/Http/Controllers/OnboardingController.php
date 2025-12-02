<?php

namespace App\Http\Controllers;

use App\Http\Requests\OnboardingRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;

class OnboardingController extends Controller
{
    public function complete(OnboardingRequest $request): JsonResponse
    {
        $user = $request->user();

        $user->update([
            'birth_date' => $request->birth_date,
            'weight' => $request->weight,
            'height' => $request->height,
            'race' => $request->race,
            'activity_preference' => $request->activity_preference,
            'onboarding_completed' => true,
            'weight_updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Onboarding completed successfully',
            'user' => new UserResource($user),
        ]);
    }
}
