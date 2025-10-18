<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityResource;
use App\Http\Resources\DailyStatResource;
use App\Models\Activity;
use App\Models\DailyStat;
use App\Models\UserActivityLog;
use App\Services\PointService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class ActivityController extends Controller
{
    public function __construct(
        private PointService $pointService
    ) {
    }
    public function today(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $today = Carbon::today();

        $activities = Activity::with('translations')
            ->activeOnDate($today)
            ->ordered()
            ->get();

        $completedActivityIds = UserActivityLog::forUser($user->id)
            ->forDate($today)
            ->pluck('activity_id')
            ->toArray();

        $activities->transform(function ($activity) use ($completedActivityIds, $user, $today) {
            $log = UserActivityLog::where('user_id', $user->id)
                ->where('activity_id', $activity->id)
                ->whereDate('date', $today)
                ->first();

            $activity->is_completed = in_array($activity->id, $completedActivityIds);
            $activity->completed_at = $log?->completed_at;
            return $activity;
        });

        return ActivityResource::collection($activities);
    }

    public function complete(Request $request, int $activityId): JsonResponse
    {
        $user = $request->user();
        $today = Carbon::today();
        $now = Carbon::now();

        $activity = Activity::findOrFail($activityId);

        if (!$activity->isActiveOnDate($today)) {
            return response()->json([
                'message' => 'This activity is not available today.',
            ], 422);
        }

        $existingLog = UserActivityLog::where('user_id', $user->id)
            ->where('activity_id', $activityId)
            ->whereDate('date', $today)
            ->first();

        if ($existingLog) {
            return response()->json([
                'message' => 'Activity already completed today.',
            ], 422);
        }

        DB::transaction(function () use ($user, $activity, $today, $now) {
            $log = UserActivityLog::create([
                'user_id' => $user->id,
                'activity_id' => $activity->id,
                'date' => $today,
                'completed_at' => $now,
            ]);

            $this->pointService->awardActivityPoints($user, $activity);

            $dailyStat = DailyStat::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'date' => $today,
                ],
                [
                    'steps' => 0,
                    'calories_burned' => 0,
                    'calories_consumed' => 0,
                    'points_earned' => 0,
                    'activities_completed' => 0,
                ]
            );

            $dailyStat->incrementActivitiesCompleted($activity->points);

            // Update streak on first activity of the day
            if ($dailyStat->activities_completed === 1) {
                $user->refresh();
                $user->updateStreak($today);
            }
        });

        return response()->json([
            'message' => 'Activity completed successfully!',
            'points_earned' => $activity->points,
        ]);
    }

    public function uncomplete(Request $request, int $activityId): JsonResponse
    {
        $user = $request->user();
        $today = Carbon::today();

        $activity = Activity::findOrFail($activityId);

        $log = UserActivityLog::where('user_id', $user->id)
            ->where('activity_id', $activityId)
            ->whereDate('date', $today)
            ->first();

        if (!$log) {
            return response()->json([
                'message' => 'Activity is not completed.',
            ], 422);
        }

        DB::transaction(function () use ($user, $activity, $log, $today) {
            $log->delete();

            $this->pointService->deductPoints(
                user: $user,
                amount: $activity->points,
                reason: "Uncompleted activity: {$activity->name}",
                source: $activity
            );

            $dailyStat = DailyStat::forUser($user->id)
                ->forDate($today)
                ->first();

            if ($dailyStat) {
                $dailyStat->decrement('activities_completed');
                $dailyStat->decrement('points_earned', $activity->points);
            }
        });

        return response()->json([
            'message' => 'Activity uncompleted successfully.',
        ]);
    }

    public function history(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $days = $request->input('days', 30);
        $startDate = Carbon::today()->subDays($days);

        $stats = DailyStat::forUser($user->id)
            ->where('date', '>=', $startDate)
            ->orderBy('date', 'desc')
            ->get();

        return DailyStatResource::collection($stats);
    }
}
