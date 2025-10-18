<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'google_id',
        'strava_id',
        'avatar_level',
        'total_points',
        'daily_calorie_limit',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'avatar_level' => 'integer',
        'total_points' => 'integer',
        'daily_calorie_limit' => 'integer',
        'current_streak' => 'integer',
        'longest_streak' => 'integer',
        'last_activity_date' => 'date',
    ];

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(UserActivityLog::class);
    }

    public function dailyStats(): HasMany
    {
        return $this->hasMany(DailyStat::class);
    }

    public function pointTransactions(): HasMany
    {
        return $this->hasMany(PointTransaction::class);
    }

    public function genreProgress(): HasMany
    {
        return $this->hasMany(UserGenreProgress::class);
    }

    public function addPoints(int $points): void
    {
        $this->increment('total_points', $points);
    }

    public function updateStreak(Carbon $date): void
    {
        $yesterday = $date->copy()->subDay();

        if (!$this->last_activity_date) {
            // First activity ever
            $this->current_streak = 1;
        } elseif ($this->last_activity_date->isSameDay($date)) {
            // Already updated today, no change
            return;
        } elseif ($this->last_activity_date->isSameDay($yesterday)) {
            // Consecutive day
            $this->current_streak++;
        } else {
            // Streak broken
            $this->current_streak = 1;
        }

        if ($this->current_streak > $this->longest_streak) {
            $this->longest_streak = $this->current_streak;
        }

        $this->last_activity_date = $date;
        $this->save();
    }

    public function resetStreak(): void
    {
        $this->current_streak = 0;
        $this->save();
    }
}
