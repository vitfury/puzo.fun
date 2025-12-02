<?php

namespace Database\Seeders;

use App\Models\Equipment;
use Illuminate\Database\Seeder;

class EquipmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * ОНОВЛЕНО 2025-12-03: Ціни підвищено на ~45% під новий баланс монет
     *
     * БАЛАНС ЦІН ДЛЯ 6-МІСЯЧНОЇ ПРОГРАМИ:
     *
     * Розрахунок монет за період (НОВИЙ БАЛАНС):
     * - Тиждень 1: ~900-1,100 монет (тренування + таски + streak)
     * - Місяць 1-2: ~10,500-12,000 монет
     * - Місяць 3-4: ~11,500-13,000 монет
     * - Місяць 5-6: ~11,500-13,000 монет
     * - ВСЬОГО за 6 місяців: ~35,000-44,000 монет (+45% від старого)
     *
     * Ціни встановлені так, щоб:
     * - Тиждень 1: D-grade базова (Scale + Crimson ~1,100 монет)
     * - Місяць 1-2: C-grade (~4,500-7,500 монет)
     * - Місяць 2-3: B-grade (~12,000-18,000 монет)
     * - Місяць 3-5: A-grade (~24,000-36,000 монет)
     * - Місяць 5-6: S-grade (Dynasty set ~50,000 монет для дуже активних)
     *
     * PRODUCTION DATA - synced from local DB on 2025-12-02, updated 2025-12-03
     */
    public function run(): void
    {
        $equipment = [
            // ================================================
            // NO-GRADE ARMOR (Levels 1-19)
            // Перший тиждень, мінімальні витрати
            // ================================================
            ['name' => 'Apprentice', 'type' => 'armor', 'grade' => 'no-grade', 'required_level' => 1, 'price' => 0, 'sort_order' => 1],
            ['name' => 'Bone', 'type' => 'armor', 'grade' => 'no-grade', 'required_level' => 1, 'price' => 150, 'sort_order' => 2], // +50
            ['name' => 'Bronze', 'type' => 'armor', 'grade' => 'no-grade', 'required_level' => 1, 'price' => 300, 'sort_order' => 3], // +100

            // ================================================
            // D-GRADE ARMOR (Levels 20-39)
            // Тижні 1-3, доступно ~900-2200 монет
            // ================================================
            ['name' => 'Scale', 'type' => 'armor', 'grade' => 'D', 'required_level' => 20, 'price' => 600, 'sort_order' => 4], // +200 (+50%)
            ['name' => 'Brigandine', 'type' => 'armor', 'grade' => 'D', 'required_level' => 20, 'price' => 1200, 'sort_order' => 5], // +400 (+50%)

            // ================================================
            // C-GRADE ARMOR (Levels 40-51)
            // Місяць 1-2, доступно ~3000-6000 монет
            // ================================================
            ['name' => 'Composite', 'type' => 'armor', 'grade' => 'C', 'required_level' => 40, 'price' => 2200, 'sort_order' => 6], // +700 (+47%)
            ['name' => 'Full Plate', 'type' => 'armor', 'grade' => 'C', 'required_level' => 40, 'price' => 3600, 'sort_order' => 7], // +1100 (+44%)

            // ================================================
            // B-GRADE ARMOR (Levels 52-60)
            // Місяць 2-3, доступно ~7500-12000 монет
            // ================================================
            ['name' => 'Zubei', 'type' => 'armor', 'grade' => 'B', 'required_level' => 52, 'price' => 6000, 'sort_order' => 8], // +2000 (+50%)
            ['name' => 'Avadon', 'type' => 'armor', 'grade' => 'B', 'required_level' => 52, 'price' => 9000, 'sort_order' => 9], // +3000 (+50%)
            ['name' => 'Blue Wolf', 'type' => 'armor', 'grade' => 'B', 'required_level' => 52, 'price' => 12000, 'sort_order' => 10], // +4000 (+50%)
            ['name' => 'Doom', 'type' => 'armor', 'grade' => 'B', 'required_level' => 52, 'price' => 15000, 'sort_order' => 11], // +5000 (+50%)

            // ================================================
            // A-GRADE ARMOR (Levels 61-75)
            // Місяць 3-5, доступно ~15000-27000 монет
            // ================================================
            ['name' => 'Dark Crystal', 'type' => 'armor', 'grade' => 'A', 'required_level' => 61, 'price' => 12000, 'sort_order' => 12], // +4000 (+50%)
            ['name' => 'Tallum', 'type' => 'armor', 'grade' => 'A', 'required_level' => 61, 'price' => 18000, 'sort_order' => 13], // +6000 (+50%)
            ['name' => 'Majestic', 'type' => 'armor', 'grade' => 'A', 'required_level' => 61, 'price' => 24000, 'sort_order' => 14], // +8000 (+50%)
            ['name' => 'Nightmare', 'type' => 'armor', 'grade' => 'A', 'required_level' => 61, 'price' => 30000, 'sort_order' => 15], // +10000 (+50%)

            // ================================================
            // S-GRADE ARMOR (Levels 76-80)
            // Місяць 5-6, доступно ~27000-36000 монет
            // ================================================
            ['name' => 'Imperial Crusader', 'type' => 'armor', 'grade' => 'S', 'required_level' => 76, 'price' => 18000, 'sort_order' => 16], // +6000 (+50%)
            ['name' => 'Dynasty', 'type' => 'armor', 'grade' => 'S', 'required_level' => 76, 'price' => 24000, 'sort_order' => 17], // +8000 (+50%)
            ['name' => 'Vesper', 'type' => 'armor', 'grade' => 'S', 'required_level' => 80, 'price' => 33000, 'sort_order' => 18], // +11000 (+50%)

            // ================================================
            // NO-GRADE WEAPONS - SWORDS (Levels 1-19)
            // ================================================
            ['name' => 'Club', 'type' => 'weapon', 'grade' => 'no-grade', 'required_level' => 1, 'price' => 0, 'sort_order' => 1],
            ['name' => 'Short Sword', 'type' => 'weapon', 'grade' => 'no-grade', 'required_level' => 1, 'price' => 80, 'sort_order' => 2], // +30
            ['name' => 'Gladius', 'type' => 'weapon', 'grade' => 'no-grade', 'required_level' => 1, 'price' => 150, 'sort_order' => 3], // +50
            ['name' => 'Falchion', 'type' => 'weapon', 'grade' => 'no-grade', 'required_level' => 1, 'price' => 300, 'sort_order' => 4], // +100

            // ================================================
            // D-GRADE WEAPONS - SWORDS (Levels 20-39)
            // Тижні 1-3
            // ================================================
            ['name' => 'Crimson Sword', 'type' => 'weapon', 'grade' => 'D', 'required_level' => 20, 'price' => 500, 'sort_order' => 5], // +150 (+43%)
            ['name' => 'Sword of Revolution', 'type' => 'weapon', 'grade' => 'D', 'required_level' => 20, 'price' => 1000, 'sort_order' => 6], // +300 (+43%)
            ['name' => 'Elven Long Sword', 'type' => 'weapon', 'grade' => 'D', 'required_level' => 20, 'price' => 1700, 'sort_order' => 7], // +500 (+42%)

            // ================================================
            // C-GRADE WEAPONS - SWORDS (Levels 40-51)
            // Місяць 1-2
            // ================================================
            ['name' => 'Stormbringer', 'type' => 'weapon', 'grade' => 'C', 'required_level' => 40, 'price' => 2000, 'sort_order' => 8], // +600 (+43%)
            ['name' => 'Sword of Delusion', 'type' => 'weapon', 'grade' => 'C', 'required_level' => 40, 'price' => 3200, 'sort_order' => 9], // +1000 (+45%)
            ['name' => 'Samurai Longsword', 'type' => 'weapon', 'grade' => 'C', 'required_level' => 40, 'price' => 5000, 'sort_order' => 10], // +1500 (+43%)

            // ================================================
            // B-GRADE WEAPONS - SWORDS (Levels 52-60)
            // Місяць 2-3
            // ================================================
            ['name' => 'Keshanberk', 'type' => 'weapon', 'grade' => 'B', 'required_level' => 52, 'price' => 7500, 'sort_order' => 11], // +2500 (+50%)
            ['name' => 'Sword of Damascus', 'type' => 'weapon', 'grade' => 'B', 'required_level' => 52, 'price' => 13000, 'sort_order' => 12], // +4000 (+44%)

            // ================================================
            // A-GRADE WEAPONS - SWORDS (Levels 61-75)
            // Місяць 3-5
            // ================================================
            ['name' => 'Tallum Blade', 'type' => 'weapon', 'grade' => 'A', 'required_level' => 61, 'price' => 15000, 'sort_order' => 13], // +5000 (+50%)
            ['name' => 'Dark Legion Edge', 'type' => 'weapon', 'grade' => 'A', 'required_level' => 61, 'price' => 26000, 'sort_order' => 14], // +8000 (+44%)

            // ================================================
            // S-GRADE WEAPONS - SWORDS (Levels 76-80)
            // Місяць 5-6
            // ================================================
            ['name' => 'Forgotten Blade', 'type' => 'weapon', 'grade' => 'S', 'required_level' => 76, 'price' => 20000, 'sort_order' => 15], // +6000 (+43%)
            ['name' => 'Dynasty Sword', 'type' => 'weapon', 'grade' => 'S', 'required_level' => 76, 'price' => 26000, 'sort_order' => 16], // +8000 (+44%)
            ['name' => 'Vesper Sword', 'type' => 'weapon', 'grade' => 'S', 'required_level' => 80, 'price' => 35000, 'sort_order' => 17], // +11000 (+46%)

            // ================================================
            // D-GRADE WEAPONS - AXES/BLUNTS (Levels 20-39)
            // ================================================
            ['name' => 'Work Hammer', 'type' => 'weapon', 'grade' => 'D', 'required_level' => 20, 'price' => 2900, 'sort_order' => 51], // +900 (+45%)
            ['name' => 'Tarbar', 'type' => 'weapon', 'grade' => 'D', 'required_level' => 20, 'price' => 3600, 'sort_order' => 52], // +1100 (+44%)

            // ================================================
            // C-GRADE WEAPONS - AXES/BLUNTS (Levels 40-51)
            // ================================================
            ['name' => 'War Axe', 'type' => 'weapon', 'grade' => 'C', 'required_level' => 40, 'price' => 11500, 'sort_order' => 53], // +3500 (+44%)
            ['name' => 'Ecliptic Axe', 'type' => 'weapon', 'grade' => 'C', 'required_level' => 40, 'price' => 13000, 'sort_order' => 54], // +4000 (+44%)

            // ================================================
            // B-GRADE WEAPONS - AXES/BLUNTS (Levels 52-60)
            // ================================================
            ['name' => 'Heavy War Axe', 'type' => 'weapon', 'grade' => 'B', 'required_level' => 52, 'price' => 29000, 'sort_order' => 55], // +9000 (+45%)
            ['name' => 'Deadmans Glory', 'type' => 'weapon', 'grade' => 'B', 'required_level' => 52, 'price' => 32000, 'sort_order' => 56], // +10000 (+45%)

            // ================================================
            // A-GRADE WEAPONS - AXES/BLUNTS (Levels 61-75)
            // ================================================
            ['name' => 'Meteor Shower', 'type' => 'weapon', 'grade' => 'A', 'required_level' => 61, 'price' => 72000, 'sort_order' => 57], // +22000 (+44%)
            ['name' => 'Barakiel Axe', 'type' => 'weapon', 'grade' => 'A', 'required_level' => 61, 'price' => 80000, 'sort_order' => 58], // +25000 (+45%)

            // ================================================
            // S-GRADE WEAPONS - AXES/BLUNTS (Levels 76-80)
            // Ексклюзивна зброя для найдосвідченіших гравців
            // ================================================
            ['name' => 'Basalt Battlehammer', 'type' => 'weapon', 'grade' => 'S', 'required_level' => 76, 'price' => 220000, 'sort_order' => 59], // +70000 (+47%)
            ['name' => 'Dynasty Cudgel', 'type' => 'weapon', 'grade' => 'S', 'required_level' => 76, 'price' => 235000, 'sort_order' => 60], // +75000 (+47%)
            ['name' => 'Vesper Avenger', 'type' => 'weapon', 'grade' => 'S', 'required_level' => 80, 'price' => 290000, 'sort_order' => 61], // +90000 (+45%)
        ];

        foreach ($equipment as $item) {
            Equipment::updateOrCreate(
                ['name' => $item['name'], 'type' => $item['type']],
                $item
            );
        }

        $this->command->info('✅ Equipment seeded! (UPDATED 2025-12-03)');
        $this->command->info('');
        $this->command->info('🛡️ ARMOR (ціни підвищено на ~44-50%):');
        $this->command->info('   No-Grade: 3 items (0-300 монет)');
        $this->command->info('   D-Grade:  2 items (600-1,200 монет)');
        $this->command->info('   C-Grade:  2 items (2,200-3,600 монет)');
        $this->command->info('   B-Grade:  4 items (6,000-15,000 монет)');
        $this->command->info('   A-Grade:  4 items (12,000-30,000 монет)');
        $this->command->info('   S-Grade:  3 items (18,000-33,000 монет)');
        $this->command->info('');
        $this->command->info('⚔️ WEAPONS - Swords (ціни підвищено на ~42-50%):');
        $this->command->info('   No-Grade: 4 items (0-300 монет)');
        $this->command->info('   D-Grade:  3 items (500-1,700 монет)');
        $this->command->info('   C-Grade:  3 items (2,000-5,000 монет)');
        $this->command->info('   B-Grade:  2 items (7,500-13,000 монет)');
        $this->command->info('   A-Grade:  2 items (15,000-26,000 монет)');
        $this->command->info('   S-Grade:  3 items (20,000-35,000 монет)');
        $this->command->info('');
        $this->command->info('🪓 WEAPONS - Axes/Blunts (ціни підвищено на ~44-47%):');
        $this->command->info('   D-Grade:  2 items (2,900-3,600 монет)');
        $this->command->info('   C-Grade:  2 items (11,500-13,000 монет)');
        $this->command->info('   B-Grade:  2 items (29,000-32,000 монет)');
        $this->command->info('   A-Grade:  2 items (72,000-80,000 монет)');
        $this->command->info('   S-Grade:  3 items (220,000-290,000 монет) ⭐ Ексклюзив');
    }
}
