<?php

namespace App\Console\Commands;

use App\Models\Activity;
use App\Models\User;
use App\Models\UserActivityLog;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class DailyResetCommand extends Command
{
    protected $signature = 'activities:daily-reset';
    protected $description = 'Reset daily activities and check music walk streaks at 6 AM';

    public function handle(): int
    {
        $yesterday = Carbon::yesterday();
        $this->info("Running daily reset for {$yesterday->toDateString()}");

        // Get music walk activity
        $musicWalkActivity = Activity::where('type', 'music_walk')->first();

        if (!$musicWalkActivity) {
            $this->warn("No music walk activity found");
            return Command::SUCCESS;
        }

        $users = User::all();
        $usersWithMusicWalk = 0;
        $usersWithBrokenStreak = 0;

        foreach ($users as $user) {
            // Check if user completed music walk yesterday
            $hadMusicWalkYesterday = UserActivityLog::where('user_id', $user->id)
                ->where('activity_id', $musicWalkActivity->id)
                ->whereDate('date', $yesterday)
                ->exists();

            if ($hadMusicWalkYesterday) {
                $usersWithMusicWalk++;
                $this->info("✓ User {$user->name} completed music walk yesterday");
            } else {
                // User had no music walk yesterday - check if streak should break
                if ($user->current_music_walk_streak > 0 && $user->last_music_walk_date) {
                    $daysSinceLastMusicWalk = $user->last_music_walk_date->diffInDays(Carbon::today());

                    if ($daysSinceLastMusicWalk > 1) {
                        $this->warn("✗ User {$user->name} music walk streak broken ({$user->current_music_walk_streak} days)");
                        $user->resetMusicWalkStreak();
                        $usersWithBrokenStreak++;
                    }
                }
            }
        }

        $this->info("Daily reset completed:");
        $this->info("- Users with music walk: {$usersWithMusicWalk}");
        $this->info("- Music walk streaks broken: {$usersWithBrokenStreak}");

        Log::info('Daily reset completed', [
            'date' => $yesterday->toDateString(),
            'users_with_music_walk' => $usersWithMusicWalk,
            'music_walk_streaks_broken' => $usersWithBrokenStreak,
        ]);

        return Command::SUCCESS;
    }
}
