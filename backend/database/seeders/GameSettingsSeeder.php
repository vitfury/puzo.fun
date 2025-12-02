<?php

namespace Database\Seeders;

use App\Models\GameSetting;
use Illuminate\Database\Seeder;

class GameSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * ОНОВЛЕНО 2025-12-03: Баланс після підвищення винагород
     *
     * Баланс монет (підвищено ~40-50%):
     * - Денні таски: ~45 монет/день (ліміт калорій + кроки + фрукт)
     * - Тренування: ~60-100 монет/день (зарядка, зал або HIIT)
     * - Музична прогулянка: 60 монет/день
     * - Середньо: ~165-205 монет/день при активній грі
     * - За 6 місяців: ~30,000-37,000 монет
     * - Streak бонуси: 200-1000 за тиждень (додатково)
     *
     * Баланс XP (підвищено ~35-45%):
     * - base_points_per_level = 20
     * - Правила + завдання: ~350-550 XP/день
     * - Тренування: ~180-250 XP/день
     * - Музична прогулянка: 120 XP/день
     * - Середньо: 650-920 XP/день
     * - Рівень 20 за 7 днів: потрібно ~3,800 XP (~543/день) ✅
     * - Рівень 80 за 180 днів: потрібно ~155,000 XP (~860/день) ✅
     */
    public function run(): void
    {
        $settings = [
            // ============================================
            // LEVEL SETTINGS
            // ============================================
            [
                'key' => 'xp_rate',
                'value' => '1.0',
                'type' => 'float',
                'group' => 'levels',
                'description' => 'XP rate multiplier (higher = easier leveling)',
            ],
            [
                'key' => 'base_points_per_level',
                'value' => '20',
                'type' => 'integer',
                'group' => 'levels',
                'description' => 'Base XP points needed for level 1->2 (формула: base * level * multiplier)',
            ],

            // ============================================
            // WEEKLY STREAK BONUSES (only coins!)
            // Streak рахується по днях безперервного виконання
            // ============================================
            [
                'key' => 'streak_bonus_7',
                'value' => '200',
                'type' => 'integer',
                'group' => 'streaks',
                'description' => 'Бонус монет за 1 тиждень (7 днів) streak',
            ],
            [
                'key' => 'streak_bonus_14',
                'value' => '400',
                'type' => 'integer',
                'group' => 'streaks',
                'description' => 'Бонус монет за 2 тижні (14 днів) streak',
            ],
            [
                'key' => 'streak_bonus_21',
                'value' => '600',
                'type' => 'integer',
                'group' => 'streaks',
                'description' => 'Бонус монет за 3 тижні (21 день) streak',
            ],
            [
                'key' => 'streak_bonus_28',
                'value' => '1000',
                'type' => 'integer',
                'group' => 'streaks',
                'description' => 'Бонус монет за 4 тижні (28 днів) streak',
            ],

            // ============================================
            // LEGACY STREAK BONUSES (keep for backward compatibility)
            // ============================================
            [
                'key' => 'streak_bonus_30',
                'value' => '1000',
                'type' => 'integer',
                'group' => 'streaks_legacy',
                'description' => '[Legacy] Бонус монет за 30 днів streak',
            ],
            [
                'key' => 'streak_bonus_60',
                'value' => '2500',
                'type' => 'integer',
                'group' => 'streaks_legacy',
                'description' => '[Legacy] Бонус монет за 60 днів streak',
            ],
            [
                'key' => 'streak_bonus_100',
                'value' => '5000',
                'type' => 'integer',
                'group' => 'streaks_legacy',
                'description' => '[Legacy] Бонус монет за 100 днів streak',
            ],

            // ============================================
            // COIN REWARDS
            // ============================================
            [
                'key' => 'music_walk_coins',
                'value' => '50',
                'type' => 'integer',
                'group' => 'coins',
                'description' => 'Монети за музичну прогулянку (fallback value)',
            ],
        ];

        foreach ($settings as $setting) {
            GameSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }

        $this->command->info('✅ Game settings seeded!');
        $this->command->info('');
        $this->command->info('📊 Налаштування балансу:');
        $this->command->info('   - base_points_per_level: 20');
        $this->command->info('   - xp_rate: 1.0');
        $this->command->info('   - Середній XP/день: 650-920 (підвищено на ~40%)');
        $this->command->info('   - Середні монети/день: 165-205 (підвищено на ~45%)');
        $this->command->info('');
        $this->command->info('🏆 Streak бонуси (монети):');
        $this->command->info('   - 1 тиждень (7 днів): 200 монет');
        $this->command->info('   - 2 тижні (14 днів): 400 монет');
        $this->command->info('   - 3 тижні (21 день): 600 монет');
        $this->command->info('   - 4 тижні (28 днів): 1000 монет');
    }
}
