<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\CoinTransaction;
use App\Models\Equipment;
use App\Models\PointTransaction;
use App\Models\User;
use App\Models\UserActivityLog;
use App\Models\UserEquipment;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TestUsersSeeder extends Seeder
{
    /**
     * Створює двох тестових користувачів:
     * - Гном (Dwarf) з D-grade екіпіровкою
     * - Ельф (Elf) з топовим no-grade екіпіровкою
     */
    public function run(): void
    {
        DB::transaction(function () {
            $this->createDwarfUser();
            $this->createElfUser();
        });

        $this->command->info('✅ Test users created successfully!');
        $this->command->info('');
        $this->command->info('🧔 Гном Thorin:');
        $this->command->info('   Email: thorin@test.ninja');
        $this->command->info('   Password: test123');
        $this->command->info('   Level: 25, D-grade equipment');
        $this->command->info('');
        $this->command->info('🧝 Ельф Legolas:');
        $this->command->info('   Email: legolas@test.ninja');
        $this->command->info('   Password: test123');
        $this->command->info('   Level: 15, Top no-grade equipment');
    }

    private function createDwarfUser(): void
    {
        // Видаляємо попереднього користувача, якщо існує
        User::where('email', 'thorin@test.ninja')->delete();

        // Створюємо гнома Торіна - рівень 25, D-grade
        $dwarf = User::create([
            'nickname' => 'Thorin',
            'email' => 'thorin@test.ninja',
            'password' => Hash::make('test123'),
            'role' => 'user',
            'race' => 'dwarf',
            'avatar_level' => 1,
            'level' => 25,
            'total_points' => 8500,
            'coins' => 450,
            'birth_date' => '1990-03-15',
            'height' => 165,
            'weight' => 85.5,
            'weight_updated_at' => now()->subDays(3),
            'daily_calorie_limit' => 2200,
            'onboarding_completed' => true,
            'current_music_walk_streak' => 5,
            'longest_music_walk_streak' => 12,
            'last_music_walk_date' => now()->subDay(),
        ]);

        // D-grade екіпіровка для гнома
        $brigandine = Equipment::where('name', 'Brigandine')->where('type', 'armor')->first();
        $swordOfRevolution = Equipment::where('name', 'Sword of Revolution')->where('type', 'weapon')->first();
        $scaleArmor = Equipment::where('name', 'Scale')->where('type', 'armor')->first();
        $crimsonSword = Equipment::where('name', 'Crimson Sword')->where('type', 'weapon')->first();

        // Також no-grade екіпіровка яку він мав раніше
        $boneArmor = Equipment::where('name', 'Bone')->where('type', 'armor')->first();
        $gladius = Equipment::where('name', 'Gladius')->where('type', 'weapon')->first();

        // Додаємо придбане екіпіровку (включаючи стару)
        $purchasedEquipment = [
            ['equipment' => $boneArmor, 'price' => 100],
            ['equipment' => $gladius, 'price' => 100],
            ['equipment' => $scaleArmor, 'price' => 400],
            ['equipment' => $crimsonSword, 'price' => 350],
            ['equipment' => $brigandine, 'price' => 800],
            ['equipment' => $swordOfRevolution, 'price' => 700],
        ];

        foreach ($purchasedEquipment as $item) {
            if ($item['equipment']) {
                UserEquipment::create([
                    'user_id' => $dwarf->id,
                    'equipment_id' => $item['equipment']->id,
                    'purchased_price' => $item['price'],
                ]);
            }
        }

        // Одягаємо найкраще D-grade
        if ($brigandine) {
            $dwarf->equipped_armor_id = $brigandine->id;
        }
        if ($swordOfRevolution) {
            $dwarf->equipped_weapon_id = $swordOfRevolution->id;
        }
        $dwarf->save();

        // Створюємо історію активностей за останні 14 днів
        $this->createActivityHistory($dwarf, 14);

        // Транзакції монет
        $this->createCoinTransactions($dwarf, [
            ['amount' => 100, 'reason' => 'activity', 'days_ago' => 14],
            ['amount' => 80, 'reason' => 'activity', 'days_ago' => 13],
            ['amount' => -100, 'reason' => 'purchase', 'days_ago' => 12], // Bone armor
            ['amount' => -100, 'reason' => 'purchase', 'days_ago' => 12], // Gladius
            ['amount' => 150, 'reason' => 'activity', 'days_ago' => 11],
            ['amount' => 120, 'reason' => 'activity', 'days_ago' => 10],
            ['amount' => 90, 'reason' => 'activity', 'days_ago' => 9],
            ['amount' => 50, 'reason' => 'streak_bonus', 'days_ago' => 9],
            ['amount' => -400, 'reason' => 'purchase', 'days_ago' => 8], // Scale armor
            ['amount' => -350, 'reason' => 'purchase', 'days_ago' => 8], // Crimson Sword
            ['amount' => 130, 'reason' => 'activity', 'days_ago' => 7],
            ['amount' => 100, 'reason' => 'activity', 'days_ago' => 6],
            ['amount' => 85, 'reason' => 'activity', 'days_ago' => 5],
            ['amount' => 150, 'reason' => 'activity', 'days_ago' => 4],
            ['amount' => -800, 'reason' => 'purchase', 'days_ago' => 3], // Brigandine
            ['amount' => -700, 'reason' => 'purchase', 'days_ago' => 3], // Sword of Revolution
            ['amount' => 200, 'reason' => 'activity', 'days_ago' => 2],
            ['amount' => 100, 'reason' => 'streak_bonus', 'days_ago' => 2],
            ['amount' => 145, 'reason' => 'activity', 'days_ago' => 1],
        ]);

        // Транзакції досвіду
        $this->createPointTransactions($dwarf);
    }

    private function createElfUser(): void
    {
        // Видаляємо попереднього користувача, якщо існує
        User::where('email', 'legolas@test.ninja')->delete();

        // Створюємо ельфа Леголаса - рівень 15, топовий no-grade
        $elf = User::create([
            'nickname' => 'Legolas',
            'email' => 'legolas@test.ninja',
            'password' => Hash::make('test123'),
            'role' => 'user',
            'race' => 'elf',
            'avatar_level' => 1,
            'level' => 15,
            'total_points' => 4200,
            'coins' => 320,
            'birth_date' => '1995-06-21',
            'height' => 185,
            'weight' => 72.0,
            'weight_updated_at' => now()->subDays(5),
            'daily_calorie_limit' => 2000,
            'onboarding_completed' => true,
            'current_music_walk_streak' => 3,
            'longest_music_walk_streak' => 7,
            'last_music_walk_date' => now()->subDay(),
        ]);

        // Топове no-grade екіпіровка для ельфа
        $bronzeArmor = Equipment::where('name', 'Bronze')->where('type', 'armor')->first();
        $falchion = Equipment::where('name', 'Falchion')->where('type', 'weapon')->first();
        
        // Також базове стартове екіпіровка
        $apprentice = Equipment::where('name', 'Apprentice')->where('type', 'armor')->first();
        $club = Equipment::where('name', 'Club')->where('type', 'weapon')->first();
        $boneArmor = Equipment::where('name', 'Bone')->where('type', 'armor')->first();
        $shortSword = Equipment::where('name', 'Short Sword')->where('type', 'weapon')->first();

        // Додаємо придбане екіпіровку
        $purchasedEquipment = [
            ['equipment' => $apprentice, 'price' => 0],
            ['equipment' => $club, 'price' => 0],
            ['equipment' => $boneArmor, 'price' => 100],
            ['equipment' => $shortSword, 'price' => 50],
            ['equipment' => $bronzeArmor, 'price' => 200],
            ['equipment' => $falchion, 'price' => 200],
        ];

        foreach ($purchasedEquipment as $item) {
            if ($item['equipment']) {
                UserEquipment::create([
                    'user_id' => $elf->id,
                    'equipment_id' => $item['equipment']->id,
                    'purchased_price' => $item['price'],
                ]);
            }
        }

        // Одягаємо найкраще no-grade
        if ($bronzeArmor) {
            $elf->equipped_armor_id = $bronzeArmor->id;
        }
        if ($falchion) {
            $elf->equipped_weapon_id = $falchion->id;
        }
        $elf->save();

        // Створюємо історію активностей за останні 10 днів
        $this->createActivityHistory($elf, 10);

        // Транзакції монет
        $this->createCoinTransactions($elf, [
            ['amount' => 80, 'reason' => 'activity', 'days_ago' => 10],
            ['amount' => 65, 'reason' => 'activity', 'days_ago' => 9],
            ['amount' => 90, 'reason' => 'activity', 'days_ago' => 8],
            ['amount' => -100, 'reason' => 'purchase', 'days_ago' => 7], // Bone armor
            ['amount' => -50, 'reason' => 'purchase', 'days_ago' => 7], // Short Sword
            ['amount' => 75, 'reason' => 'activity', 'days_ago' => 6],
            ['amount' => 100, 'reason' => 'activity', 'days_ago' => 5],
            ['amount' => 50, 'reason' => 'streak_bonus', 'days_ago' => 5],
            ['amount' => -200, 'reason' => 'purchase', 'days_ago' => 4], // Bronze armor
            ['amount' => -200, 'reason' => 'purchase', 'days_ago' => 4], // Falchion
            ['amount' => 85, 'reason' => 'activity', 'days_ago' => 3],
            ['amount' => 110, 'reason' => 'activity', 'days_ago' => 2],
            ['amount' => 95, 'reason' => 'activity', 'days_ago' => 1],
            ['amount' => 120, 'reason' => 'activity', 'days_ago' => 0],
        ]);

        // Транзакції досвіду
        $this->createPointTransactions($elf);
    }

    private function createActivityHistory(User $user, int $days): void
    {
        $activities = Activity::active()->get();
        
        if ($activities->isEmpty()) {
            $this->command->warn('   ⚠️ No activities found. Run ActivitySeeder first.');
            return;
        }

        $ongoingRules = $activities->where('type', 'ongoing_rule');
        $dailyTasks = $activities->where('type', 'daily_task');
        $trainings = $activities->where('type', 'training');

        for ($i = $days; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->startOfDay();
            $completedAt = $date->copy()->setHour(rand(8, 22))->setMinute(rand(0, 59));

            // Випадково виконуємо 2-4 правила
            $rulesToComplete = $ongoingRules->random(min(rand(2, 4), $ongoingRules->count()));
            foreach ($rulesToComplete as $activity) {
                UserActivityLog::create([
                    'user_id' => $user->id,
                    'activity_id' => $activity->id,
                    'date' => $date,
                    'completed_at' => $completedAt->copy()->addMinutes(rand(0, 60)),
                ]);
            }

            // Випадково виконуємо 1-3 завдання
            if ($dailyTasks->isNotEmpty()) {
                $tasksToComplete = $dailyTasks->random(min(rand(1, 3), $dailyTasks->count()));
                foreach ($tasksToComplete as $activity) {
                    UserActivityLog::create([
                        'user_id' => $user->id,
                        'activity_id' => $activity->id,
                        'date' => $date,
                        'completed_at' => $completedAt->copy()->addMinutes(rand(60, 180)),
                    ]);
                }
            }

            // 70% шанс на тренування
            if ($trainings->isNotEmpty() && rand(1, 10) <= 7) {
                $training = $trainings->random();
                UserActivityLog::create([
                    'user_id' => $user->id,
                    'activity_id' => $training->id,
                    'date' => $date,
                    'completed_at' => $completedAt->copy()->addMinutes(rand(180, 360)),
                    'metadata' => [
                        'duration_minutes' => rand(30, 90),
                    ],
                ]);
            }
        }
    }

    private function createCoinTransactions(User $user, array $transactions): void
    {
        foreach ($transactions as $tx) {
            CoinTransaction::create([
                'user_id' => $user->id,
                'amount' => $tx['amount'],
                'reason' => $tx['reason'],
                'created_at' => Carbon::now()->subDays($tx['days_ago']),
                'updated_at' => Carbon::now()->subDays($tx['days_ago']),
            ]);
        }
    }

    private function createPointTransactions(User $user): void
    {
        // Розподіляємо total_points по дням
        $totalPoints = $user->total_points;
        $daysActive = $user->race === 'dwarf' ? 14 : 10;
        $pointsPerDay = intval($totalPoints / $daysActive);

        for ($i = $daysActive; $i >= 0; $i--) {
            $variation = rand(-50, 100);
            $points = max(100, $pointsPerDay + $variation);
            
            PointTransaction::create([
                'user_id' => $user->id,
                'amount' => $points,
                'reason' => 'activity',
                'created_at' => Carbon::now()->subDays($i),
                'updated_at' => Carbon::now()->subDays($i),
            ]);
        }
    }
}

