<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityResource;
use App\Http\Resources\DailyStatResource;
use App\Models\Activity;
use App\Models\ActivityStreak;
use App\Models\CoinTransaction;
use App\Models\DailyStat;
use App\Models\PointTransaction;
use App\Models\User;
use App\Models\UserActivityLog;
use App\Services\CoinService;
use App\Services\PointService;
use App\Services\StreakService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
        
        // Allow date parameter to get activities for a specific date (up to 7 days ago)
        $requestedDate = $request->input('date');
        if ($requestedDate) {
            try {
                $date = Carbon::parse($requestedDate)->startOfDay();
        $today = Carbon::today();
                $sevenDaysAgo = $today->copy()->subDays(7);
                
                // Only allow dates from 7 days ago to today
                if ($date->isAfter($today) || $date->isBefore($sevenDaysAgo)) {
                    abort(422, 'Date must be within the last 7 days.');
                }
            } catch (\Exception $e) {
                abort(422, 'Invalid date format.');
            }
        } else {
            $date = Carbon::today();
        }

        $activities = Activity::with('translations')
            ->activeOnDate($date)
            ->ordered()
            ->get();

        $completedActivityIds = UserActivityLog::forUser($user->id)
            ->forDate($date)
            ->pluck('activity_id')
            ->toArray();

        $favoriteActivityIds = $user->favoriteActivities()->pluck('activities.id')->toArray();

        // Get favorites with their created_at timestamps
        $favoritesWithTimestamps = $user->favoriteActivities()
            ->select('activities.id', 'user_favorite_activities.created_at as added_at')
            ->get()
            ->keyBy('id');

        $activities->transform(function ($activity) use ($completedActivityIds, $favoriteActivityIds, $favoritesWithTimestamps, $user, $date) {
            $log = UserActivityLog::where('user_id', $user->id)
                ->where('activity_id', $activity->id)
                ->whereDate('date', $date)
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
        
        // Allow date parameter to complete activity for a specific date (up to 7 days ago)
        $requestedDate = $request->input('date');
        if ($requestedDate) {
            try {
                $date = Carbon::parse($requestedDate)->startOfDay();
        $today = Carbon::today();
                $sevenDaysAgo = $today->copy()->subDays(7);
                
                // Only allow dates from 7 days ago to today
                if ($date->isAfter($today) || $date->isBefore($sevenDaysAgo)) {
                    return response()->json([
                        'message' => 'Date must be within the last 7 days.',
                    ], 422);
                }
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Invalid date format.',
                ], 422);
            }
        } else {
            $date = Carbon::today();
        }
        
        $now = Carbon::now();

        $activity = Activity::findOrFail($activityId);

        if (!$activity->isActiveOnDate($date)) {
            return response()->json([
                'message' => 'This activity is not available for the selected date.',
            ], 422);
        }

        $existingLog = UserActivityLog::where('user_id', $user->id)
            ->where('activity_id', $activityId)
            ->whereDate('date', $date)
            ->first();

        if ($existingLog) {
            return response()->json([
                'message' => 'Activity already completed for this date.',
            ], 422);
        }

        $streakBonus = null;
        
        DB::transaction(function () use ($user, $activity, $date, $now, &$streakBonus) {
            $log = UserActivityLog::create([
                'user_id' => $user->id,
                'activity_id' => $activity->id,
                'date' => $date,
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
            
            $streak->recordCompletion($date);
            
            // Check for streak milestone bonus
            if ($streak->isAtMilestone()) {
                $bonus = $streak->getMilestoneBonus();
                if ($bonus) {
                    $streakBonus = [
                        'streak' => $streak->current_streak,
                        'coins' => $bonus['coins'],
                        'experience' => $bonus['experience'],
                    ];
                    
                    // Determine if this is weekly training
                    $isWeeklyTraining = ActivityStreak::isWeeklyTrainingActivity($activity);
                    $streakUnit = $isWeeklyTraining ? 'weeks' : 'days';
                    
                    // Award streak bonus coins
                    $this->coinService->awardCoins(
                        user: $user,
                        amount: $bonus['coins'],
                        reason: "Streak bonus ({$streak->current_streak} {$streakUnit}): {$activity->name}",
                        source: $activity
                    );
                    
                    // Award streak bonus experience
                    $this->pointService->awardPoints(
                        user: $user,
                        amount: $bonus['experience'],
                        reason: "Streak bonus ({$streak->current_streak} {$streakUnit}): {$activity->name}",
                        source: $activity
                    );
                }
            }

            // Music walk activities now use ActivityStreak system like other activities
            // Legacy music_walk streak tracking is kept for backward compatibility but bonuses come from ActivityStreak
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
        
        // Allow date parameter to uncomplete activity for a specific date (up to 7 days ago)
        $requestedDate = $request->input('date');
        if ($requestedDate) {
            try {
                $date = Carbon::parse($requestedDate)->startOfDay();
        $today = Carbon::today();
                $sevenDaysAgo = $today->copy()->subDays(7);
                
                // Only allow dates from 7 days ago to today
                if ($date->isAfter($today) || $date->isBefore($sevenDaysAgo)) {
                    return response()->json([
                        'message' => 'Date must be within the last 7 days.',
                    ], 422);
                }
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Invalid date format.',
                ], 422);
            }
        } else {
            $date = Carbon::today();
        }

        $activity = Activity::findOrFail($activityId);

        $log = UserActivityLog::where('user_id', $user->id)
            ->where('activity_id', $activityId)
            ->whereDate('date', $date)
            ->first();

        if (!$log) {
            return response()->json([
                'message' => 'Activity is not completed for this date.',
            ], 422);
        }

        try {
            DB::transaction(function () use ($user, $activity, $log, $date) {
                // Delete ALL transactions (both positive and negative) for this activity on this date
                $searchDate = $date->toDateString();
                
                // Find and delete ALL coin transactions for this activity on this date
                // This includes both "Completed activity" and "Uncompleted activity" transactions
                $allCoinTransactions = CoinTransaction::where('user_id', $user->id)
                    ->where('source_type', get_class($activity))
                    ->where('source_id', $activity->id)
                    ->whereDate('created_at', $searchDate)
                    ->where('created_at', '<=', now())
                    ->get();

                // Calculate net change: sum of all transactions (positive and negative)
                // If net change is positive, we need to subtract it from balance
                // If net change is negative, we need to add it to balance (subtract negative = add)
                $totalCoinChange = 0;
                foreach ($allCoinTransactions as $tx) {
                    $totalCoinChange += $tx->amount;
                    $tx->delete();
                }

                // Adjust user's coin balance: subtract the net change
                // If net change was +20, we subtract 20 (decrement)
                // If net change was -20, we subtract -20 = add 20 (increment)
                if ($totalCoinChange != 0) {
                    $user->decrement('coins', $totalCoinChange);
                }

                // Find and delete ALL point transactions for this activity on this date
                $allPointTransactions = PointTransaction::where('user_id', $user->id)
                    ->where('source_type', get_class($activity))
                    ->where('source_id', $activity->id)
                    ->whereDate('created_at', $searchDate)
                    ->where('created_at', '<=', now())
                    ->get();

                // Calculate net change for points
                $totalPointChange = 0;
                foreach ($allPointTransactions as $tx) {
                    $totalPointChange += $tx->amount;
                    $tx->delete();
                }

                // Adjust user's point balance: subtract the net change
                if ($totalPointChange != 0) {
                    $user->decrement('total_points', $totalPointChange);
                }

                // Recalculate user level after deleting point transactions
                $user->refresh();
                $levelService = new \App\Services\LevelService();
                $levelService->updateUserLevel($user);

                // Delete the activity log
                $log->delete();

                $dailyStat = DailyStat::forUser($user->id)
                    ->forDate($date)
                    ->first();

                if ($dailyStat) {
                    $dailyStat->decrement('activities_completed');
                    $dailyStat->decrement('points_earned', $activity->experience);
                }

                // Recalculate streak after uncompleting
                $streak = ActivityStreak::where('user_id', $user->id)
                    ->where('activity_id', $activity->id)
                    ->first();

                if ($streak) {
                    $streakService = new StreakService();
                    
                    // Store old streak value before recalculation
                    $oldStreak = $streak->current_streak;
                    
                    // Decrement total completions
                    $streak->total_completions = max(0, $streak->total_completions - 1);
                    
                    // Recalculate streak based on remaining completions
                    if (ActivityStreak::isWeeklyTrainingActivity($activity)) {
                        $streakService->recalculateWeeklyStreak($streak);
                    } else {
                        // For daily activities, recalculate from all remaining completions
                        $streakService->recalculateDailyStreak($streak);
                    }
                    
                    // Update last_completed_date to most recent remaining completion
                    $lastCompletion = UserActivityLog::where('user_id', $user->id)
                        ->where('activity_id', $activity->id)
                        ->orderBy('date', 'desc')
                        ->first();
                    
                    if ($lastCompletion) {
                        $streak->last_completed_date = $lastCompletion->date;
                    } else {
                        $streak->last_completed_date = null;
                    }
                    
                    $streak->save();
                    
                    // If streak decreased, deduct streak bonus coins and experience
                    $newStreak = $streak->current_streak;
                    if ($newStreak < $oldStreak) {
                        $this->deductStreakBonuses($user, $activity, $oldStreak, $newStreak);
                    }
                }
            });
        } catch (\Exception $e) {
            Log::error('Error uncompleting activity: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'activity_id' => $activityId,
                'date' => $date->toDateString(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'message' => 'Failed to uncomplete activity: ' . $e->getMessage(),
            ], 500);
        }

        $user->refresh();

        return response()->json([
            'message' => 'Activity uncompleted successfully.',
            'new_level' => $user->level,
            'new_total_points' => $user->total_points,
            'new_coins' => $user->coins,
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
            ->with('activity')
            ->get()
            ->keyBy('activity_id');
        
        // Recalculate streaks for weekly trainings to ensure they're up to date
        $streakService = new \App\Services\StreakService();
        foreach ($userStreaks as $streak) {
            if ($streak->activity && ActivityStreak::isWeeklyTrainingActivity($streak->activity)) {
                $streakService->recalculateWeeklyStreak($streak);
            }
        }
        
        $streaksData = [];
        
        foreach ($activities as $activity) {
            $streak = $userStreaks->get($activity->id);
            
            // Get appropriate milestones based on activity type
            $isWeeklyTraining = ActivityStreak::isWeeklyTrainingActivity($activity);
            $milestones = $isWeeklyTraining 
                ? ActivityStreak::getWeeklyTrainingMilestones() 
                : ActivityStreak::getStreakMilestones();
            
            // Get display streak (0 if below minimum)
            $displayStreak = $streak ? $streak->getDisplayStreak() : 0;
            $rawStreak = $streak?->current_streak ?? 0;
            
            // Get next milestone (only if display streak > 0)
            $nextMilestone = null;
            if ($displayStreak > 0) {
                foreach ($milestones as $milestone) {
                    if ($milestone > $rawStreak) {
                        $nextMilestone = $milestone;
                        break;
                    }
                }
            } else {
                // If no streak yet, next milestone is the first one
                $nextMilestone = !empty($milestones) ? $milestones[0] : null;
            }
            
            // Get bonus for next milestone
            $nextBonus = null;
            if ($nextMilestone) {
                $tempStreak = new ActivityStreak([
                    'current_streak' => $nextMilestone,
                    'activity_id' => $activity->id,
                ]);
                $tempStreak->setRelation('activity', $activity);
                $nextBonus = $tempStreak->getMilestoneBonus();
            }
            
            $streaksData[] = [
                'activity_id' => $activity->id,
                'activity_name' => $activity->getTranslation(substr($request->header('Accept-Language', 'en'), 0, 2))?->name ?? $activity->name,
                'activity_type' => $activity->type,
                'current_streak' => $displayStreak,
                'longest_streak' => $streak?->longest_streak ?? 0,
                'total_completions' => $streak?->total_completions ?? 0,
                'last_completed' => $streak?->last_completed_date?->format('Y-m-d'),
                'next_milestone' => $nextMilestone,
                'next_milestone_bonus' => $nextBonus,
                'days_to_next_milestone' => $nextMilestone && $rawStreak > 0 ? $nextMilestone - $rawStreak : null,
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
                'milestones' => array_map(function ($value) {
                    return [
                        'days' => $value,
                        'bonus' => [
                            'coins' => match($value) {
                                3 => 10, 7 => 50, 14 => 100, 21 => 200, 30 => 300, 60 => 500, 100 => 1000,
                                default => 0,
                            },
                            'experience' => match($value) {
                                3 => 5, 7 => 25, 14 => 50, 21 => 100, 30 => 150, 60 => 250, 100 => 500,
                                default => 0,
                            },
                        ],
                    ];
                }, ActivityStreak::getStreakMilestones()),
                'weekly_training_milestones' => array_map(function ($weeks) {
                    return [
                        'days' => $weeks,
                        'weeks' => $weeks,
                        'bonus' => [
                            'coins' => match($weeks) {
                                1 => 20, 2 => 50, 4 => 100, 8 => 200, 12 => 300, 24 => 500,
                                default => 0,
                            },
                            'experience' => match($weeks) {
                                1 => 10, 2 => 25, 4 => 50, 8 => 100, 12 => 150, 24 => 250,
                                default => 0,
                            },
                        ],
                    ];
                }, ActivityStreak::getWeeklyTrainingMilestones()),
            ],
        ]);
    }

    /**
     * Deduct streak bonus coins and experience when streak decreases
     */
    private function deductStreakBonuses(User $user, Activity $activity, int $oldStreak, int $newStreak): void
    {
        // Get all milestones that are no longer valid (greater than new streak but were <= old streak)
        $isWeeklyTraining = ActivityStreak::isWeeklyTrainingActivity($activity);
        $milestones = $isWeeklyTraining 
            ? StreakService::getWeeklyStreakMilestones()
            : StreakService::getDailyStreakMilestones();

        $invalidMilestones = array_filter($milestones, fn($m) => $m > $newStreak && $m <= $oldStreak);

        if (empty($invalidMilestones)) {
            return;
        }

        // Find all streak bonus transactions for this activity (both coins and points)
        $coinTransactions = CoinTransaction::where('user_id', $user->id)
            ->where('source_type', Activity::class)
            ->where('source_id', $activity->id)
            ->where('reason', 'like', 'Streak bonus%')
            ->orderBy('created_at', 'desc')
            ->get();

        $pointTransactions = PointTransaction::where('user_id', $user->id)
            ->where('source_type', Activity::class)
            ->where('source_id', $activity->id)
            ->where('reason', 'like', 'Streak bonus%')
            ->where('amount', '>', 0) // Only positive amounts (bonuses)
            ->orderBy('created_at', 'desc')
            ->get();

        // Create temporary streak objects to get bonus amounts for each milestone
        $streakService = new StreakService();
        $tempStreak = new ActivityStreak(['activity_id' => $activity->id]);
        $tempStreak->setRelation('activity', $activity);

        $streakUnit = $isWeeklyTraining ? 'weeks' : 'days';

        foreach ($invalidMilestones as $milestone) {
            $tempStreak->current_streak = $milestone;
            $bonus = $streakService->getMilestoneBonus($tempStreak);

            if (!$bonus) {
                continue;
            }

            // Check if we already processed this milestone (to avoid double deduction)
            $coinsDeducted = false;
            $pointsDeducted = false;

            // Find and reverse coin transaction for this milestone
            foreach ($coinTransactions as $transaction) {
                if (preg_match('/Streak bonus \((\d+)\s*(?:days?|weeks?)\):/', $transaction->reason, $matches)) {
                    $transactionStreak = (int)$matches[1];
                    
                    if ($transactionStreak === $milestone && !$coinsDeducted) {
                        // Deduct coins
                        if ($bonus['coins'] > 0) {
                            $this->coinService->deductCoins(
                                user: $user,
                                amount: $bonus['coins'],
                                reason: "Streak bonus reversed ({$milestone} {$streakUnit}): {$activity->name}",
                                source: $activity
                            );
                            $coinsDeducted = true;
                        }
                        break;
                    }
                }
            }

            // Find and reverse point transaction for this milestone
            foreach ($pointTransactions as $transaction) {
                if (preg_match('/Streak bonus \((\d+)\s*(?:days?|weeks?)\):/', $transaction->reason, $matches)) {
                    $transactionStreak = (int)$matches[1];
                    
                    if ($transactionStreak === $milestone && !$pointsDeducted) {
                        // Deduct experience
                        if ($bonus['experience'] > 0) {
                            $this->pointService->deductPoints(
                                user: $user,
                                amount: $bonus['experience'],
                                reason: "Streak bonus reversed ({$milestone} {$streakUnit}): {$activity->name}",
                                source: $activity
                            );
                            $pointsDeducted = true;
                        }
                        break;
                    }
                }
            }
        }
    }
}
