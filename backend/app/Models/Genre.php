<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Genre::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Genre::class, 'parent_id')->orderBy('order_index');
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
        return $query->whereNull('parent_id')->orderBy('order_index');
    }
}
