<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserGenreProgress extends Model
{
    protected $table = 'user_genre_progress';

    protected $fillable = [
        'user_id',
        'genre_id',
        'completed_at',
        'is_available',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
        'is_available' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function genre(): BelongsTo
    {
        return $this->belongsTo(Genre::class);
    }

    public function isCompleted(): bool
    {
        return $this->completed_at !== null;
    }
}
