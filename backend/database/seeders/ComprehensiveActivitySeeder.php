<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\ActivityTranslation;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ComprehensiveActivitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Баланс: Рівень 20 за 7 днів, Рівень 80 за 6 місяців
     * Середній XP на день: 500-800 (залежить від виконання)
     * 
     * PRODUCTION DATA - synced from local DB on 2025-12-02
     */
    public function run(): void
    {
        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Clear existing data
        ActivityTranslation::truncate();
        Activity::truncate();

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Дати для відкладеного запуску активностей
        // Використовуємо конкретні дати з production БД
        $in2Weeks = Carbon::parse('2025-12-16');
        $in1Month = Carbon::parse('2026-01-02');
        $fruitDate = Carbon::parse('2026-02-04');

        DB::transaction(function () use ($in2Weeks, $in1Month, $fruitDate) {

            // ============================================
            // ПРАВИЛА (ongoing_rule) - Award EXPERIENCE
            // Виконуються щодня, формують корисні звички
            // ============================================
            $ongoingRules = [
                // === Доступні одразу ===
                [
                    'name' => 'Sugar-free drinks',
                    'name_uk' => 'Пити напої без цукру',
                    'description' => 'Drink only sugar-free beverages today',
                    'description_uk' => 'Пий сьогодні тільки напої без цукру',
                    'experience' => 40,
                    'coins' => 0,
                    'order_index' => 101,
                    'active_from' => null,
                ],
                [
                    'name' => 'Sleep 8+ hours',
                    'name_uk' => 'Поспати мінімум 8 годин',
                    'description' => 'Get at least 8 hours of sleep',
                    'description_uk' => 'Поспи мінімум 8 годин цієї ночі',
                    'experience' => 50,
                    'coins' => 0,
                    'order_index' => 102,
                    'active_from' => null,
                ],
                [
                    'name' => 'Don\'t skip breakfast',
                    'name_uk' => 'Не пропускати сніданок',
                    'description' => 'Have a proper breakfast in the morning',
                    'description_uk' => 'З\'їж повноцінний сніданок вранці',
                    'experience' => 45,
                    'coins' => 0,
                    'order_index' => 103,
                    'active_from' => null,
                ],

                // === Доступні через 2 тижні (2025-12-16) ===
                [
                    'name' => 'Single portion only',
                    'name_uk' => 'Їсти по одній порції',
                    'description' => 'Eat only one portion per meal, no seconds',
                    'description_uk' => 'Їж тільки одну порцію, без добавок',
                    'experience' => 55,
                    'coins' => 0,
                    'order_index' => 104,
                    'active_from' => $in2Weeks,
                ],
                [
                    'name' => 'No sweets day',
                    'name_uk' => 'День без солодощів',
                    'description' => 'Go the entire day without any sweets',
                    'description_uk' => 'Проведи весь день без солодощів',
                    'experience' => 60,
                    'coins' => 0,
                    'order_index' => 105,
                    'active_from' => $in2Weeks,
                ],
                [
                    'name' => 'Sweets only once',
                    'name_uk' => 'Солодке максимум раз на день',
                    'description' => 'Have sweets no more than once today',
                    'description_uk' => 'Їж солодке не більше 1 разу на день',
                    'experience' => 50,
                    'coins' => 0,
                    'order_index' => 106,
                    'active_from' => $in2Weeks,
                ],

                // === Доступні через місяць (2026-01-02) ===
                [
                    'name' => 'Eat at the table only',
                    'name_uk' => 'Їсти тільки за столом',
                    'description' => 'Have all three meals at a proper table',
                    'description_uk' => 'Їж всі три прийоми їжі тільки за столом',
                    'experience' => 60,
                    'coins' => 0,
                    'order_index' => 107,
                    'active_from' => $in1Month,
                ],
                [
                    'name' => 'No gadgets while eating',
                    'name_uk' => 'Їсти без гаджетів',
                    'description' => 'No phones or screens during meals',
                    'description_uk' => 'Їж без телефона та інших екранів',
                    'experience' => 55,
                    'coins' => 0,
                    'order_index' => 108,
                    'active_from' => $in1Month,
                ],
                [
                    'name' => 'Water before meals',
                    'name_uk' => 'Стакан води перед їжею',
                    'description' => 'Drink a glass of water before each meal',
                    'description_uk' => 'Випий склянку води перед кожним прийомом їжі',
                    'experience' => 45,
                    'coins' => 0,
                    'order_index' => 109,
                    'active_from' => $in1Month,
                ],
                [
                    'name' => 'Walk for treats',
                    'name_uk' => 'Хочеш вкусняху - сходи за нею',
                    'description' => 'If you want a treat, walk to get it',
                    'description_uk' => 'Якщо хочеш смаколик - сходи за ним пішки',
                    'experience' => 65,
                    'coins' => 0,
                    'order_index' => 110,
                    'active_from' => $in1Month,
                ],
            ];

            foreach ($ongoingRules as $ruleData) {
                $activity = Activity::create([
                    'name' => $ruleData['name'],
                    'type' => 'ongoing_rule',
                    'description' => $ruleData['description'],
                    'points' => 0,
                    'coins' => $ruleData['coins'],
                    'experience' => $ruleData['experience'],
                    'is_active' => true,
                    'order_index' => $ruleData['order_index'],
                    'active_from' => $ruleData['active_from'],
                ]);

                ActivityTranslation::create([
                    'activity_id' => $activity->id,
                    'locale' => 'en',
                    'name' => $ruleData['name'],
                    'description' => $ruleData['description'],
                ]);

                ActivityTranslation::create([
                    'activity_id' => $activity->id,
                    'locale' => 'uk',
                    'name' => $ruleData['name_uk'],
                    'description' => $ruleData['description_uk'],
                ]);
            }

            // ============================================
            // ЗАВДАННЯ (daily_task) - Award EXPERIENCE
            // Конкретні досягнення на день
            // ============================================
            $dailyTasks = [
                [
                    'name' => 'Денний ліміт калорій',
                    'name_uk' => 'Денний ліміт калорій',
                    'description' => 'Не перевищуй свій денний ліміт калорій',
                    'description_uk' => 'Не перевищуй свій денний ліміт калорій',
                    'experience' => 90,
                    'coins' => 0,
                    'order_index' => 201,
                    'active_from' => null,
                ],
                [
                    'name' => 'Walk 5,000 steps',
                    'name_uk' => 'Пройти 5 тис. кроків',
                    'description' => 'Reach 5,000 steps today',
                    'description_uk' => 'Досягни 5000 кроків за день',
                    'experience' => 60,
                    'coins' => 0,
                    'order_index' => 202,
                    'active_from' => null,
                ],
                [
                    'name' => 'Сходити за фруктом',
                    'name_uk' => 'Сходити за фруктом',
                    'description' => 'Сходи пішки та принеси собі свіжий фрукт',
                    'description_uk' => 'Сходи пішки та принеси собі свіжий фрукт',
                    'experience' => 40,
                    'coins' => 5,
                    'order_index' => 204,
                    'active_from' => $fruitDate,
                ],
            ];

            foreach ($dailyTasks as $taskData) {
                $activity = Activity::create([
                    'name' => $taskData['name'],
                    'type' => 'daily_task',
                    'description' => $taskData['description'],
                    'points' => 0,
                    'coins' => $taskData['coins'],
                    'experience' => $taskData['experience'],
                    'is_active' => true,
                    'order_index' => $taskData['order_index'],
                    'active_from' => $taskData['active_from'] ?? null,
                ]);

                ActivityTranslation::create([
                    'activity_id' => $activity->id,
                    'locale' => 'en',
                    'name' => $taskData['name'],
                    'description' => $taskData['description'],
                ]);

                ActivityTranslation::create([
                    'activity_id' => $activity->id,
                    'locale' => 'uk',
                    'name' => $taskData['name_uk'],
                    'description' => $taskData['description_uk'],
                ]);
            }

            // ============================================
            // ТРЕНУВАННЯ (training) - Award EXPERIENCE + COINS
            // Фізична активність, основне джерело монет
            // ============================================
            $trainings = [
                [
                    'name' => 'Ранкова зарядка',
                    'name_uk' => 'Ранкова зарядка',
                    'description' => 'Виконай ранкову зарядку',
                    'description_uk' => 'Виконай ранкову зарядку',
                    'experience' => 50,
                    'coins' => 30,
                    'order_index' => 0,
                    'active_from' => Carbon::parse('2025-12-02'),
                ],
                [
                    'name' => 'Gym workout',
                    'name_uk' => 'Тренажерний зал',
                    'description' => 'Complete a gym session',
                    'description_uk' => 'Потренуйся в тренажерному залі',
                    'experience' => 150,
                    'coins' => 80,
                    'order_index' => 302,
                    'active_from' => null,
                ],
                [
                    'name' => 'Functional training',
                    'name_uk' => 'Функціональне тренування',
                    'description' => 'Complete a functional/HIIT workout',
                    'description_uk' => 'Виконай функціональне або HIIT тренування',
                    'experience' => 150,
                    'coins' => 80,
                    'order_index' => 303,
                    'active_from' => null,
                ],
            ];

            foreach ($trainings as $trainingData) {
                $activity = Activity::create([
                    'name' => $trainingData['name'],
                    'type' => 'training',
                    'description' => $trainingData['description'],
                    'points' => 0,
                    'coins' => $trainingData['coins'],
                    'experience' => $trainingData['experience'],
                    'is_active' => true,
                    'order_index' => $trainingData['order_index'],
                    'active_from' => $trainingData['active_from'] ?? null,
                ]);

                ActivityTranslation::create([
                    'activity_id' => $activity->id,
                    'locale' => 'en',
                    'name' => $trainingData['name'],
                    'description' => $trainingData['description'],
                ]);

                ActivityTranslation::create([
                    'activity_id' => $activity->id,
                    'locale' => 'uk',
                    'name' => $trainingData['name_uk'],
                    'description' => $trainingData['description_uk'],
                ]);
            }

            $this->command->info('✅ Activities seeded successfully!');
            $this->command->info('');
            $this->command->info('📋 ПРАВИЛА (ongoing_rule): ' . count($ongoingRules));
            $this->command->info('   - Одразу доступні: 3');
            $this->command->info('   - Через 2 тижні (2025-12-16): 3');
            $this->command->info('   - Через 1 місяць (2026-01-02): 4');
            $this->command->info('');
            $this->command->info('✅ ЗАВДАННЯ (daily_task): ' . count($dailyTasks));
            $this->command->info('💪 ТРЕНУВАННЯ (training): ' . count($trainings));
        });
    }
}
