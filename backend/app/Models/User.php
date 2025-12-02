<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'nickname',
        'email',
        'password',
        'role',
        'race',
        'google_id',
        'strava_id',
        'avatar_level',
        'total_points',
        'level',
        'coins',
        'equipped_armor_id',
        'equipped_weapon_id',
        'daily_calorie_limit',
        'birth_date',
        'height',
        'weight',
        'weight_updated_at',
        'waist_circumference',
        'body_fat_percentage',
        'activity_preference',
        'onboarding_completed',
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
        'level' => 'integer',
        'coins' => 'integer',
        'daily_calorie_limit' => 'integer',
        'current_music_walk_streak' => 'integer',
        'longest_music_walk_streak' => 'integer',
        'last_music_walk_date' => 'date',
        'birth_date' => 'date',
        'height' => 'integer',
        'weight' => 'decimal:2',
        'weight_updated_at' => 'datetime',
        'waist_circumference' => 'integer',
        'body_fat_percentage' => 'decimal:2',
        'onboarding_completed' => 'boolean',
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

    public function coinTransactions(): HasMany
    {
        return $this->hasMany(CoinTransaction::class);
    }

    public function healthHistory(): HasMany
    {
        return $this->hasMany(HealthHistory::class);
    }

    public function genreProgress(): HasMany
    {
        return $this->hasMany(UserGenreProgress::class);
    }

    public function favoriteActivities(): BelongsToMany
    {
        return $this->belongsToMany(Activity::class, 'user_favorite_activities')
            ->withTimestamps();
    }

    public function ownedEquipment(): BelongsToMany
    {
        return $this->belongsToMany(Equipment::class, 'user_equipment')
            ->withPivot('purchased_price')
            ->withTimestamps();
    }

    public function equippedArmor(): BelongsTo
    {
        return $this->belongsTo(Equipment::class, 'equipped_armor_id');
    }

    public function equippedWeapon(): BelongsTo
    {
        return $this->belongsTo(Equipment::class, 'equipped_weapon_id');
    }

    public function addPoints(int $points): void
    {
        $this->increment('total_points', $points);
    }

    public function addCoins(int $coins): void
    {
        $this->increment('coins', $coins);
    }

    public function updateMusicWalkStreak(Carbon $date): void
    {
        $yesterday = $date->copy()->subDay();

        if (!$this->last_music_walk_date) {
            // First music walk ever
            $this->current_music_walk_streak = 1;
        } elseif ($this->last_music_walk_date->isSameDay($date)) {
            // Already updated today, no change
            return;
        } elseif ($this->last_music_walk_date->isSameDay($yesterday)) {
            // Consecutive day
            $this->current_music_walk_streak++;
        } else {
            // Streak broken
            $this->current_music_walk_streak = 1;
        }

        if ($this->current_music_walk_streak > $this->longest_music_walk_streak) {
            $this->longest_music_walk_streak = $this->current_music_walk_streak;
        }

        $this->last_music_walk_date = $date;
        $this->save();
    }

    public function resetMusicWalkStreak(): void
    {
        $this->current_music_walk_streak = 0;
        $this->save();
    }

    public function getAgeAttribute(): ?int
    {
        if (!$this->birth_date) {
            return null;
        }
        return $this->birth_date->age;
    }

    public function getBmiAttribute(): ?float
    {
        if (!$this->height || !$this->weight) {
            return null;
        }
        $heightInMeters = $this->height / 100;
        return round($this->weight / ($heightInMeters * $heightInMeters), 1);
    }

    public function needsWeightUpdate(): bool
    {
        if (!$this->weight_updated_at) {
            return true;
        }

        $lastUpdate = Carbon::parse($this->weight_updated_at);
        $now = Carbon::now();

        // Check if it's weekend (Saturday or Sunday)
        $isWeekend = $now->isWeekend();

        // Check if last update was more than a week ago
        $weeksSinceUpdate = $lastUpdate->diffInWeeks($now);

        return $isWeekend && $weeksSinceUpdate >= 1;
    }

    /**
     * Check if user can equip a specific grade
     */
    public function canEquipGrade(string $grade): bool
    {
        $minLevel = match ($grade) {
            'no-grade' => 1,
            'D' => 20,
            'C' => 40,
            'B' => 52,
            'A' => 61,
            'S' => 76,
            default => 1,
        };

        return $this->level >= $minLevel;
    }

    /**
     * Get current equipment grade available to user
     */
    public function getAvailableGrade(): string
    {
        if ($this->level >= 76) return 'S';
        if ($this->level >= 61) return 'A';
        if ($this->level >= 52) return 'B';
        if ($this->level >= 40) return 'C';
        if ($this->level >= 20) return 'D';
        return 'no-grade';
    }
}
