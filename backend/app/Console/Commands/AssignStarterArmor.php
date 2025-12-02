<?php

namespace App\Console\Commands;

use App\Models\Equipment;
use App\Models\User;
use App\Models\UserEquipment;
use Illuminate\Console\Command;

class AssignStarterArmor extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:assign-starter-equipment';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Assign and equip starter equipment (Apprentice armor and Club weapon) to all users';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->assignStarterArmor();
        $this->assignStarterWeapon();
        
        $this->info('Done!');
        return self::SUCCESS;
    }

    private function assignStarterArmor(): void
    {
        $apprenticeArmor = Equipment::where('name', 'Apprentice')
            ->where('type', Equipment::TYPE_ARMOR)
            ->first();

        if (!$apprenticeArmor) {
            $this->error('Apprentice armor not found in database. Please run EquipmentSeeder first.');
            return;
        }

        $this->info("Found Apprentice armor (ID: {$apprenticeArmor->id})");

        // Get users without Apprentice armor in inventory
        $usersWithoutArmor = User::whereDoesntHave('ownedEquipment', function ($query) use ($apprenticeArmor) {
            $query->where('equipment.id', $apprenticeArmor->id);
        })->get();

        $this->info("Found {$usersWithoutArmor->count()} users without Apprentice armor");

        $addedCount = 0;
        $equippedCount = 0;

        foreach ($usersWithoutArmor as $user) {
            // Add armor to inventory
            UserEquipment::create([
                'user_id' => $user->id,
                'equipment_id' => $apprenticeArmor->id,
                'purchased_price' => 0,
            ]);
            $addedCount++;

            // Equip if user has no armor equipped
            if (!$user->equipped_armor_id) {
                $user->equipped_armor_id = $apprenticeArmor->id;
                $user->save();
                $equippedCount++;
            }
        }

        // Also equip for users who have armor in inventory but nothing equipped
        $usersWithArmorNotEquipped = User::whereNull('equipped_armor_id')
            ->whereHas('ownedEquipment', function ($query) use ($apprenticeArmor) {
                $query->where('equipment.id', $apprenticeArmor->id);
            })->get();

        foreach ($usersWithArmorNotEquipped as $user) {
            $user->equipped_armor_id = $apprenticeArmor->id;
            $user->save();
            $equippedCount++;
        }

        $this->info("Added Apprentice armor to {$addedCount} users");
        $this->info("Equipped Apprentice armor for {$equippedCount} users");
    }

    private function assignStarterWeapon(): void
    {
        $clubWeapon = Equipment::where('name', 'Club')
            ->where('type', Equipment::TYPE_WEAPON)
            ->first();

        if (!$clubWeapon) {
            $this->error('Club weapon not found in database. Please run EquipmentSeeder first.');
            return;
        }

        $this->info("Found Club weapon (ID: {$clubWeapon->id})");

        // Get users without Club weapon in inventory
        $usersWithoutWeapon = User::whereDoesntHave('ownedEquipment', function ($query) use ($clubWeapon) {
            $query->where('equipment.id', $clubWeapon->id);
        })->get();

        $this->info("Found {$usersWithoutWeapon->count()} users without Club weapon");

        $addedCount = 0;
        $equippedCount = 0;

        foreach ($usersWithoutWeapon as $user) {
            // Add weapon to inventory
            UserEquipment::create([
                'user_id' => $user->id,
                'equipment_id' => $clubWeapon->id,
                'purchased_price' => 0,
            ]);
            $addedCount++;

            // Equip if user has no weapon equipped
            if (!$user->equipped_weapon_id) {
                $user->equipped_weapon_id = $clubWeapon->id;
                $user->save();
                $equippedCount++;
            }
        }

        // Also equip for users who have weapon in inventory but nothing equipped
        $usersWithWeaponNotEquipped = User::whereNull('equipped_weapon_id')
            ->whereHas('ownedEquipment', function ($query) use ($clubWeapon) {
                $query->where('equipment.id', $clubWeapon->id);
            })->get();

        foreach ($usersWithWeaponNotEquipped as $user) {
            $user->equipped_weapon_id = $clubWeapon->id;
            $user->save();
            $equippedCount++;
        }

        $this->info("Added Club weapon to {$addedCount} users");
        $this->info("Equipped Club weapon for {$equippedCount} users");
    }
}
