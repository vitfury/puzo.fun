<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\ActivityTranslation;
use Illuminate\Database\Seeder;

class ActivitySeeder extends Seeder
{
    public function run(): void
    {
        $activities = [
            // Daily Tasks
            [
                'name' => 'Morning Stretch',
                'type' => 'daily_task',
                'description' => 'Start your day with a 5-minute stretch routine',
                'points' => 10,
                'order_index' => 1,
                'translations' => [
                    'en' => [
                        'name' => 'Morning Stretch',
                        'description' => 'Start your day with a 5-minute stretch routine',
                    ],
                    'uk' => [
                        'name' => 'Ранкова розминка',
                        'description' => 'Почніть свій день з 5-хвилинної розминки',
                    ],
                ],
            ],
            [
                'name' => 'Log Breakfast',
                'type' => 'daily_task',
                'description' => 'Record what you ate for breakfast',
                'points' => 5,
                'order_index' => 2,
                'translations' => [
                    'en' => [
                        'name' => 'Log Breakfast',
                        'description' => 'Record what you ate for breakfast',
                    ],
                    'uk' => [
                        'name' => 'Запис сніданку',
                        'description' => 'Запишіть, що ви з\'їли на сніданок',
                    ],
                ],
            ],
            [
                'name' => 'Log Lunch',
                'type' => 'daily_task',
                'description' => 'Record what you ate for lunch',
                'points' => 5,
                'order_index' => 3,
                'translations' => [
                    'en' => [
                        'name' => 'Log Lunch',
                        'description' => 'Record what you ate for lunch',
                    ],
                    'uk' => [
                        'name' => 'Запис обіду',
                        'description' => 'Запишіть, що ви з\'їли на обід',
                    ],
                ],
            ],
            [
                'name' => 'Log Dinner',
                'type' => 'daily_task',
                'description' => 'Record what you ate for dinner',
                'points' => 5,
                'order_index' => 4,
                'translations' => [
                    'en' => [
                        'name' => 'Log Dinner',
                        'description' => 'Record what you ate for dinner',
                    ],
                    'uk' => [
                        'name' => 'Запис вечері',
                        'description' => 'Запишіть, що ви з\'їли на вечерю',
                    ],
                ],
            ],
            [
                'name' => 'Evening Reflection',
                'type' => 'daily_task',
                'description' => 'Review your day and plan for tomorrow',
                'points' => 10,
                'order_index' => 5,
                'translations' => [
                    'en' => [
                        'name' => 'Evening Reflection',
                        'description' => 'Review your day and plan for tomorrow',
                    ],
                    'uk' => [
                        'name' => 'Вечірня рефлексія',
                        'description' => 'Підведіть підсумки дня та сплануйте завтрашній день',
                    ],
                ],
            ],

            // Ongoing Rules
            [
                'name' => 'Stay Under Calorie Limit',
                'type' => 'ongoing_rule',
                'description' => 'Keep your daily calories within your target',
                'points' => 20,
                'order_index' => 10,
                'translations' => [
                    'en' => [
                        'name' => 'Stay Under Calorie Limit',
                        'description' => 'Keep your daily calories within your target',
                    ],
                    'uk' => [
                        'name' => 'Дотримуйтесь ліміту калорій',
                        'description' => 'Тримайте денну кількість калорій в межах вашої норми',
                    ],
                ],
            ],
            [
                'name' => 'Hit 10,000 Steps',
                'type' => 'ongoing_rule',
                'description' => 'Reach your daily step goal',
                'points' => 25,
                'order_index' => 11,
                'translations' => [
                    'en' => [
                        'name' => 'Hit 10,000 Steps',
                        'description' => 'Reach your daily step goal',
                    ],
                    'uk' => [
                        'name' => 'Пройдіть 10,000 кроків',
                        'description' => 'Досягніть щоденної мети кроків',
                    ],
                ],
            ],

            // Music Walk
            [
                'name' => 'Music Walk',
                'type' => 'music_walk',
                'description' => 'Go for a walk while listening to your current genre playlist',
                'points' => 30,
                'order_index' => 20,
                'translations' => [
                    'en' => [
                        'name' => 'Music Walk',
                        'description' => 'Go for a walk while listening to your current genre playlist',
                    ],
                    'uk' => [
                        'name' => 'Музична прогулянка',
                        'description' => 'Прогуляйтеся, слухаючи свій поточний плейлист жанру',
                    ],
                ],
            ],
        ];

        foreach ($activities as $activityData) {
            // Extract translations before creating activity
            $translations = $activityData['translations'] ?? [];
            unset($activityData['translations']);

            // Create activity
            $activity = Activity::create($activityData);

            // Create translations
            foreach ($translations as $locale => $translationData) {
                ActivityTranslation::create([
                    'activity_id' => $activity->id,
                    'locale' => $locale,
                    'name' => $translationData['name'],
                    'description' => $translationData['description'] ?? null,
                ]);
            }
        }
    }
}
