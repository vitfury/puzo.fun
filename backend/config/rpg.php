<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Level System Configuration
    |--------------------------------------------------------------------------
    |
    | Configure the leveling system including max level and difficulty
    | multipliers for different level brackets.
    |
    | Note: xp_rate and base_points_per_level are now managed via admin panel
    | in the game_settings table. These are fallback values only.
    |
    */

    'levels' => [
        // Maximum level a player can reach
        'max_level' => 80,

        // Difficulty brackets with multipliers
        // Higher multiplier = more points needed per level in that bracket
        'difficulty_brackets' => [
            ['min' => 1, 'max' => 19, 'multiplier' => 1.0, 'name' => 'easy'],      // Легко
            ['min' => 20, 'max' => 39, 'multiplier' => 1.5, 'name' => 'medium'],   // Важче
            ['min' => 40, 'max' => 51, 'multiplier' => 2.0, 'name' => 'hard'],     // Ще важче
            ['min' => 52, 'max' => 60, 'multiplier' => 3.0, 'name' => 'very_hard'], // Ще важче
            ['min' => 61, 'max' => 75, 'multiplier' => 5.0, 'name' => 'extreme'],   // Супер важко
            ['min' => 76, 'max' => 80, 'multiplier' => 10.0, 'name' => 'legendary'], // Майже нереально
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Coin Rewards Configuration
    |--------------------------------------------------------------------------
    |
    | NOTE: Coin rewards are now managed via admin panel in the game_settings
    | table. Go to Admin -> Game Settings to configure:
    | - music_walk_coins: Coins per music walk
    | - streak_bonus_7/14/30/60/100: Streak milestone bonuses
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Equipment Grade Level Requirements
    |--------------------------------------------------------------------------
    |
    | Minimum level required to equip items of each grade.
    |
    */

    'grades' => [
        'no-grade' => ['min_level' => 1, 'max_level' => 19],
        'D' => ['min_level' => 20, 'max_level' => 39],
        'C' => ['min_level' => 40, 'max_level' => 51],
        'B' => ['min_level' => 52, 'max_level' => 60],
        'A' => ['min_level' => 61, 'max_level' => 76],
        'S' => ['min_level' => 76, 'max_level' => 80],
    ],
];

