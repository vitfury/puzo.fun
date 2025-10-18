<?php

namespace App\Console\Commands;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class DailyResetCommand extends Command
{
    protected $signature = 'activities:daily-reset';
    protected $description = 'Reset daily activities and check streaks at 6 AM';

    public function handle(): int
    {
        $yesterday = Carbon::yesterday();
        $this->info("Running daily reset for {$yesterday->toDateString()}");

        $users = User::all();
        $usersWithActivity = 0;
        $usersWithBrokenStreak = 0;

        foreach ($users as $user) {
            // Check if user had any activity yesterday
            $hadActivityYesterday = $user->dailyStats()
                ->where('date', $yesterday)
                ->where('activities_completed', '>', 0)
                ->exists();

            if ($hadActivityYesterday) {
                $usersWithActivity++;
                $this->info("✓ User {$user->name} completed activities yesterday");
            } else {
                // User had no activity yesterday - check if streak should break
                if ($user->current_streak > 0 && $user->last_activity_date) {
                    $daysSinceLastActivity = $user->last_activity_date->diffInDays(Carbon::today());

                    if ($daysSinceLastActivity > 1) {
                        $this->warn("✗ User {$user->name} streak broken ({$user->current_streak} days)");
                        $user->resetStreak();
                        $usersWithBrokenStreak++;
                    }
                }
            }
        }

        $this->info("Daily reset completed:");
        $this->info("- Users with activity: {$usersWithActivity}");
        $this->info("- Streaks broken: {$usersWithBrokenStreak}");

        Log::info('Daily reset completed', [
            'date' => $yesterday->toDateString(),
            'users_with_activity' => $usersWithActivity,
            'streaks_broken' => $usersWithBrokenStreak,
        ]);

        return Command::SUCCESS;
    }
}
