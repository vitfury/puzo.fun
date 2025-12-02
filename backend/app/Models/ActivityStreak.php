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
     * Update streak when activity is completed
     */
    public function recordCompletion(Carbon $date): void
    {
        // If already completed today, do nothing
        if ($this->last_completed_date && $this->last_completed_date->isSameDay($date)) {
            return;
        }

        $this->total_completions++;

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

        $this->last_completed_date = $date;
        $this->save();
    }

    /**
     * Check if streak was broken (called by daily reset)
     */
    public function checkStreakBroken(Carbon $today): bool
    {
        if (!$this->last_completed_date) {
            return false;
        }

        $daysSinceLastCompletion = $this->last_completed_date->diffInDays($today);
        
        // If more than 1 day passed, streak is broken
        if ($daysSinceLastCompletion > 1 && $this->current_streak > 0) {
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
     * Check if current streak hit a milestone
     */
    public function isAtMilestone(): bool
    {
        return in_array($this->current_streak, self::getStreakMilestones());
    }

    /**
     * Get the milestone bonus for current streak
     */
    public function getMilestoneBonus(): ?array
    {
        $milestones = [
            3 => ['coins' => 10, 'experience' => 5],
            7 => ['coins' => 50, 'experience' => 25],
            14 => ['coins' => 100, 'experience' => 50],
            21 => ['coins' => 200, 'experience' => 100],
            30 => ['coins' => 300, 'experience' => 150],
            60 => ['coins' => 500, 'experience' => 250],
            100 => ['coins' => 1000, 'experience' => 500],
        ];

        return $milestones[$this->current_streak] ?? null;
    }
}

