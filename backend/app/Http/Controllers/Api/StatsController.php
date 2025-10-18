<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailyStat;
use App\Services\PointService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function __construct(
        private PointService $pointService
    ) {
    }

    public function updateSteps(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'steps' => 'required|integer|min:0',
            'date' => 'nullable|date',
        ]);

        $user = $request->user();
        $date = isset($validated['date']) ? Carbon::parse($validated['date']) : Carbon::today();
        $steps = $validated['steps'];

        $result = DB::transaction(function () use ($user, $date, $steps) {
            $dailyStat = DailyStat::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'date' => $date,
                ],
                [
                    'steps' => 0,
                    'calories_burned' => 0,
                    'calories_consumed' => 0,
                    'points_earned' => 0,
                    'activities_completed' => 0,
                ]
            );

            $oldSteps = $dailyStat->steps;
            $dailyStat->steps = $steps;
            $dailyStat->save();

            // Calculate bonus points for new steps
            $oldBonus = floor($oldSteps / 1000) * 10;
            $newBonus = floor($steps / 1000) * 10;
            $bonusDiff = $newBonus - $oldBonus;

            $transaction = null;
            if ($bonusDiff > 0) {
                $transaction = $this->pointService->awardStepBonus($user->refresh(), $steps);
                $dailyStat->increment('points_earned', $bonusDiff);
            } elseif ($bonusDiff < 0) {
                $transaction = $this->pointService->deductPoints(
                    user: $user->refresh(),
                    amount: abs($bonusDiff),
                    reason: 'Step bonus adjustment',
                    metadata: ['steps' => $steps, 'old_steps' => $oldSteps]
                );
                $dailyStat->decrement('points_earned', abs($bonusDiff));
            }

            return [
                'dailyStat' => $dailyStat,
                'bonusPoints' => $bonusDiff,
                'transaction' => $transaction,
            ];
        });

        return response()->json([
            'message' => 'Steps updated successfully!',
            'steps' => $steps,
            'bonus_points' => $result['bonusPoints'],
            'total_points' => $user->refresh()->total_points,
        ]);
    }
}
