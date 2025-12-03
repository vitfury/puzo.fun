<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class ActivityStreak extends Model
{
    protected $fillable = [
        'user_id',
        'activity_id',
        'current_streak',
        'longest_streak',
        'last_completed_date',
        'total_completions',
    ];

    protected $casts = [
        'current_streak' => 'integer',
        'longest_streak' => 'integer',
        'last_completed_date' => 'date',
        'total_completions' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class);
    }

    /**
     * Check if activity is a weekly training (gym or functional training)
     */
    private function isWeeklyTraining(): bool
    {
        if (!$this->activity) {
            return false;
        }

        return self::isWeeklyTrainingActivity($this->activity);
    }

    /**
     * Check if an activity is a weekly training (gym or functional training)
     */
    public static function isWeeklyTrainingActivity(Activity $activity): bool
    {
        $activityName = strtolower($activity->name);
        $weeklyTrainingNames = [
            'gym workout',
            'тренажерний зал',
            'functional training',
            'функціональне тренування',
        ];

        return in_array($activityName, $weeklyTrainingNames);
    }

    /**
     * Get count of completions in a given week (Monday to Sunday)
     * Note: This counts existing logs in the database. When called from recordCompletion,
     * the current completion is already in the database, so it's included in the count.
     */
    private function getCompletionsInWeek(Carbon $date): int
    {
        $weekStart = $date->copy()->startOfWeek();
        $weekEnd = $date->copy()->endOfWeek();

        return UserActivityLog::where('user_id', $this->user_id)
            ->where('activity_id', $this->activity_id)
            ->whereBetween('date', [$weekStart, $weekEnd])
            ->count();
    }

    /**
     * Update streak when activity is completed
     */
    public function recordCompletion(Carbon $date): void
    {
        // If already completed today, do nothing
        if ($this->last_completed_date && $this->last_completed_date->isSameDay($date)) {
            return;
        }

        $this->total_completions++;

        // For weekly trainings (gym/functional), use weekly streak logic
        if ($this->isWeeklyTraining()) {
            $this->recordWeeklyTrainingCompletion($date);
        } else {
            // For other activities, use daily streak logic
            $this->recordDailyCompletion($date);
        }

        $this->last_completed_date = $date;
        $this->save();
    }

    /**
     * Record completion for weekly trainings (3 times per week = 1 streak)
     */
    private function recordWeeklyTrainingCompletion(Carbon $date): void
    {
        $completionsThisWeek = $this->getCompletionsInWeek($date);
        $currentWeek = $date->copy()->startOfWeek();

        // Only update streak when we reach exactly 3 completions in a week
        // (to avoid incrementing multiple times in the same week)
        if ($completionsThisWeek >= 3) {
            // Check if we're in the same week as last completion
            $lastWeek = $this->last_completed_date 
                ? $this->last_completed_date->copy()->startOfWeek() 
                : null;
            
            if (!$lastWeek || !$lastWeek->equalTo($currentWeek)) {
                // This is a new week (or first completion ever)
                // Check if previous week was completed (if it exists)
                if ($lastWeek) {
                    $previousWeek = $lastWeek;
                    $previousWeekEnd = $previousWeek->copy()->endOfWeek();
                    
                    $completionsInPreviousWeek = UserActivityLog::where('user_id', $this->user_id)
                        ->where('activity_id', $this->activity_id)
                        ->whereBetween('date', [$previousWeek, $previousWeekEnd])
                        ->count();

                    if ($completionsInPreviousWeek >= 3) {
                        // Previous week was completed - continue streak
                        $this->current_streak++;
                    } else {
                        // Previous week wasn't completed - start new streak
                        $this->current_streak = 1;
                    }
                } else {
                    // First completion ever - start streak
                    $this->current_streak = 1;
                }
            }
            // If we're in the same week and already have streak > 0, don't increment again
            // (we only count once per week when reaching 3 completions)
        }

        // Update longest streak
        if ($this->current_streak > $this->longest_streak) {
            $this->longest_streak = $this->current_streak;
        }
    }

    /**
     * Record completion for daily activities
     */
    private function recordDailyCompletion(Carbon $date): void
    {
        if (!$this->last_completed_date) {
            // First completion
            $this->current_streak = 1;
        } elseif ($this->last_completed_date->diffInDays($date) === 1) {
            // Consecutive day - increase streak
            $this->current_streak++;
        } else {
            // Streak broken - start new streak
            $this->current_streak = 1;
        }

        // Update longest streak
        if ($this->current_streak > $this->longest_streak) {
            $this->longest_streak = $this->current_streak;
        }
    }

    /**
     * Check if streak was broken (called by daily reset)
     */
    public function checkStreakBroken(Carbon $today): bool
    {
        if (!$this->last_completed_date) {
            return false;
        }

        // For weekly trainings, check if previous week was completed
        if ($this->isWeeklyTraining()) {
            return $this->checkWeeklyTrainingStreakBroken($today);
        }

        // For daily activities, check if more than 1 day passed
        $daysSinceLastCompletion = $this->last_completed_date->diffInDays($today);
        
        if ($daysSinceLastCompletion > 1 && $this->current_streak > 0) {
            $this->current_streak = 0;
            $this->save();
            return true;
        }

        return false;
    }

    /**
     * Check if weekly training streak was broken
     * Streak is broken if previous week had less than 3 completions
     */
    private function checkWeeklyTrainingStreakBroken(Carbon $today): bool
    {
        // Check if we're in a new week compared to last completion
        $lastWeek = $this->last_completed_date->copy()->startOfWeek();
        $currentWeek = $today->copy()->startOfWeek();

        // If we're in the same week, don't break streak yet
        if ($lastWeek->equalTo($currentWeek)) {
            return false;
        }

        // We're in a new week - check if the previous week (week of last completion) had 3+ completions
        $lastCompletionWeek = $this->last_completed_date->copy()->startOfWeek();
        $lastCompletionWeekEnd = $lastCompletionWeek->copy()->endOfWeek();
        
        $completionsInLastWeek = UserActivityLog::where('user_id', $this->user_id)
            ->where('activity_id', $this->activity_id)
            ->whereBetween('date', [$lastCompletionWeek, $lastCompletionWeekEnd])
            ->count();

        // If last week had less than 3 completions, streak is broken
        if ($completionsInLastWeek < 3 && $this->current_streak > 0) {
            $this->current_streak = 0;
            $this->save();
            return true;
        }

        return false;
    }

    /**
     * Get streak milestones that should trigger bonuses
     */
    public static function getStreakMilestones(): array
    {
        return [3, 7, 14, 21, 30, 60, 100];
    }

    /**
     * Get streak milestones for weekly trainings (in weeks)
     */
    public static function getWeeklyTrainingMilestones(): array
    {
        return [1, 2, 4, 8, 12, 24];
    }

    /**
     * Check if current streak hit a milestone
     */
    public function isAtMilestone(): bool
    {
        if ($this->isWeeklyTraining()) {
            return in_array($this->current_streak, self::getWeeklyTrainingMilestones());
        }
        
        return in_array($this->current_streak, self::getStreakMilestones());
    }

    /**
     * Get the milestone bonus for current streak
     */
    public function getMilestoneBonus(): ?array
    {
        if ($this->isWeeklyTraining()) {
            // Milestones for weekly trainings (in weeks)
            $milestones = [
                1 => ['coins' => 20, 'experience' => 10],   // 1 week (3 trainings)
                2 => ['coins' => 50, 'experience' => 25],   // 2 weeks
                4 => ['coins' => 100, 'experience' => 50],   // 4 weeks (1 month)
                8 => ['coins' => 200, 'experience' => 100],  // 8 weeks (2 months)
                12 => ['coins' => 300, 'experience' => 150], // 12 weeks (3 months)
                24 => ['coins' => 500, 'experience' => 250], // 24 weeks (6 months)
            ];
        } else {
            // Milestones for daily activities (in days)
            $milestones = [
                3 => ['coins' => 10, 'experience' => 5],
                7 => ['coins' => 50, 'experience' => 25],
                14 => ['coins' => 100, 'experience' => 50],
                21 => ['coins' => 200, 'experience' => 100],
                30 => ['coins' => 300, 'experience' => 150],
                60 => ['coins' => 500, 'experience' => 250],
                100 => ['coins' => 1000, 'experience' => 500],
            ];
        }

        return $milestones[$this->current_streak] ?? null;
    }
}

