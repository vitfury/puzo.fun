<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nickname' => $this->nickname,
            'email' => $this->email,
            'role' => $this->role,
            'avatar_level' => $this->avatar_level,
            'total_points' => $this->total_points,
            'daily_calorie_limit' => $this->daily_calorie_limit,
            'current_music_walk_streak' => $this->current_music_walk_streak,
            'longest_music_walk_streak' => $this->longest_music_walk_streak,
            'date_of_birth' => $this->date_of_birth?->format('Y-m-d'),
            'birth_date' => $this->birth_date?->format('Y-m-d'),
            'height' => $this->height,
            'weight' => $this->weight,
            'weight_updated_at' => $this->weight_updated_at?->format('Y-m-d H:i:s'),
            'waist_circumference' => $this->waist_circumference,
            'body_fat_percentage' => $this->body_fat_percentage,
            'age' => $this->age,
            'bmi' => $this->bmi,
            'needs_weight_update' => $this->needsWeightUpdate(),
            'created_at' => $this->created_at,
        ];
    }
}
