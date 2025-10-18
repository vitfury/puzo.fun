<?php

namespace App\Console\Commands;

use App\Models\ActivityTranslation;
use Illuminate\Console\Command;

class ViewTranslations extends Command
{
    protected $signature = 'translations:view {--locale= : Filter by locale (en, uk)}';
    protected $description = 'View all activity translations in a formatted table';

    public function handle()
    {
        $locale = $this->option('locale');

        $translations = ActivityTranslation::with('activity')
            ->when($locale, fn($q) => $q->where('locale', $locale))
            ->orderBy('activity_id')
            ->orderBy('locale')
            ->get();

        if ($translations->isEmpty()) {
            $this->error('No translations found!');
            return 1;
        }

        $this->info("\n╔════════════════════════════════════════════════════════════════╗");
        $this->info("║              ACTIVITY TRANSLATIONS                             ║");
        $this->info("╚════════════════════════════════════════════════════════════════╝\n");

        $currentActivityId = null;

        foreach ($translations as $t) {
            if ($currentActivityId !== $t->activity_id) {
                if ($currentActivityId !== null) {
                    $this->line(str_repeat('─', 70));
                }
                $currentActivityId = $t->activity_id;
                $this->warn("\n📌 Original: {$t->activity->name} ({$t->activity->type})");
            }

            $flag = $t->locale === 'en' ? '🇬🇧' : '🇺🇦';
            $this->line("   {$flag} [{$t->locale}] <fg=green>{$t->name}</>");
            $this->line("      ➜ <fg=gray>{$t->description}</>");
        }

        $this->info("\n" . str_repeat('═', 70));
        $this->info("Total: {$translations->count()} translations");

        return 0;
    }
}
