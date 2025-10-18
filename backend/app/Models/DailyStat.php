<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyStat extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'steps',
        'calories_burned',
        'calories_consumed',
        'points_earned',
        'activities_completed',
    ];

    protected $casts = [
        'date' => 'date',
        'steps' => 'integer',
        'calories_burned' => 'integer',
        'calories_consumed' => 'integer',
        'points_earned' => 'integer',
        'activities_completed' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeForDate($query, $date)
    {
        return $query->whereDate('date', $date);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function incrementActivitiesCompleted(int $points): void
    {
        $this->increment('activities_completed');
        $this->increment('points_earned', $points);
    }
}
