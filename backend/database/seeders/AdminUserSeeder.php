<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\User::create([
            'nickname' => 'Admin',
            'email' => 'admin@melody.ninja',
            'password' => bcrypt('admin123'),
            'role' => 'admin',
            'avatar_level' => 1,
            'total_points' => 0,
            'current_music_walk_streak' => 0,
            'longest_music_walk_streak' => 0,
            'date_of_birth' => '2000-01-01',
        ]);

        \App\Models\User::create([
            'nickname' => 'TestUser',
            'email' => 'user@melody.ninja',
            'password' => bcrypt('user123'),
            'role' => 'user',
            'avatar_level' => 1,
            'total_points' => 0,
            'current_music_walk_streak' => 0,
            'longest_music_walk_streak' => 0,
            'date_of_birth' => '2011-05-15',
        ]);
    }
}
