<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\CoinTransaction;
use App\Models\PointTransaction;
use App\Models\User;
use App\Models\UserActivityLog;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration cleans up duplicate activity transactions where users
     * repeatedly completed and uncompleted activities, creating pairs of
     * positive and negative transactions that cancel each other out.
     */
    public function up(): void
    {
        // Clean up coin transactions
        $this->cleanupCoinTransactions();
        
        // Clean up point transactions
        $this->cleanupPointTransactions();
        
        // Recalculate user balances
        $this->recalculateUserBalances();
    }

    /**
     * Clean up duplicate coin transactions
     * 
     * Only removes pairs where both completed and uncompleted transactions exist
     */
    private function cleanupCoinTransactions(): void
    {
        // Find all negative "Uncompleted activity" transactions
        $uncompletedTransactions = CoinTransaction::where('reason', 'like', 'Uncompleted activity:%')
            ->where('amount', '<', 0)
            ->orderBy('created_at', 'asc')
            ->get();

        $deletedCount = 0;
        $affectedUsers = [];
        $processedIds = [];

        foreach ($uncompletedTransactions as $uncompletedTx) {
            // Skip if already processed
            if (in_array($uncompletedTx->id, $processedIds)) {
                continue;
            }

            // Extract activity name from reason
            // "Uncompleted activity: Activity Name" -> "Activity Name"
            $activityName = str_replace('Uncompleted activity: ', '', $uncompletedTx->reason);
            $completedReason = "Completed activity: {$activityName}";
            
            // Build query to find matching positive transaction
            $query = CoinTransaction::where('user_id', $uncompletedTx->user_id)
                ->where('reason', $completedReason)
                ->where('amount', abs($uncompletedTx->amount))
                ->where('amount', '>', 0)
                ->whereNotIn('id', $processedIds);

            // Match by source if available (most reliable)
            if ($uncompletedTx->source_type && $uncompletedTx->source_id) {
                $query->where('source_type', $uncompletedTx->source_type)
                      ->where('source_id', $uncompletedTx->source_id);
            }

            // Completed transaction should be created before uncompleted one
            // No time limit - can be from any previous date
            $query->where('created_at', '<=', $uncompletedTx->created_at);

            $matchingCompleted = $query->orderBy('created_at', 'desc')->first();

            // Only delete if we found a matching pair
            if ($matchingCompleted) {
                // Verify they truly cancel each other out
                if (abs($matchingCompleted->amount) === abs($uncompletedTx->amount)) {
                    // Perfect match - delete both
                    $matchingCompleted->delete();
                    $uncompletedTx->delete();
                    $deletedCount += 2;
                    $processedIds[] = $matchingCompleted->id;
                    $processedIds[] = $uncompletedTx->id;
                    $affectedUsers[$uncompletedTx->user_id] = true;
                }
            }
        }

        echo "Cleaned up {$deletedCount} coin transactions (removed {$deletedCount / 2} pairs) for " . count($affectedUsers) . " users\n";
    }

    /**
     * Clean up duplicate point transactions
     * 
     * Only removes pairs where both completed and uncompleted transactions exist
     */
    private function cleanupPointTransactions(): void
    {
        // Find all negative "Uncompleted activity" transactions
        $uncompletedTransactions = PointTransaction::where('reason', 'like', 'Uncompleted activity:%')
            ->where('amount', '<', 0)
            ->orderBy('created_at', 'asc')
            ->get();

        $deletedCount = 0;
        $affectedUsers = [];
        $processedIds = [];

        foreach ($uncompletedTransactions as $uncompletedTx) {
            // Skip if already processed
            if (in_array($uncompletedTx->id, $processedIds)) {
                continue;
            }

            // Extract activity name from reason
            $activityName = str_replace('Uncompleted activity: ', '', $uncompletedTx->reason);
            $completedReason = "Completed activity: {$activityName}";
            
            // Build query to find matching positive transaction
            $query = PointTransaction::where('user_id', $uncompletedTx->user_id)
                ->where('reason', $completedReason)
                ->where('amount', abs($uncompletedTx->amount))
                ->where('amount', '>', 0)
                ->whereNotIn('id', $processedIds);

            // Match by source if available (most reliable)
            if ($uncompletedTx->source_type && $uncompletedTx->source_id) {
                $query->where('source_type', $uncompletedTx->source_type)
                      ->where('source_id', $uncompletedTx->source_id);
            }

            // Completed transaction should be created before uncompleted one
            // No time limit - can be from any previous date
            $query->where('created_at', '<=', $uncompletedTx->created_at);

            $matchingCompleted = $query->orderBy('created_at', 'desc')->first();

            // Only delete if we found a matching pair
            if ($matchingCompleted) {
                // Verify they truly cancel each other out
                if (abs($matchingCompleted->amount) === abs($uncompletedTx->amount)) {
                    // Perfect match - delete both
                    $matchingCompleted->delete();
                    $uncompletedTx->delete();
                    $deletedCount += 2;
                    $processedIds[] = $matchingCompleted->id;
                    $processedIds[] = $uncompletedTx->id;
                    $affectedUsers[$uncompletedTx->user_id] = true;
                }
            }
        }

        echo "Cleaned up {$deletedCount} point transactions (removed {$deletedCount / 2} pairs) for " . count($affectedUsers) . " users\n";
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

