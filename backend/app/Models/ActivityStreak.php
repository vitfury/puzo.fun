<?php

namespace App\Models;

use App\Services\StreakService;
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
     * Check if an activity is a weekly training
     * If daily_streak_enabled is false, it's a weekly training (streak works by weeks)
     * If daily_streak_enabled is true, it's a daily streak (streak works by days)
     */
    public static function isWeeklyTrainingActivity(Activity $activity): bool
    {
        // If daily_streak_enabled is false, use weekly training logic
        return !$activity->daily_streak_enabled;
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
        // If already completed on this exact date, do nothing
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

        // Update last_completed_date to the most recent date
        if (!$this->last_completed_date || $date->isAfter($this->last_completed_date)) {
            $this->last_completed_date = $date;
        }
        
        $this->save();
    }

    /**
     * Record completion for weekly trainings (3 times per week = 1 streak)
     * Recalculates streak based on all completions to handle non-chronological marking
     */
    private function recordWeeklyTrainingCompletion(Carbon $date): void
    {
        // Recalculate streak from all completions to ensure accuracy
        $streakService = new StreakService();
        $streakService->recalculateWeeklyStreak($this);
    }

    /**
     * Record completion for daily activities
     * Recalculates streak based on all completions in the database
     */
    private function recordDailyCompletion(Carbon $date): void
    {
        // Get all unique completion dates from database (including the one we just added)
        $completionDates = UserActivityLog::where('user_id', $this->user_id)
            ->where('activity_id', $this->activity_id)
            ->orderBy('date', 'desc')
            ->pluck('date')
            ->map(fn($d) => Carbon::parse($d)->startOfDay()->format('Y-m-d'))
            ->unique()
            ->sort()
            ->values()
            ->toArray();

        if (empty($completionDates)) {
            $this->current_streak = 0;
            return;
        }

        // Calculate current streak from today backwards (or from most recent date if no completion today)
        $today = Carbon::today()->startOfDay()->format('Y-m-d');
        $startDate = in_array($today, $completionDates) 
            ? Carbon::today()->startOfDay() 
            : Carbon::parse(end($completionDates))->startOfDay();

        $currentStreak = 0;
        $checkDate = $startDate->copy();

        // Count consecutive days backwards from start date
        while (true) {
            $dateString = $checkDate->format('Y-m-d');
            
            if (!in_array($dateString, $completionDates)) {
                break;
            }

            $currentStreak++;
            $checkDate->subDay();
        }

        $this->current_streak = $currentStreak;

        // Update longest streak
        if ($this->current_streak > $this->longest_streak) {
            $this->longest_streak = $this->current_streak;
        }
    }

    /**
     * Get display streak value (0 if below minimum)
     */
    public function getDisplayStreak(): int
    {
        $streakService = new StreakService();
        return $streakService->getDisplayStreak($this);
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
        return StreakService::getDailyStreakMilestones();
    }

    /**
     * Get streak milestones for weekly trainings (in weeks)
     */
    public static function getWeeklyTrainingMilestones(): array
    {
        return StreakService::getWeeklyStreakMilestones();
    }

    /**
     * Check if current streak hit a milestone
     */
    public function isAtMilestone(): bool
    {
        $streakService = new StreakService();
        return $streakService->isAtMilestone($this);
    }

    /**
     * Get the milestone bonus for current streak
     */
    public function getMilestoneBonus(): ?array
    {
        $streakService = new StreakService();
        return $streakService->getMilestoneBonus($this);
    }
}

