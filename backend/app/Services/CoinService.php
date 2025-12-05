<?php

namespace App\Services;

use App\Models\CoinTransaction;
use App\Models\Equipment;
use App\Models\GameSetting;
use App\Models\User;
use App\Models\UserEquipment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class CoinService
{
    // Fallback values if DB settings not available
    private const DEFAULT_MUSIC_WALK_COINS = 10;
    private const DEFAULT_STREAK_BONUSES = [
        7 => 50,
        14 => 100,
        30 => 250,
        60 => 500,
        100 => 1000,
    ];

    /**
     * Get music walk coin reward from DB settings
     */
    public function getMusicWalkReward(): int
    {
        return GameSetting::getValue('music_walk_coins', self::DEFAULT_MUSIC_WALK_COINS);
    }

    /**
     * Get streak bonuses from DB settings
     */
    public function getStreakBonuses(): array
    {
        return [
            7 => GameSetting::getValue('streak_bonus_7', self::DEFAULT_STREAK_BONUSES[7]),
            14 => GameSetting::getValue('streak_bonus_14', self::DEFAULT_STREAK_BONUSES[14]),
            30 => GameSetting::getValue('streak_bonus_30', self::DEFAULT_STREAK_BONUSES[30]),
            60 => GameSetting::getValue('streak_bonus_60', self::DEFAULT_STREAK_BONUSES[60]),
            100 => GameSetting::getValue('streak_bonus_100', self::DEFAULT_STREAK_BONUSES[100]),
        ];
    }

    /**
     * Award coins to a user
     */
    public function awardCoins(
        User $user,
        int $amount,
        string $reason,
        ?Model $source = null,
        ?array $metadata = null
    ): CoinTransaction {
        return DB::transaction(function () use ($user, $amount, $reason, $source, $metadata) {
            $user->increment('coins', $amount);

            return CoinTransaction::create([
                'user_id' => $user->id,
                'amount' => $amount,
                'reason' => $reason,
                'source_type' => $source ? get_class($source) : null,
                'source_id' => $source?->id,
                'metadata' => $metadata,
            ]);
        });
    }

    /**
     * Deduct coins from a user
     */
    public function deductCoins(
        User $user,
        int $amount,
        string $reason,
        ?Model $source = null,
        ?array $metadata = null
    ): CoinTransaction {
        return DB::transaction(function () use ($user, $amount, $reason, $source, $metadata) {
            $user->decrement('coins', $amount);

            return CoinTransaction::create([
                'user_id' => $user->id,
                'amount' => -$amount,
                'reason' => $reason,
                'source_type' => $source ? get_class($source) : null,
                'source_id' => $source?->id,
                'metadata' => $metadata,
            ]);
        });
    }

    /**
     * Award coins for music walk
     */
    public function awardMusicWalkCoins(User $user): CoinTransaction
    {
        return $this->awardCoins(
            user: $user,
            amount: $this->getMusicWalkReward(),
            reason: CoinTransaction::REASON_MUSIC_WALK
        );
    }

    /**
     * @deprecated Use StreakService for activity streak bonuses instead
     * This method is kept for backward compatibility but should not be used for new code
     */
    public function checkAndAwardStreakBonus(User $user): ?CoinTransaction
    {
        // Legacy method - no longer used
        // Activity streaks now use StreakService::getMilestoneBonus()
        return null;
    }

    /**
     * Purchase equipment
     */
    public function purchaseEquipment(User $user, Equipment $equipment): array
    {
        // Check if user already owns this equipment
        $alreadyOwns = UserEquipment::where('user_id', $user->id)
            ->where('equipment_id', $equipment->id)
            ->exists();

        if ($alreadyOwns) {
            return [
                'success' => false,
                'error' => 'already_owned',
                'message' => 'You already own this equipment',
            ];
        }

        // Check level requirement
        if (!$equipment->canBeEquippedBy($user)) {
            return [
                'success' => false,
                'error' => 'level_too_low',
                'message' => "You need level {$equipment->required_level} to purchase this",
            ];
        }

        // Check coins
        if ($user->coins < $equipment->price) {
            return [
                'success' => false,
                'error' => 'insufficient_coins',
                'message' => 'Not enough coins',
            ];
        }

        return DB::transaction(function () use ($user, $equipment) {
            // Deduct coins
            $this->deductCoins(
                user: $user,
                amount: $equipment->price,
                reason: CoinTransaction::REASON_PURCHASE,
                source: $equipment,
                metadata: ['equipment_name' => $equipment->name]
            );

            // Add to user's inventory
            UserEquipment::create([
                'user_id' => $user->id,
                'equipment_id' => $equipment->id,
                'purchased_price' => $equipment->price,
            ]);

            return [
                'success' => true,
                'message' => "Successfully purchased {$equipment->name}",
            ];
        });
    }

    /**
     * Equip equipment
     */
    public function equipItem(User $user, Equipment $equipment): array
    {
        // Check if user owns this equipment
        $ownership = UserEquipment::where('user_id', $user->id)
            ->where('equipment_id', $equipment->id)
            ->first();

        if (!$ownership) {
            return [
                'success' => false,
                'error' => 'not_owned',
                'message' => 'You do not own this equipment',
            ];
        }

        // Check level requirement (in case level dropped somehow)
        if (!$equipment->canBeEquippedBy($user)) {
            return [
                'success' => false,
                'error' => 'level_too_low',
                'message' => "You need level {$equipment->required_level} to equip this",
            ];
        }

        // Update equipped item
        if ($equipment->type === Equipment::TYPE_ARMOR) {
            $user->equipped_armor_id = $equipment->id;
        } else {
            $user->equipped_weapon_id = $equipment->id;
        }

        $user->save();

        return [
            'success' => true,
            'message' => "Equipped {$equipment->name}",
        ];
    }

    /**
     * Unequip item
     */
    public function unequipItem(User $user, string $type): array
    {
        if ($type === Equipment::TYPE_ARMOR) {
            $user->equipped_armor_id = null;
        } else {
            $user->equipped_weapon_id = null;
        }

        $user->save();

        return [
            'success' => true,
            'message' => "Unequipped {$type}",
        ];
    }

    /**
     * Sell equipment back to shop
     */
    public function sellEquipment(User $user, Equipment $equipment): array
    {
        // Starter items cannot be sold (Apprentice armor and Club weapon)
        if ($equipment->name === 'Apprentice' || $equipment->name === 'Club') {
            return [
                'success' => false,
                'error' => 'starter_item',
                'message' => 'Starter equipment cannot be sold',
            ];
        }

        // Check if user owns this equipment
        $ownership = UserEquipment::where('user_id', $user->id)
            ->where('equipment_id', $equipment->id)
            ->first();

        if (!$ownership) {
            return [
                'success' => false,
                'error' => 'not_owned',
                'message' => 'You do not own this equipment',
            ];
        }

        // Check if item is currently equipped
        if (
            ($equipment->type === Equipment::TYPE_ARMOR && $user->equipped_armor_id === $equipment->id) ||
            ($equipment->type === Equipment::TYPE_WEAPON && $user->equipped_weapon_id === $equipment->id)
        ) {
            return [
                'success' => false,
                'error' => 'item_equipped',
                'message' => 'You must unequip this item before selling',
            ];
        }

        // Get the price user paid (stored in user_equipment) or current price
        $sellPrice = $ownership->purchased_price ?? $equipment->price;

        return DB::transaction(function () use ($user, $equipment, $ownership, $sellPrice) {
            // Award coins back
            $this->awardCoins(
                user: $user,
                amount: $sellPrice,
                reason: CoinTransaction::REASON_SELL,
                source: $equipment,
                metadata: ['equipment_name' => $equipment->name]
            );

            // Remove from user's inventory
            $ownership->delete();

            return [
                'success' => true,
                'message' => "Successfully sold {$equipment->name} for {$sellPrice} coins",
                'coins_received' => $sellPrice,
            ];
        });
    }

    /**
     * Get user's coin transactions
     */
    public function getUserTransactions(User $user, int $days = 30)
    {
        return CoinTransaction::forUser($user->id)
            ->recent($days)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get user's inventory
     */
    public function getUserInventory(User $user)
    {
        return $user->ownedEquipment()
            ->orderBy('type')
            ->orderBy('grade')
            ->orderBy('sort_order')
            ->get();
    }
}

