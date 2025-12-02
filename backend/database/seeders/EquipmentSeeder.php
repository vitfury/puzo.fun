<?php

namespace Database\Seeders;

use App\Models\Equipment;
use Illuminate\Database\Seeder;

class EquipmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $equipment = [
            // === ARMOR ===
            // No-Grade (Levels 1-19)
            ['name' => 'Apprentice', 'type' => 'armor', 'grade' => 'no-grade', 'required_level' => 1, 'price' => 0, 'sort_order' => 1],
            ['name' => 'Bone', 'type' => 'armor', 'grade' => 'no-grade', 'required_level' => 1, 'price' => 200, 'sort_order' => 2],
            ['name' => 'Bronze', 'type' => 'armor', 'grade' => 'no-grade', 'required_level' => 1, 'price' => 300, 'sort_order' => 2],

            // D Grade (Levels 20-39)
            ['name' => 'Scale', 'type' => 'armor', 'grade' => 'D', 'required_level' => 20, 'price' => 1000, 'sort_order' => 3],
            ['name' => 'Brigandine', 'type' => 'armor', 'grade' => 'D', 'required_level' => 20, 'price' => 2500, 'sort_order' => 4],

            // C Grade (Levels 40-51)
            ['name' => 'Composite', 'type' => 'armor', 'grade' => 'C', 'required_level' => 40, 'price' => 5000, 'sort_order' => 5],
            ['name' => 'Full Plate', 'type' => 'armor', 'grade' => 'C', 'required_level' => 40, 'price' => 8000, 'sort_order' => 6],

            // B Grade (Levels 52-60)
            ['name' => 'Zubei', 'type' => 'armor', 'grade' => 'B', 'required_level' => 52, 'price' => 15000, 'sort_order' => 7],
            ['name' => 'Avadon', 'type' => 'armor', 'grade' => 'B', 'required_level' => 52, 'price' => 20000, 'sort_order' => 8],
            ['name' => 'Blue Wolf', 'type' => 'armor', 'grade' => 'B', 'required_level' => 52, 'price' => 25000, 'sort_order' => 9],
            ['name' => 'Doom', 'type' => 'armor', 'grade' => 'B', 'required_level' => 52, 'price' => 30000, 'sort_order' => 10],

            // A Grade (Levels 61-75)
            ['name' => 'Dark Crystal', 'type' => 'armor', 'grade' => 'A', 'required_level' => 61, 'price' => 50000, 'sort_order' => 11],
            ['name' => 'Tallum', 'type' => 'armor', 'grade' => 'A', 'required_level' => 61, 'price' => 75000, 'sort_order' => 12],
            ['name' => 'Majestic', 'type' => 'armor', 'grade' => 'A', 'required_level' => 61, 'price' => 100000, 'sort_order' => 13],
            ['name' => 'Nightmare', 'type' => 'armor', 'grade' => 'A', 'required_level' => 61, 'price' => 125000, 'sort_order' => 14],

            // S Grade (Levels 76-80)
            ['name' => 'Imperial Crusader', 'type' => 'armor', 'grade' => 'S', 'required_level' => 76, 'price' => 200000, 'sort_order' => 15],
            ['name' => 'Dynasty', 'type' => 'armor', 'grade' => 'S', 'required_level' => 76, 'price' => 350000, 'sort_order' => 16],
            ['name' => 'Vesper', 'type' => 'armor', 'grade' => 'S', 'required_level' => 80, 'price' => 500000, 'sort_order' => 17],

            // === WEAPONS ===
            // No-Grade (Levels 1-19)
            ['name' => 'Short Sword', 'type' => 'weapon', 'grade' => 'no-grade', 'required_level' => 1, 'price' => 50, 'sort_order' => 1],
            ['name' => 'Gladius', 'type' => 'weapon', 'grade' => 'no-grade', 'required_level' => 1, 'price' => 150, 'sort_order' => 2],
            ['name' => 'Falchion', 'type' => 'weapon', 'grade' => 'no-grade', 'required_level' => 1, 'price' => 400, 'sort_order' => 3],

            // D Grade (Levels 20-39)
            ['name' => 'Crimson Sword', 'type' => 'weapon', 'grade' => 'D', 'required_level' => 20, 'price' => 800, 'sort_order' => 4],
            ['name' => 'Sword of Revolution', 'type' => 'weapon', 'grade' => 'D', 'required_level' => 20, 'price' => 1500, 'sort_order' => 5],
            ['name' => 'Elven Long Sword', 'type' => 'weapon', 'grade' => 'D', 'required_level' => 20, 'price' => 3000, 'sort_order' => 6],

            // C Grade (Levels 40-51)
            ['name' => 'Stormbringer', 'type' => 'weapon', 'grade' => 'C', 'required_level' => 40, 'price' => 4500, 'sort_order' => 7],
            ['name' => 'Sword of Delusion', 'type' => 'weapon', 'grade' => 'C', 'required_level' => 40, 'price' => 7000, 'sort_order' => 8],
            ['name' => 'Samurai Longsword', 'type' => 'weapon', 'grade' => 'C', 'required_level' => 40, 'price' => 10000, 'sort_order' => 9],

            // B Grade (Levels 52-60)
            ['name' => 'Keshanberk', 'type' => 'weapon', 'grade' => 'B', 'required_level' => 52, 'price' => 18000, 'sort_order' => 10],
            ['name' => 'Sword of Damascus', 'type' => 'weapon', 'grade' => 'B', 'required_level' => 52, 'price' => 35000, 'sort_order' => 11],

            // A Grade (Levels 61-75)
            ['name' => 'Tallum Blade', 'type' => 'weapon', 'grade' => 'A', 'required_level' => 61, 'price' => 60000, 'sort_order' => 12],
            ['name' => 'Dark Legion Edge', 'type' => 'weapon', 'grade' => 'A', 'required_level' => 61, 'price' => 120000, 'sort_order' => 13],

            // S Grade (Levels 76-80)
            ['name' => 'Forgotten Blade', 'type' => 'weapon', 'grade' => 'S', 'required_level' => 76, 'price' => 250000, 'sort_order' => 14],
            ['name' => 'Dynasty Sword', 'type' => 'weapon', 'grade' => 'S', 'required_level' => 76, 'price' => 400000, 'sort_order' => 15],
            ['name' => 'Vesper Sword', 'type' => 'weapon', 'grade' => 'S', 'required_level' => 80, 'price' => 600000, 'sort_order' => 16],
        ];

        foreach ($equipment as $item) {
            Equipment::updateOrCreate(
                ['name' => $item['name'], 'type' => $item['type']],
                $item
            );
        }
    }
}

