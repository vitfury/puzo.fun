<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * 
     * Production seeding order:
     * 1. AdminUserSeeder - creates admin user
     * 2. ComprehensiveActivitySeeder - activities with XP, coins, translations
     * 3. GenreSeeder - music genres hierarchy
     * 4. EquipmentSeeder - armor and weapons with prices
     * 5. GameSettingsSeeder - game balance settings
     */
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            ComprehensiveActivitySeeder::class,
            GenreSeeder::class,
            EquipmentSeeder::class,
            GameSettingsSeeder::class,
        ]);
    }
}
