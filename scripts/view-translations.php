#!/usr/bin/env php
<?php

// Simple script to view all activity translations
// Run: docker-compose exec php php scripts/view-translations.php

require __DIR__ . '/../backend/vendor/autoload.php';

$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\ActivityTranslation;

$translations = ActivityTranslation::with('activity')
    ->orderBy('activity_id')
    ->orderBy('locale')
    ->get();

echo "\n╔════════════════════════════════════════════════════════════════════════════════╗\n";
echo "║                         ACTIVITY TRANSLATIONS                                  ║\n";
echo "╚════════════════════════════════════════════════════════════════════════════════╝\n\n";

$currentActivityId = null;

foreach ($translations as $t) {
    if ($currentActivityId !== $t->activity_id) {
        if ($currentActivityId !== null) {
            echo str_repeat('─', 80) . "\n\n";
        }
        $currentActivityId = $t->activity_id;
        echo "📌 Original: {$t->activity->name} ({$t->activity->type})\n";
    }

    $flag = $t->locale === 'en' ? '🇬🇧' : '🇺🇦';
    echo "   {$flag} [{$t->locale}] {$t->name}\n";
    echo "      ➜ {$t->description}\n";
}

echo "\n" . str_repeat('═', 80) . "\n";
echo "Total: " . $translations->count() . " translations\n\n";
