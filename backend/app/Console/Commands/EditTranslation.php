<?php

namespace App\Console\Commands;

use App\Models\Activity;
use App\Models\ActivityTranslation;
use Illuminate\Console\Command;

class EditTranslation extends Command
{
    protected $signature = 'translations:edit';
    protected $description = 'Interactive tool to edit activity translations';

    public function handle()
    {
        // Get all activities
        $activities = Activity::orderBy('order_index')->get();

        $activityChoices = $activities->mapWithKeys(function ($activity) {
            return [$activity->id => "{$activity->name} ({$activity->type})"];
        })->toArray();

        // Select activity
        $activityId = $this->choice(
            'Which activity do you want to edit?',
            $activityChoices,
            0
        );

        $activity = $activities->firstWhere('id', array_search($activityId, $activityChoices));

        // Select locale
        $locale = $this->choice(
            'Which language?',
            ['en' => '🇬🇧 English', 'uk' => '🇺🇦 Ukrainian'],
            0
        );
        $locale = array_search($locale, ['en' => '🇬🇧 English', 'uk' => '🇺🇦 Ukrainian']);

        // Get current translation
        $translation = ActivityTranslation::where('activity_id', $activity->id)
            ->where('locale', $locale)
            ->first();

        if (!$translation) {
            $this->error("Translation not found!");
            return 1;
        }

        $this->info("\n" . str_repeat('═', 70));
        $this->line("Editing: <fg=yellow>{$activity->name}</> ({$locale})");
        $this->info(str_repeat('═', 70) . "\n");

        // Show current values
        $this->line("Current name: <fg=green>{$translation->name}</>");
        $this->line("Current description: <fg=gray>{$translation->description}</>\n");

        // Ask for new values
        $newName = $this->ask('New name (press Enter to keep current)', $translation->name);
        $newDescription = $this->ask('New description (press Enter to keep current)', $translation->description);

        // Confirm changes
        if ($newName !== $translation->name || $newDescription !== $translation->description) {
            $this->info("\n" . str_repeat('─', 70));
            $this->line("New name: <fg=green>{$newName}</>");
            $this->line("New description: <fg=gray>{$newDescription}</>");
            $this->info(str_repeat('─', 70) . "\n");

            if ($this->confirm('Save changes?', true)) {
                $translation->update([
                    'name' => $newName,
                    'description' => $newDescription,
                ]);

                $this->info('✅ Translation updated successfully!');
                return 0;
            } else {
                $this->warn('❌ Changes discarded.');
                return 1;
            }
        } else {
            $this->info('No changes made.');
            return 0;
        }
    }
}
