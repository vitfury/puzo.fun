<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Genre extends Model
{
    protected $fillable = [
        'parent_id',
        'name',
        'description',
        'playlist_url',
        'year',
        'x_position',
        'y_position',
        'order_index',
    ];

    protected $casts = [
        'year' => 'integer',
        'x_position' => 'integer',
        'y_position' => 'integer',
        'order_index' => 'integer',
    ];

    // Legacy single parent relationship (for backward compatibility)
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Genre::class, 'parent_id');
    }

    // Multiple parents relationship
    public function parents(): BelongsToMany
    {
        return $this->belongsToMany(Genre::class, 'genre_parents', 'genre_id', 'parent_id')
            ->withTimestamps()
            ->orderBy('order_index');
    }

    // Legacy single children relationship (for backward compatibility)
    public function children(): HasMany
    {
        return $this->hasMany(Genre::class, 'parent_id')->orderBy('order_index');
    }

    // Multiple children relationship
    public function childrenMany(): BelongsToMany
    {
        return $this->belongsToMany(Genre::class, 'genre_parents', 'parent_id', 'genre_id')
            ->withTimestamps()
            ->orderBy('order_index');
    }

    public function userProgress(): HasMany
    {
        return $this->hasMany(UserGenreProgress::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(GenreComment::class);
    }

    public function scopeRoots($query)
    {
        // A genre is a root if it has no parent_id AND no parents in the many-to-many table
        return $query->whereNull('parent_id')
            ->whereDoesntHave('parents')
            ->orderBy('order_index');
    }
}
