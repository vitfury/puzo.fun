<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class Activity extends Model
{
    protected $fillable = [
        'name',
        'type',
        'description',
        'points',
        'coins',
        'experience',
        'active_from',
        'active_to',
        'is_active',
        'daily_streak_enabled',
        'order_index',
    ];

    protected $casts = [
        'active_from' => 'date',
        'active_to' => 'date',
        'is_active' => 'boolean',
        'daily_streak_enabled' => 'boolean',
        'points' => 'integer',
        'coins' => 'integer',
        'experience' => 'integer',
        'order_index' => 'integer',
    ];

    public function userActivityLogs(): HasMany
    {
        return $this->hasMany(UserActivityLog::class);
    }

    public function translations(): HasMany
    {
        return $this->hasMany(ActivityTranslation::class);
    }

    public function getTranslation(string $locale = 'en'): ?ActivityTranslation
    {
        return $this->translations()->where('locale', $locale)->first();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeActiveOnDate($query, Carbon $date)
    {
        return $query->where('is_active', true)
            ->where(function ($q) use ($date) {
                $q->whereNull('active_from')
                    ->orWhere('active_from', '<=', $date);
            })
            ->where(function ($q) use ($date) {
                $q->whereNull('active_to')
                    ->orWhere('active_to', '>=', $date);
            });
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order_index')->orderBy('name');
    }

    public function isActiveOnDate(Carbon $date): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->active_from && $this->active_from->isAfter($date)) {
            return false;
        }

        if ($this->active_to && $this->active_to->isBefore($date)) {
            return false;
        }

        return true;
    }
}
