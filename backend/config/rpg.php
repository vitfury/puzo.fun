<?php

/**
 * RPG System Configuration
 * 
 * БАЛАНС ДЛЯ 6-МІСЯЧНОЇ ПРОГРАМИ:
 * 
 * Цілі:
 * - Тиждень 1: Рівень 20, D-grade екіпа
 * - Місяць 1-2: Рівні 20-40, C-grade екіпа
 * - Місяць 2-3: Рівні 40-52, B-grade екіпа
 * - Місяць 3-5: Рівні 52-61, A-grade екіпа
 * - Місяць 5-6: Рівні 61-80, S-grade екіпа
 * 
 * XP розрахунки (при base_points=20, xp_rate=1.0):
 * - Рівні 1-19: 3,800 XP (543/день × 7 днів)
 * - Рівні 20-39: 14,160 XP
 * - Рівні 40-51: 16,380 XP
 * - Рівні 52-60: 20,160 XP
 * - Рівні 61-75: 61,200 XP
 * - Рівні 76-80: 39,000 XP
 * - ВСЬОГО до 80: ~154,700 XP (~860/день × 180 днів)
 */

return [
    /*
    |--------------------------------------------------------------------------
    | Level System Configuration
    |--------------------------------------------------------------------------
    |
    | Difficulty brackets define how much harder each level range becomes.
    | Lower multipliers = easier progression, higher = slower grind.
    |
    | Note: base_points_per_level and xp_rate are managed via game_settings table.
    |
    */

    'levels' => [
        // Maximum level a player can reach
        'max_level' => 80,

        // Difficulty brackets with multipliers
        // Формула: XP для рівня = base_points × level × multiplier / xp_rate
        'difficulty_brackets' => [
            // Початок - швидкий старт, щоб зацікавити гравця
            ['min' => 1, 'max' => 19, 'multiplier' => 1.0, 'name' => 'easy'],
            
            // D-grade зона - трохи складніше
            ['min' => 20, 'max' => 39, 'multiplier' => 1.2, 'name' => 'medium'],
            
            // C-grade зона - помірна складність
            ['min' => 40, 'max' => 51, 'multiplier' => 1.5, 'name' => 'hard'],
            
            // B-grade зона - вже серйозно
            ['min' => 52, 'max' => 60, 'multiplier' => 2.0, 'name' => 'very_hard'],
            
            // A-grade зона - потрібна постійність
            ['min' => 61, 'max' => 75, 'multiplier' => 3.0, 'name' => 'extreme'],
            
            // S-grade зона - для справжніх героїв
            ['min' => 76, 'max' => 80, 'multiplier' => 5.0, 'name' => 'legendary'],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Equipment Grade Level Requirements
    |--------------------------------------------------------------------------
    |
    | Minimum and maximum level for each equipment grade.
    | Players can equip items only if their level is >= required_level.
    |
    */

    'grades' => [
        'no-grade' => ['min_level' => 1, 'max_level' => 19],
        'D' => ['min_level' => 20, 'max_level' => 39],
        'C' => ['min_level' => 40, 'max_level' => 51],
        'B' => ['min_level' => 52, 'max_level' => 60],
        'A' => ['min_level' => 61, 'max_level' => 75],
        'S' => ['min_level' => 76, 'max_level' => 80],
    ],

    /*
    |--------------------------------------------------------------------------
    | Streak System Configuration
    |--------------------------------------------------------------------------
    |
    | Weekly streak milestones and their coin rewards.
    | Managed via game_settings table (streak_bonus_7, streak_bonus_14, etc.)
    |
    | Default values:
    | - 1 week (7 days): 200 coins
    | - 2 weeks (14 days): 400 coins
    | - 3 weeks (21 days): 600 coins
    | - 4 weeks (28 days): 1000 coins
    |
    */

    'streaks' => [
        'milestones' => [7, 14, 21, 28],
    ],
];
