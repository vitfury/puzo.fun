<?php

namespace Database\Seeders;

use App\Models\Equipment;
use Illuminate\Database\Seeder;

class EquipmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * БАЛАНС ЦІН ДЛЯ 6-МІСЯЧНОЇ ПРОГРАМИ:
     * 
     * Розрахунок монет за період:
     * - Тиждень 1: ~630 монет (тренування + таски + streak)
     * - Місяць 1-2: ~7,500 монет
     * - Місяць 3-4: ~8,000 монет
     * - Місяць 5-6: ~8,000 монет
     * - ВСЬОГО за 6 місяців: ~24,000-30,000 монет
     * 
     * Ціни встановлені так, щоб:
     * - Тиждень 1: D-grade базова (Scale + Crimson ~750 монет)
     * - Місяць 1-2: C-grade (~3,000-5,000 монет)
     * - Місяць 2-3: B-grade (~8,000-12,000 монет)
     * - Місяць 3-5: A-grade (~16,000-24,000 монет)
     * - Місяць 5-6: S-grade (Dynasty set ~34,000 монет для активних)
     * 
     * PRODUCTION DATA - synced from local DB on 2025-12-02
     */
    public function run(): void
    {
        $equipment = [
            // ================================================
            // NO-GRADE ARMOR (Levels 1-19)
            // Перший тиждень, мінімальні витрати
            // ================================================
            ['name' => 'Apprentice', 'type' => 'armor', 'grade' => 'no-grade', 'required_level' => 1, 'price' => 0, 'sort_order' => 1],
            ['name' => 'Bone', 'type' => 'armor', 'grade' => 'no-grade', 'required_level' => 1, 'price' => 100, 'sort_order' => 2],
            ['name' => 'Bronze', 'type' => 'armor', 'grade' => 'no-grade', 'required_level' => 1, 'price' => 200, 'sort_order' => 3],

            // ================================================
            // D-GRADE ARMOR (Levels 20-39)
            // Тижні 1-3, доступно ~630-1500 монет
            // ================================================
            ['name' => 'Scale', 'type' => 'armor', 'grade' => 'D', 'required_level' => 20, 'price' => 400, 'sort_order' => 4],
            ['name' => 'Brigandine', 'type' => 'armor', 'grade' => 'D', 'required_level' => 20, 'price' => 800, 'sort_order' => 5],

            // ================================================
            // C-GRADE ARMOR (Levels 40-51)
            // Місяць 1-2, доступно ~2000-4000 монет
            // ================================================
            ['name' => 'Composite', 'type' => 'armor', 'grade' => 'C', 'required_level' => 40, 'price' => 1500, 'sort_order' => 6],
            ['name' => 'Full Plate', 'type' => 'armor', 'grade' => 'C', 'required_level' => 40, 'price' => 2500, 'sort_order' => 7],

            // ================================================
            // B-GRADE ARMOR (Levels 52-60)
            // Місяць 2-3, доступно ~5000-8000 монет
            // ================================================
            ['name' => 'Zubei', 'type' => 'armor', 'grade' => 'B', 'required_level' => 52, 'price' => 4000, 'sort_order' => 8],
            ['name' => 'Avadon', 'type' => 'armor', 'grade' => 'B', 'required_level' => 52, 'price' => 6000, 'sort_order' => 9],
            ['name' => 'Blue Wolf', 'type' => 'armor', 'grade' => 'B', 'required_level' => 52, 'price' => 8000, 'sort_order' => 10],
            ['name' => 'Doom', 'type' => 'armor', 'grade' => 'B', 'required_level' => 52, 'price' => 10000, 'sort_order' => 11],

            // ================================================
            // A-GRADE ARMOR (Levels 61-75)
            // Місяць 3-5, доступно ~10000-18000 монет
            // ================================================
            ['name' => 'Dark Crystal', 'type' => 'armor', 'grade' => 'A', 'required_level' => 61, 'price' => 8000, 'sort_order' => 12],
            ['name' => 'Tallum', 'type' => 'armor', 'grade' => 'A', 'required_level' => 61, 'price' => 12000, 'sort_order' => 13],
            ['name' => 'Majestic', 'type' => 'armor', 'grade' => 'A', 'required_level' => 61, 'price' => 16000, 'sort_order' => 14],
            ['name' => 'Nightmare', 'type' => 'armor', 'grade' => 'A', 'required_level' => 61, 'price' => 20000, 'sort_order' => 15],

            // ================================================
            // S-GRADE ARMOR (Levels 76-80)
            // Місяць 5-6, доступно ~18000-24000 монет
            // ================================================
            ['name' => 'Imperial Crusader', 'type' => 'armor', 'grade' => 'S', 'required_level' => 76, 'price' => 12000, 'sort_order' => 16],
            ['name' => 'Dynasty', 'type' => 'armor', 'grade' => 'S', 'required_level' => 76, 'price' => 16000, 'sort_order' => 17],
            ['name' => 'Vesper', 'type' => 'armor', 'grade' => 'S', 'required_level' => 80, 'price' => 22000, 'sort_order' => 18],

            // ================================================
            // NO-GRADE WEAPONS - SWORDS (Levels 1-19)
            // ================================================
            ['name' => 'Club', 'type' => 'weapon', 'grade' => 'no-grade', 'required_level' => 1, 'price' => 0, 'sort_order' => 1],
            ['name' => 'Short Sword', 'type' => 'weapon', 'grade' => 'no-grade', 'required_level' => 1, 'price' => 50, 'sort_order' => 2],
            ['name' => 'Gladius', 'type' => 'weapon', 'grade' => 'no-grade', 'required_level' => 1, 'price' => 100, 'sort_order' => 3],
            ['name' => 'Falchion', 'type' => 'weapon', 'grade' => 'no-grade', 'required_level' => 1, 'price' => 200, 'sort_order' => 4],

            // ================================================
            // D-GRADE WEAPONS - SWORDS (Levels 20-39)
            // Тижні 1-3
            // ================================================
            ['name' => 'Crimson Sword', 'type' => 'weapon', 'grade' => 'D', 'required_level' => 20, 'price' => 350, 'sort_order' => 5],
            ['name' => 'Sword of Revolution', 'type' => 'weapon', 'grade' => 'D', 'required_level' => 20, 'price' => 700, 'sort_order' => 6],
            ['name' => 'Elven Long Sword', 'type' => 'weapon', 'grade' => 'D', 'required_level' => 20, 'price' => 1200, 'sort_order' => 7],

            // ================================================
            // C-GRADE WEAPONS - SWORDS (Levels 40-51)
            // Місяць 1-2
            // ================================================
            ['name' => 'Stormbringer', 'type' => 'weapon', 'grade' => 'C', 'required_level' => 40, 'price' => 1400, 'sort_order' => 8],
            ['name' => 'Sword of Delusion', 'type' => 'weapon', 'grade' => 'C', 'required_level' => 40, 'price' => 2200, 'sort_order' => 9],
            ['name' => 'Samurai Longsword', 'type' => 'weapon', 'grade' => 'C', 'required_level' => 40, 'price' => 3500, 'sort_order' => 10],

            // ================================================
            // B-GRADE WEAPONS - SWORDS (Levels 52-60)
            // Місяць 2-3
            // ================================================
            ['name' => 'Keshanberk', 'type' => 'weapon', 'grade' => 'B', 'required_level' => 52, 'price' => 5000, 'sort_order' => 11],
            ['name' => 'Sword of Damascus', 'type' => 'weapon', 'grade' => 'B', 'required_level' => 52, 'price' => 9000, 'sort_order' => 12],

            // ================================================
            // A-GRADE WEAPONS - SWORDS (Levels 61-75)
            // Місяць 3-5
            // ================================================
            ['name' => 'Tallum Blade', 'type' => 'weapon', 'grade' => 'A', 'required_level' => 61, 'price' => 10000, 'sort_order' => 13],
            ['name' => 'Dark Legion Edge', 'type' => 'weapon', 'grade' => 'A', 'required_level' => 61, 'price' => 18000, 'sort_order' => 14],

            // ================================================
            // S-GRADE WEAPONS - SWORDS (Levels 76-80)
            // Місяць 5-6
            // ================================================
            ['name' => 'Forgotten Blade', 'type' => 'weapon', 'grade' => 'S', 'required_level' => 76, 'price' => 14000, 'sort_order' => 15],
            ['name' => 'Dynasty Sword', 'type' => 'weapon', 'grade' => 'S', 'required_level' => 76, 'price' => 18000, 'sort_order' => 16],
            ['name' => 'Vesper Sword', 'type' => 'weapon', 'grade' => 'S', 'required_level' => 80, 'price' => 24000, 'sort_order' => 17],

            // ================================================
            // D-GRADE WEAPONS - AXES/BLUNTS (Levels 20-39)
            // ================================================
            ['name' => 'Work Hammer', 'type' => 'weapon', 'grade' => 'D', 'required_level' => 20, 'price' => 2000, 'sort_order' => 51],
            ['name' => 'Tarbar', 'type' => 'weapon', 'grade' => 'D', 'required_level' => 20, 'price' => 2500, 'sort_order' => 52],

            // ================================================
            // C-GRADE WEAPONS - AXES/BLUNTS (Levels 40-51)
            // ================================================
            ['name' => 'War Axe', 'type' => 'weapon', 'grade' => 'C', 'required_level' => 40, 'price' => 8000, 'sort_order' => 53],
            ['name' => 'Ecliptic Axe', 'type' => 'weapon', 'grade' => 'C', 'required_level' => 40, 'price' => 9000, 'sort_order' => 54],

            // ================================================
            // B-GRADE WEAPONS - AXES/BLUNTS (Levels 52-60)
            // ================================================
            ['name' => 'Heavy War Axe', 'type' => 'weapon', 'grade' => 'B', 'required_level' => 52, 'price' => 20000, 'sort_order' => 55],
            ['name' => 'Deadmans Glory', 'type' => 'weapon', 'grade' => 'B', 'required_level' => 52, 'price' => 22000, 'sort_order' => 56],

            // ================================================
            // A-GRADE WEAPONS - AXES/BLUNTS (Levels 61-75)
            // ================================================
            ['name' => 'Meteor Shower', 'type' => 'weapon', 'grade' => 'A', 'required_level' => 61, 'price' => 50000, 'sort_order' => 57],
            ['name' => 'Barakiel Axe', 'type' => 'weapon', 'grade' => 'A', 'required_level' => 61, 'price' => 55000, 'sort_order' => 58],

            // ================================================
            // S-GRADE WEAPONS - AXES/BLUNTS (Levels 76-80)
            // ================================================
            ['name' => 'Basalt Battlehammer', 'type' => 'weapon', 'grade' => 'S', 'required_level' => 76, 'price' => 150000, 'sort_order' => 59],
            ['name' => 'Dynasty Cudgel', 'type' => 'weapon', 'grade' => 'S', 'required_level' => 76, 'price' => 160000, 'sort_order' => 60],
            ['name' => 'Vesper Avenger', 'type' => 'weapon', 'grade' => 'S', 'required_level' => 80, 'price' => 200000, 'sort_order' => 61],
        ];

        foreach ($equipment as $item) {
            Equipment::updateOrCreate(
                ['name' => $item['name'], 'type' => $item['type']],
                $item
            );
        }

        $this->command->info('✅ Equipment seeded!');
        $this->command->info('');
        $this->command->info('🛡️ ARMOR:');
        $this->command->info('   No-Grade: 3 items (0-200 монет)');
        $this->command->info('   D-Grade:  2 items (400-800 монет)');
        $this->command->info('   C-Grade:  2 items (1,500-2,500 монет)');
        $this->command->info('   B-Grade:  4 items (4,000-10,000 монет)');
        $this->command->info('   A-Grade:  4 items (8,000-20,000 монет)');
        $this->command->info('   S-Grade:  3 items (12,000-22,000 монет)');
        $this->command->info('');
        $this->command->info('⚔️ WEAPONS (Swords):');
        $this->command->info('   No-Grade: 4 items (0-200 монет)');
        $this->command->info('   D-Grade:  3 items (350-1,200 монет)');
        $this->command->info('   C-Grade:  3 items (1,400-3,500 монет)');
        $this->command->info('   B-Grade:  2 items (5,000-9,000 монет)');
        $this->command->info('   A-Grade:  2 items (10,000-18,000 монет)');
        $this->command->info('   S-Grade:  3 items (14,000-24,000 монет)');
        $this->command->info('');
        $this->command->info('🪓 WEAPONS (Axes/Blunts):');
        $this->command->info('   D-Grade:  2 items (2,000-2,500 монет)');
        $this->command->info('   C-Grade:  2 items (8,000-9,000 монет)');
        $this->command->info('   B-Grade:  2 items (20,000-22,000 монет)');
        $this->command->info('   A-Grade:  2 items (50,000-55,000 монет)');
        $this->command->info('   S-Grade:  3 items (150,000-200,000 монет)');
    }
}
