<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\EquipmentResource;
use App\Models\Equipment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminEquipmentController extends Controller
{
    /**
     * List all equipment
     */
    public function index(): JsonResponse
    {
        $equipment = Equipment::orderBy('type')
            ->orderBy('grade')
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => EquipmentResource::collection($equipment),
        ]);
    }

    /**
     * Show single equipment
     */
    public function show(Equipment $equipment): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new EquipmentResource($equipment),
        ]);
    }

    /**
     * Update equipment (mainly for price adjustments)
     */
    public function update(Request $request, Equipment $equipment): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'price' => 'sometimes|integer|min:0',
            'required_level' => 'sometimes|integer|min:1|max:80',
            'is_active' => 'sometimes|boolean',
            'sort_order' => 'sometimes|integer|min:0',
        ]);

        $equipment->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Equipment updated successfully',
            'data' => new EquipmentResource($equipment),
        ]);
    }

    /**
     * Create new equipment
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:armor,weapon',
            'grade' => 'required|in:no-grade,D,C,B,A,S',
            'required_level' => 'required|integer|min:1|max:80',
            'price' => 'required|integer|min:0',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $equipment = Equipment::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Equipment created successfully',
            'data' => new EquipmentResource($equipment),
        ], 201);
    }

    /**
     * Delete equipment
     */
    public function destroy(Equipment $equipment): JsonResponse
    {
        // Check if any users have this equipped
        $usersWithEquipped = \App\Models\User::where('equipped_armor_id', $equipment->id)
            ->orWhere('equipped_weapon_id', $equipment->id)
            ->count();

        if ($usersWithEquipped > 0) {
            return response()->json([
                'success' => false,
                'message' => "Cannot delete: {$usersWithEquipped} users have this equipped",
            ], 400);
        }

        $equipment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Equipment deleted successfully',
        ]);
    }

    /**
     * Bulk update prices
     */
    public function bulkUpdatePrices(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'updates' => 'required|array',
            'updates.*.id' => 'required|exists:equipment,id',
            'updates.*.price' => 'required|integer|min:0',
        ]);

        foreach ($validated['updates'] as $update) {
            Equipment::where('id', $update['id'])->update(['price' => $update['price']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Prices updated successfully',
        ]);
    }
}

