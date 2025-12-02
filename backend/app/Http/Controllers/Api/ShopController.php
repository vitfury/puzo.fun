<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EquipmentResource;
use App\Models\Equipment;
use App\Services\CoinService;
use App\Services\LevelService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShopController extends Controller
{
    public function __construct(
        private CoinService $coinService,
        private LevelService $levelService
    ) {
    }

    /**
     * List all available equipment in shop
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $type = $request->input('type'); // 'armor' or 'weapon'
        $grade = $request->input('grade'); // 'no-grade', 'D', 'C', 'B', 'A', 'S'

        $query = Equipment::active()
            ->orderBy('type')
            ->orderBy('required_level')
            ->orderBy('sort_order');

        if ($type) {
            $query->ofType($type);
        }

        if ($grade) {
            $query->ofGrade($grade);
        }

        $equipment = $query->get();

        // Get user's owned equipment IDs
        $ownedIds = $user->ownedEquipment()->pluck('equipment.id')->toArray();

        return response()->json([
            'success' => true,
            'data' => [
                'equipment' => EquipmentResource::collection($equipment),
                'owned_ids' => $ownedIds,
                'user_level' => $user->level,
                'user_coins' => $user->coins,
                'available_grade' => $user->getAvailableGrade(),
            ],
        ]);
    }

    /**
     * Get user's inventory (owned equipment)
     */
    public function inventory(Request $request): JsonResponse
    {
        $user = $request->user();

        $inventory = $this->coinService->getUserInventory($user);

        return response()->json([
            'success' => true,
            'data' => [
                'inventory' => EquipmentResource::collection($inventory),
                'equipped_armor_id' => $user->equipped_armor_id,
                'equipped_weapon_id' => $user->equipped_weapon_id,
            ],
        ]);
    }

    /**
     * Purchase equipment
     */
    public function purchase(Request $request, Equipment $equipment): JsonResponse
    {
        $user = $request->user();

        if (!$equipment->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'This equipment is not available for purchase',
            ], 400);
        }

        $result = $this->coinService->purchaseEquipment($user, $equipment);

        if (!$result['success']) {
            return response()->json($result, 400);
        }

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'data' => [
                'equipment' => new EquipmentResource($equipment),
                'user_coins' => $user->fresh()->coins,
            ],
        ]);
    }

    /**
     * Equip an item
     */
    public function equip(Request $request, Equipment $equipment): JsonResponse
    {
        $user = $request->user();

        $result = $this->coinService->equipItem($user, $equipment);

        if (!$result['success']) {
            return response()->json($result, 400);
        }

        $user->refresh();

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'data' => [
                'equipped_armor_id' => $user->equipped_armor_id,
                'equipped_weapon_id' => $user->equipped_weapon_id,
                'equipped_armor' => $user->equippedArmor ? new EquipmentResource($user->equippedArmor) : null,
                'equipped_weapon' => $user->equippedWeapon ? new EquipmentResource($user->equippedWeapon) : null,
            ],
        ]);
    }

    /**
     * Unequip an item
     */
    public function unequip(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:armor,weapon',
        ]);

        $user = $request->user();
        $type = $request->input('type');

        $result = $this->coinService->unequipItem($user, $type);

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'data' => [
                'equipped_armor_id' => $user->equipped_armor_id,
                'equipped_weapon_id' => $user->equipped_weapon_id,
            ],
        ]);
    }

    /**
     * Sell equipment back to shop
     */
    public function sell(Request $request, Equipment $equipment): JsonResponse
    {
        $user = $request->user();

        $result = $this->coinService->sellEquipment($user, $equipment);

        if (!$result['success']) {
            return response()->json($result, 400);
        }

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'data' => [
                'equipment' => new EquipmentResource($equipment),
                'user_coins' => $user->fresh()->coins,
                'coins_received' => $result['coins_received'],
            ],
        ]);
    }

    /**
     * Get level progress info
     */
    public function levelProgress(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => $this->levelService->getLevelProgress($user),
        ]);
    }

    /**
     * Get coin transaction history
     */
    public function coinHistory(Request $request): JsonResponse
    {
        $user = $request->user();
        $days = $request->input('days', 30);

        $transactions = $this->coinService->getUserTransactions($user, $days);

        return response()->json([
            'success' => true,
            'data' => [
                'transactions' => $transactions,
                'balance' => $user->coins,
            ],
        ]);
    }
}

