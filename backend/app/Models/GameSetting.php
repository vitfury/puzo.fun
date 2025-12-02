<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class GameSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'description',
    ];

    // Cache key for all settings
    private const CACHE_KEY = 'game_settings';
    private const CACHE_TTL = 3600; // 1 hour

    /**
     * Get a setting value by key
     */
    public static function getValue(string $key, mixed $default = null): mixed
    {
        $settings = self::getAllCached();
        
        if (!isset($settings[$key])) {
            return $default;
        }

        return self::castValue($settings[$key]['value'], $settings[$key]['type']);
    }

    /**
     * Set a setting value
     */
    public static function setValue(string $key, mixed $value, ?string $type = null, ?string $group = null, ?string $description = null): void
    {
        $data = ['value' => is_array($value) ? json_encode($value) : (string) $value];
        
        if ($type) $data['type'] = $type;
        if ($group) $data['group'] = $group;
        if ($description) $data['description'] = $description;

        self::updateOrCreate(['key' => $key], $data);
        self::clearCache();
    }

    /**
     * Get all settings cached
     */
    public static function getAllCached(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return self::all()->keyBy('key')->map(function ($setting) {
                return [
                    'value' => $setting->value,
                    'type' => $setting->type,
                    'group' => $setting->group,
                    'description' => $setting->description,
                ];
            })->toArray();
        });
    }

    /**
     * Get settings by group
     */
    public static function getByGroup(string $group): array
    {
        $settings = self::getAllCached();
        
        return array_filter($settings, fn($s) => $s['group'] === $group);
    }

    /**
     * Clear settings cache
     */
    public static function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Cast value to appropriate type
     */
    private static function castValue(string $value, string $type): mixed
    {
        return match ($type) {
            'integer' => (int) $value,
            'float' => (float) $value,
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'json' => json_decode($value, true),
            default => $value,
        };
    }

    /**
     * Get the typed value attribute
     */
    public function getTypedValueAttribute(): mixed
    {
        return self::castValue($this->value, $this->type);
    }
}

