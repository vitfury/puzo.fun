<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\LevelService;

$levelService = new LevelService();
$basePoints = $levelService->getBasePointsPerLevel();
$xpRate = $levelService->getBaseXpRate();

echo "=== РОЗРАХУНОК ДОСВІДУ ДЛЯ КОЖНОГО РІВНЯ ===\n";
echo "Базові очки: {$basePoints}\n";
echo "XP Rate: {$xpRate}\n";
echo "Формула: XP = base_points × level × multiplier / xp_rate\n\n";

echo str_pad('Рівень', 10) . str_pad('XP до рівня', 15) . str_pad('XP для рівня', 15) . str_pad('Множник', 12) . str_pad('Грейд', 10) . "\n";
echo str_repeat('=', 70) . "\n";

$totalXP = 0;
for ($level = 1; $level <= 80; $level++) {
    $xpForLevel = $levelService->getPointsToNextLevel($level, $xpRate);
    $totalXP += $xpForLevel;
    $multiplier = $levelService->getDifficultyMultiplier($level);
    $grade = $levelService->getGradeForLevel($level);
    
    echo str_pad($level, 10) . 
         str_pad(number_format($totalXP), 15) . 
         str_pad(number_format($xpForLevel), 15) . 
         str_pad($multiplier . 'x', 12) . 
         str_pad($grade, 10) . "\n";
    
    // Показуємо ключові рівні
    if (in_array($level, [1, 20, 40, 52, 61, 76, 80])) {
        echo str_repeat('-', 70) . "\n";
    }
}

echo "\n=== ПІДСУМОК ПО ДІАПАЗОНАХ ===\n";
$ranges = [
    [1, 19, 'No-Grade'],
    [20, 39, 'D-Grade'],
    [40, 51, 'C-Grade'],
    [52, 60, 'B-Grade'],
    [61, 75, 'A-Grade'],
    [76, 80, 'S-Grade'],
];

foreach ($ranges as [$min, $max, $gradeName]) {
    $startXP = $levelService->getPointsForLevel($min, $xpRate);
    $endXP = $levelService->getPointsForLevel($max + 1, $xpRate);
    $rangeXP = $endXP - $startXP;
    echo "{$gradeName} ({$min}-{$max}): " . number_format($rangeXP) . " XP\n";
}

