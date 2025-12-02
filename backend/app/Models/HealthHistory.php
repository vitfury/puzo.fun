<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HealthHistory extends Model
{
    protected $table = 'health_history';

    protected $fillable = [
        'user_id',
        'date',
        'weight',
        'bmi',
        'waist_circumference',
        'body_fat_percentage',
    ];

    protected $casts = [
        'date' => 'date',
        'weight' => 'decimal:2',
        'bmi' => 'decimal:1',
        'waist_circumference' => 'integer',
        'body_fat_percentage' => 'decimal:1',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeRecent($query, int $days = 60)
    {
        return $query->where('date', '>=', now()->subDays($days));
    }

    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }
}

