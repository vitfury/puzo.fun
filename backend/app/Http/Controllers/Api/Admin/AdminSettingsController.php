<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\GameSetting;
use App\Models\User;
use App\Services\LevelService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSettingsController extends Controller
{
    /**
     * Get all game settings
     */
    public function index(): JsonResponse
    {
        $settings = GameSetting::orderBy('group')
            ->orderBy('key')
            ->get()
            ->map(function ($setting) {
                return [
                    'id' => $setting->id,
                    'key' => $setting->key,
                    'value' => $setting->typed_value,
                    'type' => $setting->type,
                    'group' => $setting->group,
                    'description' => $setting->description,
                ];
            });

        // Group settings by their group
        $grouped = $settings->groupBy('group');

        return response()->json([
            'success' => true,
            'data' => [
                'settings' => $settings,
                'grouped' => $grouped,
            ],
        ]);
    }

    /**
     * Get settings by group
     */
    public function byGroup(string $group): JsonResponse
    {
        $settings = GameSetting::where('group', $group)
            ->orderBy('key')
            ->get()
            ->map(function ($setting) {
                return [
                    'id' => $setting->id,
                    'key' => $setting->key,
                    'value' => $setting->typed_value,
                    'type' => $setting->type,
                    'group' => $setting->group,
                    'description' => $setting->description,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * Update a setting
     */
    public function update(Request $request, string $key): JsonResponse
    {
        $request->validate([
            'value' => 'required',
        ]);

        $setting = GameSetting::where('key', $key)->firstOrFail();
        
        // Validate value based on type
        $value = $request->input('value');
        
        if ($setting->type === 'integer' && !is_numeric($value)) {
            return response()->json([
                'success' => false,
                'message' => 'Value must be a number',
            ], 422);
        }

        if ($setting->type === 'float' && !is_numeric($value)) {
            return response()->json([
                'success' => false,
                'message' => 'Value must be a number',
            ], 422);
        }

        $setting->update([
            'value' => is_array($value) ? json_encode($value) : (string) $value,
        ]);

        GameSetting::clearCache();

        return response()->json([
            'success' => true,
            'message' => 'Setting updated successfully',
            'data' => [
                'key' => $setting->key,
                'value' => $setting->typed_value,
            ],
        ]);
    }

    /**
     * Bulk update settings
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'required',
        ]);

        $updated = [];

        foreach ($request->input('settings') as $item) {
            $setting = GameSetting::where('key', $item['key'])->first();
            
            if ($setting) {
                $setting->update([
                    'value' => is_array($item['value']) ? json_encode($item['value']) : (string) $item['value'],
                ]);
                $updated[] = $item['key'];
            }
        }

        GameSetting::clearCache();

        return response()->json([
            'success' => true,
            'message' => count($updated) . ' settings updated',
            'updated' => $updated,
        ]);
    }

    /**
     * Update user's coins and points (for testing)
     */
    public function updateUserStats(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'coins' => 'sometimes|integer|min:0',
            'total_points' => 'sometimes|integer|min:0',
        ]);

        $user = User::findOrFail($request->input('user_id'));
        
        $updates = [];
        
        if ($request->has('coins')) {
            $user->coins = $request->input('coins');
            $updates[] = 'coins';
        }
        
        if ($request->has('total_points')) {
            $user->total_points = $request->input('total_points');
            $updates[] = 'total_points';
            
            // Recalculate level based on new points
            $levelService = new LevelService();
            $newLevel = $levelService->calculateLevelFromPoints($user->total_points);
            $user->level = $newLevel;
            $updates[] = 'level';
        }
        
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'User stats updated: ' . implode(', ', $updates),
            'data' => [
                'user_id' => $user->id,
                'coins' => $user->coins,
                'total_points' => $user->total_points,
                'level' => $user->level,
            ],
        ]);
    }

    /**
     * Get current user stats (for admin to see their own stats)
     */
    public function getCurrentUserStats(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'user_id' => $user->id,
                'nickname' => $user->nickname,
                'coins' => $user->coins,
                'total_points' => $user->total_points,
                'level' => $user->level,
            ],
        ]);
    }

    /**
     * Update user's race (for testing different race avatars)
     */
    public function updateUserRace(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'race' => 'required|in:human,elf,dark_elf,orc,dwarf',
        ]);

        $user = User::findOrFail($request->input('user_id'));
        $user->race = $request->input('race');
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'User race updated to ' . $user->race,
            'data' => [
                'race' => $user->race,
            ],
        ]);
    }
}

