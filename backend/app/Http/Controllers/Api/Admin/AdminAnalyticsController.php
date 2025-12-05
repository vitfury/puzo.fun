<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CoinTransaction;
use App\Models\PointTransaction;
use App\Models\User;
use App\Models\UserActivityLog;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminAnalyticsController extends Controller
{
    /**
     * Get daily analytics for users - activities and balance changes
     */
    public function dailyAnalytics(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'nullable|integer|exists:users,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'days' => 'nullable|integer|min:1|max:365',
        ]);

        $userId = $validated['user_id'] ?? null;
        $days = $validated['days'] ?? 30;
        
        // Get locale from request header or default to 'en'
        $locale = $request->header('Accept-Language', 'en');
        $locale = substr($locale, 0, 2);
        
        // Calculate date range
        $endDate = isset($validated['end_date']) 
            ? Carbon::parse($validated['end_date'])->endOfDay()
            : Carbon::today()->endOfDay();
        
        $startDate = isset($validated['start_date'])
            ? Carbon::parse($validated['start_date'])->startOfDay()
            : $endDate->copy()->subDays($days)->startOfDay();

        // Get all users or specific user
        $users = $userId 
            ? User::where('id', $userId)->get()
            : User::all();

        $dailyData = [];

        foreach ($users as $user) {
            // Get activities completed per day
            $activities = UserActivityLog::where('user_id', $user->id)
                ->whereBetween('date', [$startDate, $endDate])
                ->with('activity.translations')
                ->orderBy('date', 'asc')
                ->orderBy('completed_at', 'asc')
                ->get()
                ->groupBy(function ($log) {
                    return $log->date->format('Y-m-d');
                });

            // Get coin transactions per day
            $coinTransactions = CoinTransaction::where('user_id', $user->id)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->orderBy('created_at', 'asc')
                ->get()
                ->groupBy(function ($transaction) {
                    return Carbon::parse($transaction->created_at)->format('Y-m-d');
                });

            // Get point transactions per day
            $pointTransactions = PointTransaction::where('user_id', $user->id)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->orderBy('created_at', 'asc')
                ->get()
                ->groupBy(function ($transaction) {
                    return Carbon::parse($transaction->created_at)->format('Y-m-d');
                });

            // Build daily data
            $currentDate = $startDate->copy();
            while ($currentDate <= $endDate) {
                $dateKey = $currentDate->format('Y-m-d');
                
                $dayActivities = $activities->get($dateKey, collect());
                $dayCoins = $coinTransactions->get($dateKey, collect());
                $dayPoints = $pointTransactions->get($dateKey, collect());

                // Calculate daily totals
                $coinsEarned = $dayCoins->where('amount', '>', 0)->sum('amount');
                $coinsSpent = abs($dayCoins->where('amount', '<', 0)->sum('amount'));
                $pointsEarned = $dayPoints->where('amount', '>', 0)->sum('amount');
                $pointsSpent = abs($dayPoints->where('amount', '<', 0)->sum('amount'));

                $dailyData[] = [
                    'date' => $dateKey,
                    'user_id' => $user->id,
                    'user_nickname' => $user->nickname,
                    'user_email' => $user->email,
                    'activities' => $dayActivities->map(function ($log) use ($locale) {
                        $activity = $log->activity;
                        $translation = $activity ? $activity->getTranslation($locale) : null;
                        
                        return [
                            'id' => $log->activity_id,
                            'name' => $translation?->name ?? $activity?->name ?? 'Unknown',
                            'type' => $activity?->type ?? null,
                            'coins' => $activity?->coins ?? 0,
                            'experience' => $activity?->experience ?? 0,
                            'completed_at' => $log->completed_at?->format('Y-m-d H:i:s'),
                        ];
                    })->values()->toArray(),
                    'coin_transactions' => $dayCoins->map(function ($transaction) {
                        return [
                            'id' => $transaction->id,
                            'amount' => $transaction->amount,
                            'reason' => $transaction->reason,
                            'created_at' => $transaction->created_at->format('Y-m-d H:i:s'),
                            'metadata' => $transaction->metadata,
                        ];
                    })->values()->toArray(),
                    'point_transactions' => $dayPoints->map(function ($transaction) {
                        return [
                            'id' => $transaction->id,
                            'amount' => $transaction->amount,
                            'reason' => $transaction->reason,
                            'created_at' => $transaction->created_at->format('Y-m-d H:i:s'),
                            'metadata' => $transaction->metadata,
                        ];
                    })->values()->toArray(),
                    'summary' => [
                        'activities_count' => $dayActivities->count(),
                        'coins_earned' => $coinsEarned,
                        'coins_spent' => $coinsSpent,
                        'coins_net' => $coinsEarned - $coinsSpent,
                        'points_earned' => $pointsEarned,
                        'points_spent' => $pointsSpent,
                        'points_net' => $pointsEarned - $pointsSpent,
                    ],
                ];

                $currentDate->addDay();
            }
        }

        // Sort by date and user
        usort($dailyData, function ($a, $b) {
            if ($a['date'] === $b['date']) {
                return $a['user_id'] <=> $b['user_id'];
            }
            return $a['date'] <=> $b['date'];
        });

        return response()->json([
            'success' => true,
            'data' => $dailyData,
            'meta' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'total_days' => $startDate->diffInDays($endDate) + 1,
                'total_users' => $users->count(),
            ],
        ]);
    }

    /**
     * Get list of all users for selection
     */
    public function users(): JsonResponse
    {
        $users = User::select('id', 'nickname', 'email', 'role')
            ->orderBy('nickname')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    /**
     * Get summary statistics
     */
    public function summary(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'nullable|integer|exists:users,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'days' => 'nullable|integer|min:1|max:365',
        ]);

        $userId = $validated['user_id'] ?? null;
        $days = $validated['days'] ?? 30;
        
        $endDate = isset($validated['end_date']) 
            ? Carbon::parse($validated['end_date'])->endOfDay()
            : Carbon::today()->endOfDay();
        
        $startDate = isset($validated['start_date'])
            ? Carbon::parse($validated['start_date'])->startOfDay()
            : $endDate->copy()->subDays($days)->startOfDay();

        $query = DB::table('users');
        if ($userId) {
            $query->where('id', $userId);
        }

        $users = $query->get();

        $summary = [
            'total_users' => $users->count(),
            'total_activities' => UserActivityLog::whereBetween('date', [$startDate, $endDate])
                ->when($userId, fn($q) => $q->where('user_id', $userId))
                ->count(),
            'total_coins_earned' => CoinTransaction::whereBetween('created_at', [$startDate, $endDate])
                ->where('amount', '>', 0)
                ->when($userId, fn($q) => $q->where('user_id', $userId))
                ->sum('amount'),
            'total_coins_spent' => abs(CoinTransaction::whereBetween('created_at', [$startDate, $endDate])
                ->where('amount', '<', 0)
                ->when($userId, fn($q) => $q->where('user_id', $userId))
                ->sum('amount')),
            'total_points_earned' => PointTransaction::whereBetween('created_at', [$startDate, $endDate])
                ->where('amount', '>', 0)
                ->when($userId, fn($q) => $q->where('user_id', $userId))
                ->sum('amount'),
            'total_points_spent' => abs(PointTransaction::whereBetween('created_at', [$startDate, $endDate])
                ->where('amount', '<', 0)
                ->when($userId, fn($q) => $q->where('user_id', $userId))
                ->sum('amount')),
        ];

        $summary['total_coins_net'] = $summary['total_coins_earned'] - $summary['total_coins_spent'];
        $summary['total_points_net'] = $summary['total_points_earned'] - $summary['total_points_spent'];

        return response()->json([
            'success' => true,
            'data' => $summary,
            'meta' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
        ]);
    }
}

