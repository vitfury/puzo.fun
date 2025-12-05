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
        
        $query = User::with(['equippedArmor', 'equippedWeapon'])
            ->where('users.role', '!=', 'admin'); // Exclude admins from rating
        
        // Apply sorting
        $query->orderBy("users.{$sortBy}", $sortDirection);
        
        $users = $query->get()->map(function ($user, $index) {
                return [
                    'rank' => $index + 1,
                    'id' => $user->id,
                    'nickname' => $user->nickname,
                    'level' => $user->level ?? 1,
                    'total_points' => $user->total_points,
                    'coins' => (int) $user->coins, // Use current balance
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

