<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\ActivityStreak;
use App\Models\CoinTransaction;
use App\Models\DailyStat;
use App\Models\HealthHistory;
use App\Models\PointTransaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ProfileChartsTestDataSeeder extends Seeder
{
    /**
     * Seed test data for profile charts visualization
     * Creates 60 days of data showing positive progress
     */
    public function run(): void
    {
        // Get admin user by email
        $user = User::where('email', 'admin@puzo.fun')->first();

        if (!$user) {
            $this->command->info('Admin user (admin@puzo.fun) not found. Skipping profile charts test data.');
            return;
        }

        $this->command->info("Creating 60 days of test data for user: {$user->nickname}");

        $days = 60;
        $startDate = Carbon::today()->subDays($days);

        // Clear existing test data for this user
        HealthHistory::where('user_id', $user->id)->delete();
        DailyStat::where('user_id', $user->id)->delete();
        PointTransaction::where('user_id', $user->id)->delete();
        CoinTransaction::where('user_id', $user->id)->delete();
        ActivityStreak::where('user_id', $user->id)->delete();

        // Seed health history - showing weight loss progress
        $this->seedHealthHistory($user, $startDate, $days);

        // Seed daily stats - activities completed per day
        $this->seedDailyStats($user, $startDate, $days);

        // Seed point transactions - XP earned
        $this->seedPointTransactions($user, $startDate, $days);

        // Seed coin transactions - coins earned and spent
        $this->seedCoinTransactions($user, $startDate, $days);

        // Seed activity streaks
        $this->seedActivityStreaks($user);

        $this->command->info('Profile charts test data created successfully!');
    }

    /**
     * Generate health history showing gradual weight loss
     */
    private function seedHealthHistory(User $user, Carbon $startDate, int $days): void
    {
        // Starting values (slightly overweight)
        $startWeight = 92.0;
        $startWaist = 98;
        $startBodyFat = 28.0;
        $height = $user->height ?? 175;

        // Target loss over 60 days (realistic: ~0.5-1kg per week)
        $totalWeightLoss = 6.5; // ~6.5kg over 60 days
        $totalWaistLoss = 5; // 5cm
        $totalBodyFatLoss = 3.5; // 3.5%

        for ($i = 0; $i <= $days; $i += rand(3, 7)) { // Record every 3-7 days (not daily)
            $date = $startDate->copy()->addDays($i);
            
            // Progress percentage with some noise
            $progress = $i / $days;
            $noise = (rand(-20, 20) / 100); // ±0.2 kg noise
            
            // Calculate current values with gradual decrease + noise
            $weight = round($startWeight - ($totalWeightLoss * $progress) + $noise, 1);
            $waist = max(80, round($startWaist - ($totalWaistLoss * $progress) + rand(-1, 1)));
            $bodyFat = round($startBodyFat - ($totalBodyFatLoss * $progress) + (rand(-5, 5) / 10), 1);
            
            // Calculate BMI
            $heightInMeters = $height / 100;
            $bmi = round($weight / ($heightInMeters * $heightInMeters), 1);

            HealthHistory::create([
                'user_id' => $user->id,
                'date' => $date,
                'weight' => $weight,
                'bmi' => $bmi,
                'waist_circumference' => $waist,
                'body_fat_percentage' => $bodyFat,
            ]);
        }

        // Update user's current values to latest
        $user->update([
            'weight' => $startWeight - $totalWeightLoss,
            'waist_circumference' => $startWaist - $totalWaistLoss,
            'body_fat_percentage' => $startBodyFat - $totalBodyFatLoss,
            'height' => $height,
        ]);
    }

    /**
     * Generate daily stats with varying activity levels
     */
    private function seedDailyStats(User $user, Carbon $startDate, int $days): void
    {
        // Weekends tend to have more activities, some lazy days
        for ($i = 0; $i <= $days; $i++) {
            $date = $startDate->copy()->addDays($i);
            $isWeekend = $date->isWeekend();
            
            // Some days are rest days (about 10%)
            $isRestDay = rand(1, 10) === 1;
            
            if ($isRestDay) {
                $activitiesCompleted = rand(0, 1);
                $pointsEarned = $activitiesCompleted * rand(5, 15);
            } elseif ($isWeekend) {
                // Weekends: more activities (3-8)
                $activitiesCompleted = rand(3, 8);
                $pointsEarned = $activitiesCompleted * rand(10, 35);
            } else {
                // Weekdays: moderate activities (1-5)
                $activitiesCompleted = rand(1, 5);
                $pointsEarned = $activitiesCompleted * rand(10, 25);
            }

            // Increase activity rate as time goes on (motivation growing)
            $motivationBonus = (int) ($i / $days * 2); // +0-2 activities as progress
            $activitiesCompleted += $motivationBonus;

            DailyStat::create([
                'user_id' => $user->id,
                'date' => $date,
                'steps' => rand(2000, 15000),
                'calories_burned' => rand(200, 800),
                'calories_consumed' => rand(1500, 2500),
                'points_earned' => $pointsEarned,
                'activities_completed' => $activitiesCompleted,
            ]);
        }
    }

    /**
     * Generate point transactions (XP earned)
     */
    private function seedPointTransactions(User $user, Carbon $startDate, int $days): void
    {
        $reasons = [
            'activity_completed' => [5, 25],
            'streak_bonus' => [10, 50],
            'step_bonus' => [5, 30],
            'daily_challenge' => [15, 40],
        ];

        $totalPoints = 0;

        for ($i = 0; $i <= $days; $i++) {
            $date = $startDate->copy()->addDays($i);
            
            // 1-5 point transactions per day
            $transactionsCount = rand(1, 5);
            
            for ($j = 0; $j < $transactionsCount; $j++) {
                $reason = array_rand($reasons);
                $range = $reasons[$reason];
                $amount = rand($range[0], $range[1]);
                
                PointTransaction::create([
                    'user_id' => $user->id,
                    'amount' => $amount,
                    'reason' => $reason,
                    'created_at' => $date->copy()->addMinutes(rand(0, 1440)),
                    'updated_at' => $date,
                ]);
                
                $totalPoints += $amount;
            }
        }

        // Update user's total points
        $user->increment('total_points', $totalPoints);
    }

    /**
     * Generate coin transactions
     */
    private function seedCoinTransactions(User $user, Carbon $startDate, int $days): void
    {
        $earnReasons = [
            CoinTransaction::REASON_MUSIC_WALK => [10, 50],
            CoinTransaction::REASON_STREAK_BONUS => [20, 100],
        ];

        $totalEarned = 0;
        $totalSpent = 0;

        for ($i = 0; $i <= $days; $i++) {
            $date = $startDate->copy()->addDays($i);
            
            // 0-3 coin earning transactions per day
            $earningCount = rand(0, 3);
            
            for ($j = 0; $j < $earningCount; $j++) {
                $reason = array_rand($earnReasons);
                $range = $earnReasons[$reason];
                $amount = rand($range[0], $range[1]);
                
                CoinTransaction::create([
                    'user_id' => $user->id,
                    'amount' => $amount,
                    'reason' => $reason,
                    'created_at' => $date->copy()->addMinutes(rand(0, 1440)),
                    'updated_at' => $date,
                ]);
                
                $totalEarned += $amount;
            }
            
            // Occasional purchase (every 7-14 days)
            if (rand(1, 10) === 1) {
                $purchaseAmount = rand(50, 300);
                if ($totalEarned - $totalSpent >= $purchaseAmount) {
                    CoinTransaction::create([
                        'user_id' => $user->id,
                        'amount' => -$purchaseAmount,
                        'reason' => CoinTransaction::REASON_PURCHASE,
                        'created_at' => $date->copy()->addMinutes(rand(0, 1440)),
                        'updated_at' => $date,
                    ]);
                    $totalSpent += $purchaseAmount;
                }
            }
        }

        // Update user's coin balance
        $user->update(['coins' => $totalEarned - $totalSpent]);
    }

    /**
     * Generate activity streaks for various activities
     */
    private function seedActivityStreaks(User $user): void
    {
        $activities = Activity::take(8)->get();

        foreach ($activities as $index => $activity) {
            // Different streak patterns for different activities
            $patterns = [
                ['current' => rand(7, 21), 'longest' => rand(25, 45), 'total' => rand(40, 80)],
                ['current' => rand(3, 10), 'longest' => rand(15, 30), 'total' => rand(25, 50)],
                ['current' => 0, 'longest' => rand(10, 20), 'total' => rand(15, 35)], // Broken streak
                ['current' => rand(1, 5), 'longest' => rand(8, 15), 'total' => rand(12, 25)],
                ['current' => rand(14, 30), 'longest' => rand(30, 60), 'total' => rand(50, 100)], // Strong streak
            ];
            
            $pattern = $patterns[$index % count($patterns)];
            
            ActivityStreak::create([
                'user_id' => $user->id,
                'activity_id' => $activity->id,
                'current_streak' => $pattern['current'],
                'longest_streak' => max($pattern['current'], $pattern['longest']),
                'last_completed_date' => $pattern['current'] > 0 
                    ? Carbon::today()->subDays(rand(0, 1)) 
                    : Carbon::today()->subDays(rand(3, 10)),
                'total_completions' => $pattern['total'],
            ]);
        }
    }
}

