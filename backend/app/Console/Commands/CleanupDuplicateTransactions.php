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
        // Use DB::raw to get proper date format and ensure we get all combinations
        $allCombinations = DB::table('coin_transactions')
            ->where('source_type', Activity::class)
            ->selectRaw('user_id, source_id as activity_id, DATE(created_at) as date')
            ->distinct()
            ->union(
                DB::table('point_transactions')
                    ->where('source_type', Activity::class)
                    ->selectRaw('user_id, source_id as activity_id, DATE(created_at) as date')
                    ->distinct()
            )
            ->get()
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
                ->orderBy('created_at', 'asc')
                ->get();

            $pointTransactions = PointTransaction::where('user_id', $userId)
                ->where('source_type', Activity::class)
                ->where('source_id', $activityId)
                ->whereDate('created_at', $date)
                ->orderBy('created_at', 'asc')
                ->get();

            // Check if activity is completed for this user on this date
            $isCompleted = DB::table('user_activity_log')
                ->where('user_id', $userId)
                ->where('activity_id', $activityId)
                ->whereDate('date', $date)
                ->exists();

            // Calculate net change
            $coinNet = $coinTransactions->sum('amount');
            $pointNet = $pointTransactions->sum('amount');

            // Delete all transactions if activity is not completed
            if (!$isCompleted) {
                foreach ($coinTransactions as $tx) {
                    $tx->delete();
                    $totalDeletedCoins++;
                }
                foreach ($pointTransactions as $tx) {
                    $tx->delete();
                    $totalDeletedPoints++;
                }
                if ($coinTransactions->count() > 0 || $pointTransactions->count() > 0) {
                    $affectedCount++;
                }
            } else {
                // If activity is completed, delete pairs of positive and negative transactions
                // that cancel each other out (even if there are other transactions)
                
                // For coin transactions: find and delete pairs
                $processedCoinIds = [];
                foreach ($coinTransactions as $positiveTx) {
                    if (in_array($positiveTx->id, $processedCoinIds) || $positiveTx->amount <= 0) {
                        continue;
                    }
                    
                    // Find matching negative transaction
                    $negativeTx = $coinTransactions->first(function ($tx) use ($positiveTx, $processedCoinIds) {
                        return !in_array($tx->id, $processedCoinIds)
                            && $tx->amount < 0
                            && abs($tx->amount) === $positiveTx->amount
                            && $tx->reason === str_replace('Completed activity: ', 'Uncompleted activity: ', $positiveTx->reason)
                            && $tx->created_at->gt($positiveTx->created_at)
                            && $tx->created_at->diffInMinutes($positiveTx->created_at) < 60; // Within 1 hour
                    });
                    
                    if ($negativeTx) {
                        $positiveTx->delete();
                        $negativeTx->delete();
                        $totalDeletedCoins += 2;
                        $processedCoinIds[] = $positiveTx->id;
                        $processedCoinIds[] = $negativeTx->id;
                    }
                }
                
                // For point transactions: find and delete pairs
                $processedPointIds = [];
                foreach ($pointTransactions as $positiveTx) {
                    if (in_array($positiveTx->id, $processedPointIds) || $positiveTx->amount <= 0) {
                        continue;
                    }
                    
                    // Find matching negative transaction
                    $negativeTx = $pointTransactions->first(function ($tx) use ($positiveTx, $processedPointIds) {
                        return !in_array($tx->id, $processedPointIds)
                            && $tx->amount < 0
                            && abs($tx->amount) === $positiveTx->amount
                            && $tx->reason === str_replace('Completed activity: ', 'Uncompleted activity: ', $positiveTx->reason)
                            && $tx->created_at->gt($positiveTx->created_at)
                            && $tx->created_at->diffInMinutes($positiveTx->created_at) < 60; // Within 1 hour
                    });
                    
                    if ($negativeTx) {
                        $positiveTx->delete();
                        $negativeTx->delete();
                        $totalDeletedPoints += 2;
                        $processedPointIds[] = $positiveTx->id;
                        $processedPointIds[] = $negativeTx->id;
                    }
                }
                
                if (count($processedCoinIds) > 0 || count($processedPointIds) > 0) {
                    $affectedCount++;
                }
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

