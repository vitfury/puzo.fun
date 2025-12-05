<?php

namespace App\Console\Commands;

use App\Models\Activity;
use App\Models\CoinTransaction;
use App\Models\PointTransaction;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DiagnoseUserTransactions extends Command
{
    protected $signature = 'transactions:diagnose {user_id : User ID to diagnose}';
    protected $description = 'Diagnose why transactions are not being cleaned up for a specific user';

    public function handle(): int
    {
        $userId = $this->argument('user_id');
        
        $user = User::find($userId);
        if (!$user) {
            $this->error("User with ID {$userId} not found!");
            return Command::FAILURE;
        }

        $this->info("🔍 Diagnosing transactions for user: {$user->nickname} (ID: {$user->id})");
        $this->newLine();

        // Get all activity transactions for this user
        $coinTransactions = CoinTransaction::where('user_id', $userId)
            ->where('source_type', Activity::class)
            ->orderBy('created_at', 'asc')
            ->get();

        $pointTransactions = PointTransaction::where('user_id', $userId)
            ->where('source_type', Activity::class)
            ->orderBy('created_at', 'asc')
            ->get();

        $this->info("📊 Statistics:");
        $this->line("   Coin transactions: {$coinTransactions->count()}");
        $this->line("   Point transactions: {$pointTransactions->count()}");
        $this->newLine();

        // Group by activity and date
        $grouped = [];
        
        foreach ($coinTransactions as $tx) {
            $date = $tx->created_at->format('Y-m-d');
            $key = "{$tx->source_id}-{$date}";
            if (!isset($grouped[$key])) {
                $grouped[$key] = [
                    'activity_id' => $tx->source_id,
                    'date' => $date,
                    'coin_txs' => [],
                    'point_txs' => [],
                    'has_log' => false,
                ];
            }
            $grouped[$key]['coin_txs'][] = $tx;
        }

        foreach ($pointTransactions as $tx) {
            $date = $tx->created_at->format('Y-m-d');
            $key = "{$tx->source_id}-{$date}";
            if (!isset($grouped[$key])) {
                $grouped[$key] = [
                    'activity_id' => $tx->source_id,
                    'date' => $date,
                    'coin_txs' => [],
                    'point_txs' => [],
                    'has_log' => false,
                ];
            }
            $grouped[$key]['point_txs'][] = $tx;
        }

        // Check user_activity_log for each group
        foreach ($grouped as $key => &$group) {
            $hasLog = DB::table('user_activity_log')
                ->where('user_id', $userId)
                ->where('activity_id', $group['activity_id'])
                ->whereDate('date', $group['date'])
                ->exists();
            
            $group['has_log'] = $hasLog;
        }

        $this->info("📋 Grouped by activity and date:");
        $this->newLine();

        $totalGroups = 0;
        $groupsWithoutLog = 0;
        $totalTransactions = 0;

        foreach ($grouped as $key => $group) {
            $activity = Activity::find($group['activity_id']);
            $activityName = $activity ? $activity->name : "Activity ID {$group['activity_id']}";
            
            $totalGroups++;
            $coinCount = count($group['coin_txs']);
            $pointCount = count($group['point_txs']);
            $totalTransactions += $coinCount + $pointCount;

            $status = $group['has_log'] ? '✅ HAS LOG' : '❌ NO LOG';
            
            if (!$group['has_log']) {
                $groupsWithoutLog++;
            }

            $this->line("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            $this->line("📌 {$activityName} on {$group['date']}");
            $this->line("   Status: {$status}");
            $this->line("   Coin transactions: {$coinCount}");
            $this->line("   Point transactions: {$pointCount}");

            if ($coinCount > 0) {
                $this->line("   Coin transactions details:");
                foreach ($group['coin_txs'] as $tx) {
                    $sign = $tx->amount > 0 ? '+' : '';
                    $this->line("      {$sign}{$tx->amount} 🪙 {$tx->reason} ({$tx->created_at->format('H:i:s')})");
                }
            }

            if ($pointCount > 0) {
                $this->line("   Point transactions details:");
                foreach ($group['point_txs'] as $tx) {
                    $sign = $tx->amount > 0 ? '+' : '';
                    $this->line("      {$sign}{$tx->amount} ⭐ {$tx->reason} ({$tx->created_at->format('H:i:s')})");
                }
            }

            if (!$group['has_log'] && ($coinCount > 0 || $pointCount > 0)) {
                $this->warn("   ⚠️  This group should be deleted by cleanup command!");
            }

            $this->newLine();
        }

        $this->info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        $this->info("📊 Summary:");
        $this->line("   Total groups: {$totalGroups}");
        $this->line("   Groups without log (should be deleted): {$groupsWithoutLog}");
        $this->line("   Total transactions: {$totalTransactions}");
        $this->newLine();

        if ($groupsWithoutLog > 0) {
            $this->warn("⚠️  Found {$groupsWithoutLog} groups that should be cleaned up!");
            $this->line("   Run: php artisan transactions:cleanup-duplicates");
        } else {
            $this->info("✅ All groups have corresponding user_activity_log entries.");
        }

        return Command::SUCCESS;
    }
}

