<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityResource;
use App\Http\Resources\DailyStatResource;
use App\Models\Activity;
use App\Models\ActivityStreak;
use App\Models\DailyStat;
use App\Models\UserActivityLog;
use App\Services\CoinService;
use App\Services\PointService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class ActivityController extends Controller
{
    public function __construct(
        private PointService $pointService,
        private CoinService $coinService
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

        $favoriteActivityIds = $user->favoriteActivities()->pluck('activities.id')->toArray();

        // Get favorites with their created_at timestamps
        $favoritesWithTimestamps = $user->favoriteActivities()
            ->select('activities.id', 'user_favorite_activities.created_at as added_at')
            ->get()
            ->keyBy('id');

        $activities->transform(function ($activity) use ($completedActivityIds, $favoriteActivityIds, $favoritesWithTimestamps, $user, $today) {
            $log = UserActivityLog::where('user_id', $user->id)
                ->where('activity_id', $activity->id)
                ->whereDate('date', $today)
                ->first();

            $activity->is_completed = in_array($activity->id, $completedActivityIds);
            $activity->completed_at = $log?->completed_at;
            $activity->is_favorite = in_array($activity->id, $favoriteActivityIds);

            // Add timestamp when activity was added to favorites
            $favorite = $favoritesWithTimestamps->get($activity->id);
            $activity->added_to_favorites_at = $favorite?->added_at;

            return $activity;
        });

        return ActivityResource::collection($activities);
    }

    /**
     * Toggle favorite status for an activity
     */
    public function toggleFavorite(Request $request, int $activityId): JsonResponse
    {
        $user = $request->user();
        $activity = Activity::findOrFail($activityId);

        $isFavorite = $user->favoriteActivities()->where('activity_id', $activityId)->exists();

        if ($isFavorite) {
            $user->favoriteActivities()->detach($activityId);
            $newStatus = false;
        } else {
            $user->favoriteActivities()->attach($activityId);
            $newStatus = true;
        }

        return response()->json([
            'message' => $newStatus ? 'Activity added to favorites' : 'Activity removed from favorites',
            'is_favorite' => $newStatus,
        ]);
    }

    /**
     * Get all favorite activity IDs
     */
    public function getFavorites(Request $request): JsonResponse
    {
        $user = $request->user();
        $favoriteIds = $user->favoriteActivities()->pluck('activities.id')->toArray();

        return response()->json([
            'data' => $favoriteIds,
        ]);
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

        $streakBonus = null;
        
        DB::transaction(function () use ($user, $activity, $today, $now, &$streakBonus) {
            $log = UserActivityLog::create([
                'user_id' => $user->id,
                'activity_id' => $activity->id,
                'date' => $today,
                'completed_at' => $now,
            ]);

            // Award experience points if activity has experience
            if ($activity->experience > 0) {
                $this->pointService->awardPoints(
                    user: $user,
                    amount: $activity->experience,
                    reason: "Completed activity: {$activity->name}",
                    source: $activity
                );
            }

            // Award coins if activity has coins
            if ($activity->coins > 0) {
                $this->coinService->awardCoins(
                    user: $user,
                    amount: $activity->coins,
                    reason: "Completed activity: {$activity->name}",
                    source: $activity
                );
            }

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

            // Track both coins and experience in daily stats
            $dailyStat->incrementActivitiesCompleted($activity->experience);

            // Update activity streak
            $streak = ActivityStreak::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'activity_id' => $activity->id,
                ],
                [
                    'current_streak' => 0,
                    'longest_streak' => 0,
                    'total_completions' => 0,
                ]
            );
            
            $streak->recordCompletion($today);
            
            // Check for streak milestone bonus
            if ($streak->isAtMilestone()) {
                $bonus = $streak->getMilestoneBonus();
                if ($bonus) {
                    $streakBonus = [
                        'streak' => $streak->current_streak,
                        'coins' => $bonus['coins'],
                        'experience' => $bonus['experience'],
                    ];
                    
                    // Award streak bonus coins
                    $this->coinService->awardCoins(
                        user: $user,
                        amount: $bonus['coins'],
                        reason: "Streak bonus ({$streak->current_streak} days): {$activity->name}",
                        source: $activity
                    );
                    
                    // Award streak bonus experience
                    $this->pointService->awardPoints(
                        user: $user,
                        amount: $bonus['experience'],
                        reason: "Streak bonus ({$streak->current_streak} days): {$activity->name}",
                        source: $activity
                    );
                }
            }

            // Update music walk streak for music_walk activities (legacy support)
            if ($activity->type === 'music_walk') {
                $user->refresh();
                $user->updateMusicWalkStreak($today);

                // Check and award streak bonuses
                $this->coinService->checkAndAwardStreakBonus($user);
            }
        });

        $user->refresh();

        $response = [
            'message' => 'Activity completed successfully!',
            'experience_earned' => $activity->experience,
            'coins_earned' => $activity->coins,
            'new_level' => $user->level,
            'new_total_points' => $user->total_points,
            'new_coins' => $user->coins,
        ];
        
        if ($streakBonus) {
            $response['streak_bonus'] = $streakBonus;
        }
        
        return response()->json($response);
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

            // Deduct experience if activity had experience
            if ($activity->experience > 0) {
                $this->pointService->deductPoints(
                    user: $user,
                    amount: $activity->experience,
                    reason: "Uncompleted activity: {$activity->name}",
                    source: $activity
                );
            }

            // Deduct coins if activity had coins
            if ($activity->coins > 0) {
                $this->coinService->deductCoins(
                    user: $user,
                    amount: $activity->coins,
                    reason: "Uncompleted activity: {$activity->name}",
                    source: $activity
                );
            }

            $dailyStat = DailyStat::forUser($user->id)
                ->forDate($today)
                ->first();

            if ($dailyStat) {
                $dailyStat->decrement('activities_completed');
                $dailyStat->decrement('points_earned', $activity->experience);
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

    /**
     * Get streak information for all activities
     */
    public function streaks(Request $request): JsonResponse
    {
        $user = $request->user();
        $today = Carbon::today();
        
        // Get all active activities
        $activities = Activity::with('translations')
            ->activeOnDate($today)
            ->ordered()
            ->get();
        
        // Get user's streaks
        $userStreaks = ActivityStreak::where('user_id', $user->id)
            ->get()
            ->keyBy('activity_id');
        
        $streaksData = [];
        $milestones = ActivityStreak::getStreakMilestones();
        
        foreach ($activities as $activity) {
            $streak = $userStreaks->get($activity->id);
            
            // Get next milestone
            $currentStreak = $streak?->current_streak ?? 0;
            $nextMilestone = null;
            foreach ($milestones as $milestone) {
                if ($milestone > $currentStreak) {
                    $nextMilestone = $milestone;
                    break;
                }
            }
            
            // Get bonus for next milestone
            $tempStreak = new ActivityStreak(['current_streak' => $nextMilestone]);
            $nextBonus = $nextMilestone ? $tempStreak->getMilestoneBonus() : null;
            
            $streaksData[] = [
                'activity_id' => $activity->id,
                'activity_name' => $activity->getTranslation(substr($request->header('Accept-Language', 'en'), 0, 2))?->name ?? $activity->name,
                'activity_type' => $activity->type,
                'current_streak' => $currentStreak,
                'longest_streak' => $streak?->longest_streak ?? 0,
                'total_completions' => $streak?->total_completions ?? 0,
                'last_completed' => $streak?->last_completed_date?->format('Y-m-d'),
                'next_milestone' => $nextMilestone,
                'next_milestone_bonus' => $nextBonus,
                'days_to_next_milestone' => $nextMilestone ? $nextMilestone - $currentStreak : null,
            ];
        }
        
        // Sort by current streak (descending)
        usort($streaksData, fn($a, $b) => $b['current_streak'] <=> $a['current_streak']);
        
        // Calculate summary
        $totalCurrentStreak = array_sum(array_column($streaksData, 'current_streak'));
        $maxStreak = max(array_column($streaksData, 'current_streak') ?: [0]);
        $activitiesWithStreak = count(array_filter($streaksData, fn($s) => $s['current_streak'] > 0));
        
        return response()->json([
            'data' => [
                'streaks' => $streaksData,
                'summary' => [
                    'total_current_streak' => $totalCurrentStreak,
                    'max_current_streak' => $maxStreak,
                    'activities_with_streak' => $activitiesWithStreak,
                    'total_activities' => count($streaksData),
                ],
                'milestones' => array_map(function ($days) {
                    $tempStreak = new ActivityStreak(['current_streak' => $days]);
                    return [
                        'days' => $days,
                        'bonus' => $tempStreak->getMilestoneBonus(),
                    ];
                }, $milestones),
            ],
        ]);
    }
}
