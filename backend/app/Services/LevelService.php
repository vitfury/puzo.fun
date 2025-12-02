<?php

namespace App\Services;

use App\Models\GameSetting;
use App\Models\User;

class LevelService
{
    private int $maxLevel;
    private array $difficultyBrackets;

    // Default values if DB settings not available
    private const DEFAULT_XP_RATE = 1.0;
    private const DEFAULT_BASE_POINTS = 100;

    public function __construct()
    {
        $this->maxLevel = config('rpg.levels.max_level', 80);
        $this->difficultyBrackets = config('rpg.levels.difficulty_brackets', [
            ['min' => 1, 'max' => 19, 'multiplier' => 1.0, 'name' => 'easy'],
            ['min' => 20, 'max' => 39, 'multiplier' => 1.5, 'name' => 'medium'],
            ['min' => 40, 'max' => 51, 'multiplier' => 2.0, 'name' => 'hard'],
            ['min' => 52, 'max' => 60, 'multiplier' => 3.0, 'name' => 'very_hard'],
            ['min' => 61, 'max' => 75, 'multiplier' => 5.0, 'name' => 'extreme'],
            ['min' => 76, 'max' => 80, 'multiplier' => 10.0, 'name' => 'legendary'],
        ]);
    }

    public function getMaxLevel(): int
    {
        return $this->maxLevel;
    }

    public function getBaseXpRate(): float
    {
        return GameSetting::getValue('xp_rate', self::DEFAULT_XP_RATE);
    }

    public function getBasePointsPerLevel(): int
    {
        return GameSetting::getValue('base_points_per_level', self::DEFAULT_BASE_POINTS);
    }

    /**
     * Calculate total points needed to reach a specific level
     */
    public function getPointsForLevel(int $level, ?float $rate = null): int
    {
        $rate = $rate ?? $this->getBaseXpRate();
        
        if ($level <= 1) {
            return 0;
        }

        $totalPoints = 0;

        for ($i = 1; $i < $level; $i++) {
            $totalPoints += $this->getPointsToNextLevel($i, $rate);
        }

        return $totalPoints;
    }

    /**
     * Calculate points needed to go from current level to next
     */
    public function getPointsToNextLevel(int $currentLevel, ?float $rate = null): int
    {
        $rate = $rate ?? $this->getBaseXpRate();
        
        if ($currentLevel >= $this->maxLevel) {
            return 0; // Max level reached
        }

        $multiplier = $this->getDifficultyMultiplier($currentLevel);
        $basePoints = $this->getBasePointsPerLevel();
        
        // Formula: base * level * multiplier / rate
        // Higher rate = easier, lower rate = harder
        return (int) ceil(
            ($basePoints * $currentLevel * $multiplier) / $rate
        );
    }

    /**
     * Get difficulty multiplier for a level
     */
    public function getDifficultyMultiplier(int $level): float
    {
        foreach ($this->difficultyBrackets as $bracket) {
            if ($level >= $bracket['min'] && $level <= $bracket['max']) {
                return $bracket['multiplier'];
            }
        }

        return 10.0; // Default to highest if somehow out of range
    }

    /**
     * Get difficulty bracket name for a level
     */
    public function getDifficultyName(int $level): string
    {
        foreach ($this->difficultyBrackets as $bracket) {
            if ($level >= $bracket['min'] && $level <= $bracket['max']) {
                return $bracket['name'];
            }
        }

        return 'legendary';
    }

    /**
     * Calculate level from total points
     */
    public function calculateLevelFromPoints(int $totalPoints, ?float $rate = null): int
    {
        $rate = $rate ?? $this->getBaseXpRate();
        $level = 1;
        $pointsUsed = 0;

        while ($level < $this->maxLevel) {
            $pointsNeeded = $this->getPointsToNextLevel($level, $rate);
            
            if ($pointsUsed + $pointsNeeded > $totalPoints) {
                break;
            }

            $pointsUsed += $pointsNeeded;
            $level++;
        }

        return $level;
    }

    /**
     * Update user level based on their total points
     */
    public function updateUserLevel(User $user, ?float $rate = null): bool
    {
        $rate = $rate ?? $this->getBaseXpRate();
        $newLevel = $this->calculateLevelFromPoints($user->total_points, $rate);

        if ($newLevel !== $user->level) {
            $oldLevel = $user->level;
            $user->level = $newLevel;
            $user->save();

            // Return true if level changed
            return true;
        }

        return false;
    }

    /**
     * Get progress towards next level (0-100%)
     */
    public function getLevelProgress(User $user, ?float $rate = null): array
    {
        $rate = $rate ?? $this->getBaseXpRate();
        $currentLevel = $user->level;
        
        if ($currentLevel >= $this->maxLevel) {
            return [
                'current_level' => $currentLevel,
                'next_level' => null,
                'points_in_level' => 0,
                'points_needed' => 0,
                'progress_percent' => 100,
                'is_max_level' => true,
            ];
        }

        $pointsForCurrentLevel = $this->getPointsForLevel($currentLevel, $rate);
        $pointsForNextLevel = $this->getPointsForLevel($currentLevel + 1, $rate);
        $pointsNeededForNext = $pointsForNextLevel - $pointsForCurrentLevel;
        $pointsInCurrentLevel = $user->total_points - $pointsForCurrentLevel;

        $progress = $pointsNeededForNext > 0 
            ? min(100, round(($pointsInCurrentLevel / $pointsNeededForNext) * 100))
            : 100;

        return [
            'current_level' => $currentLevel,
            'next_level' => $currentLevel + 1,
            'points_in_level' => $pointsInCurrentLevel,
            'points_needed' => $pointsNeededForNext,
            'points_remaining' => max(0, $pointsNeededForNext - $pointsInCurrentLevel),
            'progress_percent' => $progress,
            'is_max_level' => false,
            'difficulty' => $this->getDifficultyName($currentLevel),
        ];
    }

    /**
     * Get grade for equipment based on level
     */
    public function getGradeForLevel(int $level): string
    {
        if ($level < 20) return 'no-grade';
        if ($level < 40) return 'D';
        if ($level < 52) return 'C';
        if ($level < 61) return 'B';
        if ($level < 76) return 'A';
        return 'S';
    }

    /**
     * Get level requirement for grade
     */
    public function getMinLevelForGrade(string $grade): int
    {
        return match ($grade) {
            'no-grade' => 1,
            'D' => 20,
            'C' => 40,
            'B' => 52,
            'A' => 61,
            'S' => 76,
            default => 1,
        };
    }
}

