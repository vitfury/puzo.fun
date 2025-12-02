<?php

namespace Database\Seeders;

use App\Models\GameSetting;
use Illuminate\Database\Seeder;

class GameSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // Coin rewards
            [
                'key' => 'music_walk_coins',
                'value' => '10',
                'type' => 'integer',
                'group' => 'coins',
                'description' => 'Coins awarded for completing a music walk',
            ],
            [
                'key' => 'streak_bonus_7',
                'value' => '50',
                'type' => 'integer',
                'group' => 'coins',
                'description' => 'Bonus coins for 7-day streak',
            ],
            [
                'key' => 'streak_bonus_14',
                'value' => '100',
                'type' => 'integer',
                'group' => 'coins',
                'description' => 'Bonus coins for 14-day streak',
            ],
            [
                'key' => 'streak_bonus_30',
                'value' => '250',
                'type' => 'integer',
                'group' => 'coins',
                'description' => 'Bonus coins for 30-day streak',
            ],
            [
                'key' => 'streak_bonus_60',
                'value' => '500',
                'type' => 'integer',
                'group' => 'coins',
                'description' => 'Bonus coins for 60-day streak',
            ],
            [
                'key' => 'streak_bonus_100',
                'value' => '1000',
                'type' => 'integer',
                'group' => 'coins',
                'description' => 'Bonus coins for 100-day streak',
            ],
            
            // Level settings
            [
                'key' => 'xp_rate',
                'value' => '1.0',
                'type' => 'float',
                'group' => 'levels',
                'description' => 'XP rate multiplier (higher = easier leveling)',
            ],
            [
                'key' => 'base_points_per_level',
                'value' => '100',
                'type' => 'integer',
                'group' => 'levels',
                'description' => 'Base XP points needed for level 1->2',
            ],
        ];

        foreach ($settings as $setting) {
            GameSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}

