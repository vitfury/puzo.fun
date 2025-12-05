<?php

namespace App\Services;

use App\Models\Activity;
use App\Models\ActivityStreak;
use App\Models\GameSetting;
use App\Models\User;
use App\Models\UserActivityLog;
use Carbon\Carbon;

class StreakService
{
    // Minimum streak to be considered a streak (3 days for daily, 1 week for weekly)
    private const MIN_DAILY_STREAK = 3;
    private const MIN_WEEKLY_STREAK = 1;

    /**
     * Get streak milestones for daily activities
     */
    public static function getDailyStreakMilestones(): array
    {
        return [3, 7, 14, 21, 30, 60, 100];
    }

    /**
     * Get streak milestones for weekly trainings
     */
    public static function getWeeklyStreakMilestones(): array
    {
        return [2, 4, 8, 12, 24];
    }

    /**
     * Get milestone bonus for a given streak value
     * Returns null if no bonus is configured for this streak
     */
    public function getMilestoneBonus(ActivityStreak $streak): ?array
    {
        if (!$streak->activity) {
            return null;
        }

        $isWeeklyTraining = ActivityStreak::isWeeklyTrainingActivity($streak->activity);
        $currentStreak = $streak->current_streak;

        // Streak must be at least minimum to get bonuses
        if ($isWeeklyTraining) {
            if ($currentStreak < self::MIN_WEEKLY_STREAK) {
                return null;
            }
            return $this->getWeeklyMilestoneBonus($currentStreak);
        } else {
            if ($currentStreak < self::MIN_DAILY_STREAK) {
                return null;
            }
            return $this->getDailyMilestoneBonus($currentStreak);
        }
    }

    /**
     * Get daily milestone bonus
     */
    private function getDailyMilestoneBonus(int $streak): ?array
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

        return $milestones[$streak] ?? null;
    }

    /**
     * Get weekly milestone bonus
     */
    private function getWeeklyMilestoneBonus(int $weeks): ?array
    {
        $milestones = [
            2 => ['coins' => 50, 'experience' => 25],
            4 => ['coins' => 100, 'experience' => 50],
            8 => ['coins' => 200, 'experience' => 100],
            12 => ['coins' => 300, 'experience' => 150],
            24 => ['coins' => 500, 'experience' => 250],
        ];

        return $milestones[$weeks] ?? null;
    }

    /**
     * Check if streak is at a milestone
     */
    public function isAtMilestone(ActivityStreak $streak): bool
    {
        if (!$streak->activity) {
            return false;
        }

        $isWeeklyTraining = ActivityStreak::isWeeklyTrainingActivity($streak->activity);
        $currentStreak = $streak->current_streak;

        // Streak must be at least minimum to be at milestone
        if ($isWeeklyTraining) {
            if ($currentStreak < self::MIN_WEEKLY_STREAK) {
                return false;
            }
            return in_array($currentStreak, self::getWeeklyStreakMilestones());
        } else {
            if ($currentStreak < self::MIN_DAILY_STREAK) {
                return false;
            }
            return in_array($currentStreak, self::getDailyStreakMilestones());
        }
    }

    /**
     * Recalculate streak for weekly training based on all completions
     * This ensures streak is correctly calculated even when activities are marked in non-chronological order
     */
    public function recalculateWeeklyStreak(ActivityStreak $streak): void
    {
        if (!$streak->activity) {
            return;
        }

        // Get all completion dates
        $completionDates = UserActivityLog::where('user_id', $streak->user_id)
            ->where('activity_id', $streak->activity_id)
            ->orderBy('date', 'asc')
            ->pluck('date')
            ->map(fn($d) => Carbon::parse($d)->startOfDay())
            ->toArray();

        if (empty($completionDates)) {
            $streak->current_streak = 0;
            return;
        }

        // Group completions by week (Monday to Sunday)
        $weeks = [];
        foreach ($completionDates as $date) {
            $weekStart = $date->copy()->startOfWeek();
            $weekKey = $weekStart->format('Y-W'); // Format: 2024-48
            
            if (!isset($weeks[$weekKey])) {
                $weeks[$weekKey] = [
                    'weekStart' => $weekStart,
                    'dates' => [],
                ];
            }
            $weeks[$weekKey]['dates'][] = $date;
        }

        // Sort weeks chronologically by week start date
        uksort($weeks, function($a, $b) use ($weeks) {
            $weekStartA = $weeks[$a]['weekStart'];
            $weekStartB = $weeks[$b]['weekStart'];
            return $weekStartA->timestamp <=> $weekStartB->timestamp;
        });

        // Calculate streak from most recent week backwards
        $currentStreak = 0;
        $weeksArray = array_reverse($weeks, true);
        $today = Carbon::today()->startOfWeek();

        foreach ($weeksArray as $weekKey => $weekData) {
            $weekDates = $weekData['dates'];
            $weekStart = $weekData['weekStart'];
            
            // Only count weeks that have 3+ completions
            if (count($weekDates) >= 3) {
                // If this is the current week or a past week, count it
                if ($weekStart->lte($today)) {
                    $currentStreak++;
                } else {
                    // Future week, stop counting
                    break;
                }
            } else {
                // Week doesn't have 3 completions, streak breaks
                break;
            }
        }

        $streak->current_streak = $currentStreak;

        // Update longest streak
        if ($streak->current_streak > $streak->longest_streak) {
            $streak->longest_streak = $streak->current_streak;
        }
        
        // Save the streak
        $streak->save();
    }

    /**
     * Recalculate streak for daily activities based on all remaining completions
     * This is called when an activity is uncompleted
     */
    public function recalculateDailyStreak(ActivityStreak $streak): void
    {
        if (!$streak->activity) {
            return;
        }

        // Get all unique completion dates from database
        $completionDates = UserActivityLog::where('user_id', $streak->user_id)
            ->where('activity_id', $streak->activity_id)
            ->orderBy('date', 'desc')
            ->pluck('date')
            ->map(fn($d) => Carbon::parse($d)->startOfDay()->format('Y-m-d'))
            ->unique()
            ->sort()
            ->values()
            ->toArray();

        if (empty($completionDates)) {
            $streak->current_streak = 0;
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

        $streak->current_streak = $currentStreak;

        // Update longest streak
        if ($streak->current_streak > $streak->longest_streak) {
            $streak->longest_streak = $streak->current_streak;
        }
    }

    /**
     * Get display value for streak (0 if below minimum)
     */
    public function getDisplayStreak(ActivityStreak $streak): int
    {
        if (!$streak->activity) {
            return 0;
        }

        $isWeeklyTraining = ActivityStreak::isWeeklyTrainingActivity($streak->activity);
        $currentStreak = $streak->current_streak;

        if ($isWeeklyTraining) {
            return $currentStreak >= self::MIN_WEEKLY_STREAK ? $currentStreak : 0;
        } else {
            return $currentStreak >= self::MIN_DAILY_STREAK ? $currentStreak : 0;
        }
    }
}

