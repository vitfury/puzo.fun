<?php

namespace App\Services;

use App\Models\Activity;
use App\Models\Genre;
use App\Models\User;
use App\Models\UserActivityLog;
use App\Models\UserGenreProgress;
use Carbon\Carbon;

class GenreUnlockService
{
    /**
     * Initialize genres for a new user (unlock root genres)
     */
    public function initializeUserGenres(User $user): void
    {
        $rootGenres = Genre::roots()->get();

        foreach ($rootGenres as $genre) {
            UserGenreProgress::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'genre_id' => $genre->id,
                ],
                [
                    'is_available' => true,
                    'completed_at' => null,
                ]
            );
        }
    }

    /**
     * Check if user can unlock new genres today
     */
    public function canUnlockGenres(User $user): bool
    {
        // Check if user completed music walk today
        if (!$this->hasCompletedMusicWalkToday($user)) {
            return false;
        }

        // Check if streak is not broken (previous day activity exists)
        if (!$this->hasStreakContinuity($user)) {
            return false;
        }

        return true;
    }

    /**
     * Check if user completed music walk activity today
     */
    public function hasCompletedMusicWalkToday(User $user): bool
    {
        $musicWalk = Activity::where('type', 'music_walk')->first();

        if (!$musicWalk) {
            return false;
        }

        $today = Carbon::today();
        $completedToday = UserActivityLog::where('user_id', $user->id)
            ->where('activity_id', $musicWalk->id)
            ->whereDate('completed_at', $today)
            ->exists();

        return $completedToday;
    }

    /**
     * Check if user has streak continuity (no days skipped)
     */
    public function hasStreakContinuity(User $user): bool
    {
        // New user or first music walk - no streak to check
        if (!$user->last_music_walk_date) {
            return true;
        }

        $lastMusicWalkDate = Carbon::parse($user->last_music_walk_date);
        $yesterday = Carbon::yesterday()->startOfDay();

        // If last music walk was yesterday or today, streak is intact
        if ($lastMusicWalkDate->isSameDay($yesterday) || $lastMusicWalkDate->isToday()) {
            return true;
        }

        // If last music walk was before yesterday, streak is broken
        return false;
    }

    /**
     * Unlock child genres of completed genre
     */
    public function unlockChildGenres(User $user, Genre $completedGenre): int
    {
        if (!$this->canUnlockGenres($user)) {
            return 0;
        }

        $childGenres = Genre::where('parent_id', $completedGenre->id)->get();
        $unlockedCount = 0;

        foreach ($childGenres as $childGenre) {
            $progress = UserGenreProgress::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'genre_id' => $childGenre->id,
                ],
                [
                    'is_available' => true,
                    'completed_at' => null,
                ]
            );

            // If it was just created, increment counter
            if ($progress->wasRecentlyCreated) {
                $unlockedCount++;
            } elseif (!$progress->is_available) {
                // If it existed but was locked, unlock it
                $progress->is_available = true;
                $progress->save();
                $unlockedCount++;
            }
        }

        return $unlockedCount;
    }

    /**
     * Complete a genre and unlock child genres if possible
     */
    public function completeGenre(User $user, Genre $genre): array
    {
        // Check if genre is available for completion
        if (!$this->isGenreAvailableForUser($user, $genre)) {
            throw new \Exception('Genre is not available for completion');
        }

        $progress = UserGenreProgress::firstOrCreate(
            [
                'user_id' => $user->id,
                'genre_id' => $genre->id,
            ],
            [
                'is_available' => true,
            ]
        );

        // If already completed, return early
        if ($progress->completed_at) {
            return [
                'already_completed' => true,
                'unlocked_count' => 0,
                'can_unlock' => false,
                'reason' => 'Genre already completed',
            ];
        }

        // Mark as completed
        $progress->completed_at = now();
        $progress->save();

        // Try to unlock child genres
        $canUnlock = $this->canUnlockGenres($user);
        $unlockedCount = 0;

        if ($canUnlock) {
            $unlockedCount = $this->unlockChildGenres($user, $genre);
        }

        return [
            'already_completed' => false,
            'unlocked_count' => $unlockedCount,
            'can_unlock' => $canUnlock,
            'reason' => $canUnlock ? null : $this->getUnlockBlockReason($user),
        ];
    }

    /**
     * Check if genre is available for user to complete
     */
    private function isGenreAvailableForUser(User $user, Genre $genre): bool
    {
        // First root genre is always available
        if ($genre->parent_id === null) {
            $firstRoot = Genre::roots()->first();
            if ($genre->id === $firstRoot->id) {
                return true;
            }
        }

        // Check if user has progress record and genre is available
        $progress = UserGenreProgress::where('user_id', $user->id)
            ->where('genre_id', $genre->id)
            ->first();

        if ($progress) {
            return $progress->is_available;
        }

        // For child genres, check if parent is completed
        if ($genre->parent_id !== null) {
            $parentProgress = UserGenreProgress::where('user_id', $user->id)
                ->where('genre_id', $genre->parent_id)
                ->first();

            return $parentProgress && $parentProgress->isCompleted();
        }

        return false;
    }

    /**
     * Get reason why genres cannot be unlocked
     */
    private function getUnlockBlockReason(User $user): string
    {
        if (!$this->hasCompletedMusicWalkToday($user)) {
            return 'Must complete music walk today to unlock new genres';
        }

        if (!$this->hasStreakContinuity($user)) {
            return 'Streak broken - complete activities daily to unlock genres';
        }

        return 'Unknown reason';
    }
}
