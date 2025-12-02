<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AxeWeaponSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $axes = [
            // No-Grade
            ['name' => 'Club', 'grade' => 'no-grade', 'required_level' => 1, 'price' => 50, 'sort_order' => 50],

            // D Grade
            ['name' => 'Work Hammer', 'grade' => 'D', 'required_level' => 20, 'price' => 2000, 'sort_order' => 51],
            ['name' => 'Tarbar', 'grade' => 'D', 'required_level' => 20, 'price' => 2500, 'sort_order' => 52],

            // C Grade
            ['name' => 'War Axe', 'grade' => 'C', 'required_level' => 40, 'price' => 8000, 'sort_order' => 53],
            ['name' => 'Ecliptic Axe', 'grade' => 'C', 'required_level' => 40, 'price' => 9000, 'sort_order' => 54],

            // B Grade
            ['name' => 'Heavy War Axe', 'grade' => 'B', 'required_level' => 52, 'price' => 20000, 'sort_order' => 55],
            ['name' => 'Deadmans Glory', 'grade' => 'B', 'required_level' => 52, 'price' => 22000, 'sort_order' => 56],

            // A Grade
            ['name' => 'Meteor Shower', 'grade' => 'A', 'required_level' => 61, 'price' => 50000, 'sort_order' => 57],
            ['name' => 'Barakiel Axe', 'grade' => 'A', 'required_level' => 61, 'price' => 55000, 'sort_order' => 58],

            // S Grade
            ['name' => 'Basalt Battlehammer', 'grade' => 'S', 'required_level' => 76, 'price' => 150000, 'sort_order' => 59],
            ['name' => 'Dynasty Cudgel', 'grade' => 'S', 'required_level' => 76, 'price' => 160000, 'sort_order' => 60],
            ['name' => 'Vesper Avenger', 'grade' => 'S', 'required_level' => 80, 'price' => 200000, 'sort_order' => 61],
        ];

        foreach ($axes as $axe) {
            DB::table('equipment')->insert([
                'name' => $axe['name'],
                'type' => 'weapon',
                'grade' => $axe['grade'],
                'required_level' => $axe['required_level'],
                'price' => $axe['price'],
                'sort_order' => $axe['sort_order'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
