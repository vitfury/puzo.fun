<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Equipment extends Model
{
    use HasFactory;

    protected $table = 'equipment';

    protected $fillable = [
        'name',
        'type',
        'grade',
        'required_level',
        'price',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'required_level' => 'integer',
        'price' => 'integer',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];

    // Grade constants
    public const GRADE_NO_GRADE = 'no-grade';
    public const GRADE_D = 'D';
    public const GRADE_C = 'C';
    public const GRADE_B = 'B';
    public const GRADE_A = 'A';
    public const GRADE_S = 'S';

    // Type constants
    public const TYPE_ARMOR = 'armor';
    public const TYPE_WEAPON = 'weapon';

    // Grade level ranges
    public const GRADE_LEVEL_RANGES = [
        self::GRADE_NO_GRADE => ['min' => 1, 'max' => 19],
        self::GRADE_D => ['min' => 20, 'max' => 39],
        self::GRADE_C => ['min' => 40, 'max' => 51],
        self::GRADE_B => ['min' => 52, 'max' => 60],
        self::GRADE_A => ['min' => 61, 'max' => 76],
        self::GRADE_S => ['min' => 76, 'max' => 80],
    ];

    public static function getGrades(): array
    {
        return [
            self::GRADE_NO_GRADE,
            self::GRADE_D,
            self::GRADE_C,
            self::GRADE_B,
            self::GRADE_A,
            self::GRADE_S,
        ];
    }

    public static function getTypes(): array
    {
        return [
            self::TYPE_ARMOR,
            self::TYPE_WEAPON,
        ];
    }

    public function owners(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_equipment')
            ->withPivot('purchased_price')
            ->withTimestamps();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeOfGrade($query, string $grade)
    {
        return $query->where('grade', $grade);
    }

    public function scopeArmor($query)
    {
        return $query->ofType(self::TYPE_ARMOR);
    }

    public function scopeWeapon($query)
    {
        return $query->ofType(self::TYPE_WEAPON);
    }

    public function canBeEquippedBy(User $user): bool
    {
        return $user->level >= $this->required_level;
    }

    public function canBePurchasedBy(User $user): bool
    {
        return $this->canBeEquippedBy($user) && $user->coins >= $this->price;
    }
}

