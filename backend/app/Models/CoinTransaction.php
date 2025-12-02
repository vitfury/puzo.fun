<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class CoinTransaction extends Model
{
    protected $fillable = [
        'user_id',
        'amount',
        'reason',
        'source_type',
        'source_id',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'integer',
        'metadata' => 'array',
    ];

    // Reason constants
    public const REASON_MUSIC_WALK = 'music_walk';
    public const REASON_STREAK_BONUS = 'streak_bonus';
    public const REASON_PURCHASE = 'purchase';
    public const REASON_SELL = 'sell';
    public const REASON_ADMIN = 'admin';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function source(): MorphTo
    {
        return $this->morphTo();
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}

