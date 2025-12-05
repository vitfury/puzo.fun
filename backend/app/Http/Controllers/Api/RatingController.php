<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RatingController extends Controller
{
    /**
     * Get all players for the rating list
     */
    public function index(Request $request): JsonResponse
    {
        $sortBy = $request->get('sort', 'total_points');
        $sortDirection = $request->get('direction', 'desc');
        
        // Validate sort field
        $allowedSorts = ['total_points', 'level', 'coins', 'current_music_walk_streak'];
        if (!in_array($sortBy, $allowedSorts)) {
            $sortBy = 'total_points';
        }
        
        // Calculate total earned coins - only count coins from activities (not from selling equipment)
        // Exclude activity transactions that have corresponding negative "Uncompleted activity" transactions
        // for the same activity on the same date (these were cancelled)
        $totalEarnedCoinsSubquery = DB::table('coin_transactions as ct')
            ->select('ct.user_id', DB::raw('COALESCE(SUM(ct.amount), 0) as total_earned_coins'))
            ->where('ct.amount', '>', 0)
            ->where('ct.source_type', 'App\\Models\\Activity') // Only count activity transactions
            ->whereNotExists(function ($subQuery) {
                // Exclude transactions that have corresponding negative "Uncompleted activity" transactions
                $subQuery->select(DB::raw(1))
                    ->from('coin_transactions as ct2')
                    ->whereColumn('ct2.user_id', 'ct.user_id')
                    ->whereColumn('ct2.source_type', 'ct.source_type')
                    ->whereColumn('ct2.source_id', 'ct.source_id')
                    ->where('ct2.amount', '<', 0)
                    ->whereRaw('DATE(ct2.created_at) = DATE(ct.created_at)')
                    ->where('ct2.reason', 'like', 'Uncompleted activity:%');
            })
            ->groupBy('ct.user_id');
        
        $query = User::with(['equippedArmor', 'equippedWeapon'])
            ->addSelect([
                'users.*',
                DB::raw('COALESCE(earned_coins.total_earned_coins, 0) as total_earned_coins')
            ])
            ->leftJoinSub($totalEarnedCoinsSubquery, 'earned_coins', function ($join) {
                $join->on('users.id', '=', 'earned_coins.user_id');
            })
            ->where('users.role', '!=', 'admin'); // Exclude admins from rating
        
        // Apply sorting
        if ($sortBy === 'coins') {
            // When sorting by coins, sort by total earned coins instead
            $query->orderBy('total_earned_coins', $sortDirection);
        } else {
            $query->orderBy("users.{$sortBy}", $sortDirection);
        }
        
        $users = $query->get()->map(function ($user, $index) {
                return [
                    'rank' => $index + 1,
                    'id' => $user->id,
                    'nickname' => $user->nickname,
                    'level' => $user->level ?? 1,
                    'total_points' => $user->total_points,
                    'coins' => (int) $user->total_earned_coins, // Use total earned coins instead of current balance
                    'race' => $user->race ?? 'human',
                    'current_music_walk_streak' => $user->current_music_walk_streak,
                    'longest_music_walk_streak' => $user->longest_music_walk_streak,
                    'equipped_armor' => $user->equippedArmor ? [
                        'id' => $user->equippedArmor->id,
                        'name' => $user->equippedArmor->name,
                        'type' => $user->equippedArmor->type,
                        'grade' => $user->equippedArmor->grade,
                    ] : null,
                    'equipped_weapon' => $user->equippedWeapon ? [
                        'id' => $user->equippedWeapon->id,
                        'name' => $user->equippedWeapon->name,
                        'type' => $user->equippedWeapon->type,
                        'grade' => $user->equippedWeapon->grade,
                    ] : null,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $users,
            'total' => $users->count(),
        ]);
    }
}

