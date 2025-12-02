<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityStreak;
use App\Models\CoinTransaction;
use App\Models\DailyStat;
use App\Models\HealthHistory;
use App\Models\PointTransaction;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProfileChartsController extends Controller
{
    /**
     * Get all chart data for the profile page
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'days' => 'nullable|integer|min:7|max:365',
        ]);

        $user = $request->user();
        $days = $validated['days'] ?? 60;
        $startDate = Carbon::today()->subDays($days);
        $endDate = Carbon::today();

        return response()->json([
            'success' => true,
            'data' => [
                'health' => $this->getHealthData($user->id, $startDate, $endDate),
                'activities' => $this->getActivitiesData($user->id, $startDate, $endDate),
                'streaks' => $this->getStreaksData($user->id),
                'experience' => $this->getExperienceData($user->id, $startDate, $endDate),
                'coins' => $this->getCoinsData($user->id, $startDate, $endDate),
                'summary' => $this->getSummaryData($user->id, $startDate, $endDate),
            ],
        ]);
    }

    /**
     * Get health metrics history (weight, BMI, waist)
     */
    private function getHealthData(int $userId, Carbon $startDate, Carbon $endDate): array
    {
        $data = HealthHistory::forUser($userId)
            ->inDateRange($startDate, $endDate)
            ->orderBy('date')
            ->get()
            ->map(function ($record) {
                return [
                    'date' => $record->date->format('Y-m-d'),
                    'weight' => $record->weight ? (float) $record->weight : null,
                    'bmi' => $record->bmi ? (float) $record->bmi : null,
                    'waist' => $record->waist_circumference,
                    'bodyFat' => $record->body_fat_percentage ? (float) $record->body_fat_percentage : null,
                ];
            })
            ->values()
            ->toArray();

        // Calculate trends
        $trend = $this->calculateHealthTrend($data);

        return [
            'history' => $data,
            'trend' => $trend,
        ];
    }

    /**
     * Calculate health improvement trends
     */
    private function calculateHealthTrend(array $data): array
    {
        if (count($data) < 2) {
            return [
                'weight' => null,
                'bmi' => null,
                'waist' => null,
            ];
        }

        $first = $data[0];
        $last = end($data);

        return [
            'weight' => $first['weight'] && $last['weight'] 
                ? round($last['weight'] - $first['weight'], 2) 
                : null,
            'bmi' => $first['bmi'] && $last['bmi'] 
                ? round($last['bmi'] - $first['bmi'], 1) 
                : null,
            'waist' => $first['waist'] && $last['waist'] 
                ? $last['waist'] - $first['waist'] 
                : null,
        ];
    }

    /**
     * Get activities completed per day
     */
    private function getActivitiesData(int $userId, Carbon $startDate, Carbon $endDate): array
    {
        $data = DailyStat::forUser($userId)
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date')
            ->get()
            ->map(function ($stat) {
                return [
                    'date' => $stat->date->format('Y-m-d'),
                    'completed' => $stat->activities_completed,
                    'points' => $stat->points_earned,
                ];
            })
            ->values()
            ->toArray();

        // Total and average
        $total = array_sum(array_column($data, 'completed'));
        $avgPerDay = count($data) > 0 ? round($total / count($data), 1) : 0;

        return [
            'daily' => $data,
            'total' => $total,
            'avgPerDay' => $avgPerDay,
        ];
    }

    /**
     * Get streak data for activities
     */
    private function getStreaksData(int $userId): array
    {
        $locale = request()->header('Accept-Language', 'en');
        
        $streaks = ActivityStreak::where('user_id', $userId)
            ->with(['activity.translations'])
            ->get()
            ->filter(fn($s) => $s->activity !== null)
            ->map(function ($streak) use ($locale) {
                $activity = $streak->activity;
                $translation = $activity->getTranslation($locale);
                $activityName = $translation?->name ?? $activity->name ?? 'Unknown';
                
                return [
                    'activityId' => $streak->activity_id,
                    'activityName' => $activityName,
                    'currentStreak' => $streak->current_streak,
                    'longestStreak' => $streak->longest_streak,
                    'totalCompletions' => $streak->total_completions,
                    'lastCompleted' => $streak->last_completed_date?->format('Y-m-d'),
                ];
            })
            ->sortByDesc('currentStreak')
            ->values()
            ->take(10)
            ->toArray();

        return [
            'items' => $streaks,
            'totalActive' => count(array_filter($streaks, fn($s) => $s['currentStreak'] > 0)),
        ];
    }

    /**
     * Get experience points earned per day
     */
    private function getExperienceData(int $userId, Carbon $startDate, Carbon $endDate): array
    {
        $data = PointTransaction::forUser($userId)
            ->whereBetween('created_at', [$startDate, $endDate->endOfDay()])
            ->where('amount', '>', 0)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(amount) as total')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'amount' => (int) $item->total,
                ];
            })
            ->values()
            ->toArray();

        $total = array_sum(array_column($data, 'amount'));

        return [
            'daily' => $data,
            'total' => $total,
            'avgPerDay' => count($data) > 0 ? round($total / count($data)) : 0,
        ];
    }

    /**
     * Get coins earned/spent per day
     */
    private function getCoinsData(int $userId, Carbon $startDate, Carbon $endDate): array
    {
        $earned = CoinTransaction::forUser($userId)
            ->whereBetween('created_at', [$startDate, $endDate->endOfDay()])
            ->where('amount', '>', 0)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(amount) as total')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $spent = CoinTransaction::forUser($userId)
            ->whereBetween('created_at', [$startDate, $endDate->endOfDay()])
            ->where('amount', '<', 0)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(ABS(amount)) as total')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        // Merge data
        $dates = array_unique(array_merge($earned->keys()->toArray(), $spent->keys()->toArray()));
        sort($dates);

        $data = [];
        foreach ($dates as $date) {
            $data[] = [
                'date' => $date,
                'earned' => isset($earned[$date]) ? (int) $earned[$date]->total : 0,
                'spent' => isset($spent[$date]) ? (int) $spent[$date]->total : 0,
            ];
        }

        $totalEarned = array_sum(array_column($data, 'earned'));
        $totalSpent = array_sum(array_column($data, 'spent'));

        return [
            'daily' => $data,
            'totalEarned' => $totalEarned,
            'totalSpent' => $totalSpent,
            'net' => $totalEarned - $totalSpent,
        ];
    }

    /**
     * Get summary statistics
     */
    private function getSummaryData(int $userId, Carbon $startDate, Carbon $endDate): array
    {
        $daysWithActivity = DailyStat::forUser($userId)
            ->whereBetween('date', [$startDate, $endDate])
            ->where('activities_completed', '>', 0)
            ->count();

        $totalDays = $startDate->diffInDays($endDate) + 1;
        
        return [
            'daysWithActivity' => $daysWithActivity,
            'totalDays' => $totalDays,
            'activityRate' => $totalDays > 0 ? round(($daysWithActivity / $totalDays) * 100) : 0,
        ];
    }
}

