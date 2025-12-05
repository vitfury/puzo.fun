<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\CoinTransaction;
use App\Models\PointTransaction;
use App\Models\User;
use App\Models\UserActivityLog;
use App\Models\Activity;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration cleans up duplicate activity transactions.
     * If an activity is not completed for a date (no UserActivityLog entry),
     * all transactions (both positive and negative) for that activity on that date are deleted.
     */
    public function up(): void
    {
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

        $totalDeletedCoins = 0;
        $totalDeletedPoints = 0;
        $affectedCount = 0;

        foreach ($allCombinations as $combo) {
            $userId = $combo->user_id;
            $activityId = $combo->activity_id;
            $date = is_string($combo->date) ? $combo->date : $combo->date->format('Y-m-d');

            // Check if activity is completed for this user on this date
            $isCompleted = UserActivityLog::where('user_id', $userId)
                ->where('activity_id', $activityId)
                ->whereDate('date', $date)
                ->exists();

            // If not completed, delete all transactions for this user, activity, and date
            if (!$isCompleted) {
                // Delete all coin transactions
                $coinTransactions = CoinTransaction::where('user_id', $userId)
                    ->where('source_type', Activity::class)
                    ->where('source_id', $activityId)
                    ->whereDate('created_at', $date)
                    ->get();

                foreach ($coinTransactions as $tx) {
                    $tx->delete();
                    $totalDeletedCoins++;
                }

                // Delete all point transactions
                $pointTransactions = PointTransaction::where('user_id', $userId)
                    ->where('source_type', Activity::class)
                    ->where('source_id', $activityId)
                    ->whereDate('created_at', $date)
                    ->get();

                foreach ($pointTransactions as $tx) {
                    $tx->delete();
                    $totalDeletedPoints++;
                }

                if (count($coinTransactions) > 0 || count($pointTransactions) > 0) {
                    $affectedCount++;
                }
            }
        }

        // Recalculate user balances
        $this->recalculateUserBalances();

        echo "Cleaned up {$totalDeletedCoins} coin transactions and {$totalDeletedPoints} point transactions\n";
        echo "Affected user-activity-date combinations: {$affectedCount}\n";
    }

    /**
     * Recalculate user balances based on remaining transactions
     */
    private function recalculateUserBalances(): void
    {
        $users = User::all();
        $recalculated = 0;

        foreach ($users as $user) {
            // Recalculate coins
            $totalCoins = CoinTransaction::where('user_id', $user->id)->sum('amount');
            $user->coins = max(0, $totalCoins); // Ensure non-negative
            
            // Recalculate points
            $totalPoints = PointTransaction::where('user_id', $user->id)->sum('amount');
            $user->total_points = max(0, $totalPoints); // Ensure non-negative
            
            $user->save();
            $recalculated++;
        }

        echo "Recalculated balances for {$recalculated} users\n";
    }

    /**
     * Reverse the migrations.
     * 
     * Note: This cannot fully reverse the cleanup as we've deleted transactions.
     * This is a one-way migration.
     */
    public function down(): void
    {
        // Cannot reverse - transactions have been deleted
        // This is intentional as these were duplicate/cancelling transactions
        echo "Cannot reverse this migration - duplicate transactions have been permanently removed\n";
    }
};
