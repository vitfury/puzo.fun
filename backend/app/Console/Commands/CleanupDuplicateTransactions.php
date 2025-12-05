<?php

namespace App\Console\Commands;

use App\Models\Activity;
use App\Models\CoinTransaction;
use App\Models\PointTransaction;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CleanupDuplicateTransactions extends Command
{
    protected $signature = 'transactions:cleanup-duplicates';
    protected $description = 'Clean up duplicate activity transactions - removes all transactions for activities that are not currently completed';

    public function handle(): int
    {
        $this->info('Starting cleanup of duplicate transactions...');
        $this->info('This will remove all pairs of positive and negative transactions that cancel each other out.');

        // Get all unique combinations of (user_id, activity_id, date) from transactions
        $coinCombinations = CoinTransaction::where('source_type', Activity::class)
            ->selectRaw('user_id, source_id as activity_id, DATE(created_at) as date')
            ->distinct()
            ->get();

        $pointCombinations = PointTransaction::where('source_type', Activity::class)
            ->selectRaw('user_id, source_id as activity_id, DATE(created_at) as date')
            ->distinct()
            ->get();

        // Merge and get unique combinations
        $allCombinations = $coinCombinations->merge($pointCombinations)
            ->unique(function ($item) {
                return $item->user_id . '-' . $item->activity_id . '-' . $item->date;
            });

        $this->info("Found {$allCombinations->count()} unique user-activity-date combinations to check");

        $totalDeletedCoins = 0;
        $totalDeletedPoints = 0;
        $affectedCount = 0;

        $bar = $this->output->createProgressBar($allCombinations->count());
        $bar->start();

        foreach ($allCombinations as $combo) {
            $userId = $combo->user_id;
            $activityId = $combo->activity_id;
            $date = is_string($combo->date) ? $combo->date : $combo->date->format('Y-m-d');

            // Get all transactions for this combination
            $coinTransactions = CoinTransaction::where('user_id', $userId)
                ->where('source_type', Activity::class)
                ->where('source_id', $activityId)
                ->whereDate('created_at', $date)
                ->get();

            $pointTransactions = PointTransaction::where('user_id', $userId)
                ->where('source_type', Activity::class)
                ->where('source_id', $activityId)
                ->whereDate('created_at', $date)
                ->get();

            // Calculate net change
            $coinNet = $coinTransactions->sum('amount');
            $pointNet = $pointTransactions->sum('amount');

            // Check if activity is completed for this user on this date
            $isCompleted = DB::table('user_activity_log')
                ->where('user_id', $userId)
                ->where('activity_id', $activityId)
                ->whereDate('date', $date)
                ->exists();

            // Delete transactions if:
            // 1. Activity is not completed (no log entry), OR
            // 2. Net change is zero (all transactions cancel out)
            $shouldDelete = !$isCompleted || ($coinNet == 0 && $pointNet == 0);

            // Debug output for troubleshooting
            if ($coinTransactions->count() > 0 || $pointTransactions->count() > 0) {
                $this->line("   Checking: User {$userId}, Activity {$activityId}, Date {$date}");
                $this->line("   Has log: " . ($isCompleted ? 'YES' : 'NO'));
                $this->line("   Coin net: {$coinNet}, Point net: {$pointNet}");
                $this->line("   Should delete: " . ($shouldDelete ? 'YES' : 'NO'));
            }

            if ($shouldDelete && ($coinTransactions->count() > 0 || $pointTransactions->count() > 0)) {
                // Delete all coin transactions
                foreach ($coinTransactions as $tx) {
                    $tx->delete();
                    $totalDeletedCoins++;
                }

                // Delete all point transactions
                foreach ($pointTransactions as $tx) {
                    $tx->delete();
                    $totalDeletedPoints++;
                }

                $affectedCount++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();

        // Recalculate user balances
        $this->info('Recalculating user balances...');
        $this->recalculateUserBalances();

        $this->newLine();
        $this->info("✅ Cleanup completed!");
        $this->info("   - Deleted {$totalDeletedCoins} coin transactions");
        $this->info("   - Deleted {$totalDeletedPoints} point transactions");
        $this->info("   - Affected {$affectedCount} user-activity-date combinations");

        return Command::SUCCESS;
    }

    private function recalculateUserBalances(): void
    {
        $users = User::all();
        $recalculated = 0;

        $bar = $this->output->createProgressBar($users->count());
        $bar->start();

        foreach ($users as $user) {
            // Recalculate coins
            $totalCoins = CoinTransaction::where('user_id', $user->id)->sum('amount');
            $user->coins = max(0, $totalCoins); // Ensure non-negative
            
            // Recalculate points
            $totalPoints = PointTransaction::where('user_id', $user->id)->sum('amount');
            $user->total_points = max(0, $totalPoints); // Ensure non-negative
            
            $user->save();
            $recalculated++;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Recalculated balances for {$recalculated} users");
    }
}

