<?php

namespace App\Services;

use App\Models\PointTransaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class PointService
{
    public function __construct(
        private ?LevelService $levelService = null
    ) {
        $this->levelService = $levelService ?? new LevelService();
    }

    public function awardPoints(
        User $user,
        int $amount,
        string $reason,
        ?Model $source = null,
        ?array $metadata = null
    ): PointTransaction {
        return DB::transaction(function () use ($user, $amount, $reason, $source, $metadata) {
            $user->increment('total_points', $amount);

            $transaction = PointTransaction::create([
                'user_id' => $user->id,
                'amount' => $amount,
                'reason' => $reason,
                'source_type' => $source ? get_class($source) : null,
                'source_id' => $source?->id,
                'metadata' => $metadata,
            ]);

            // Update user level after awarding points
            $user->refresh();
            $this->levelService->updateUserLevel($user);

            return $transaction;
        });
    }

    public function deductPoints(
        User $user,
        int $amount,
        string $reason,
        ?Model $source = null,
        ?array $metadata = null
    ): PointTransaction {
        return DB::transaction(function () use ($user, $amount, $reason, $source, $metadata) {
            $user->decrement('total_points', $amount);

            return PointTransaction::create([
                'user_id' => $user->id,
                'amount' => -$amount,
                'reason' => $reason,
                'source_type' => $source ? get_class($source) : null,
                'source_id' => $source?->id,
                'metadata' => $metadata,
            ]);
        });
    }

    public function awardActivityPoints(User $user, Model $activity): PointTransaction
    {
        return $this->awardPoints(
            user: $user,
            amount: $activity->points,
            reason: "Completed activity: {$activity->name}",
            source: $activity
        );
    }

    public function awardStepBonus(User $user, int $steps): ?PointTransaction
    {
        if ($steps < 1000) {
            return null;
        }

        $bonusPoints = floor($steps / 1000) * 10;

        return $this->awardPoints(
            user: $user,
            amount: $bonusPoints,
            reason: 'Step bonus',
            metadata: ['steps' => $steps]
        );
    }

    public function getUserTransactions(User $user, int $days = 30)
    {
        return PointTransaction::forUser($user->id)
            ->recent($days)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getUserBalance(User $user): int
    {
        return $user->total_points;
    }
}
