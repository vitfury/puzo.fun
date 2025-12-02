<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Creates only admin user for production.
     * Password should be changed after first login!
     */
    public function run(): void
    {
        \App\Models\User::create([
            'nickname' => 'Admin',
            'email' => 'admin@puzo.fun',
            'password' => bcrypt('admin123'),
            'role' => 'admin',
            'avatar_level' => 1,
            'total_points' => 0,
            'current_music_walk_streak' => 0,
            'longest_music_walk_streak' => 0,
            'date_of_birth' => '2000-01-01',
        ]);
    }
}
