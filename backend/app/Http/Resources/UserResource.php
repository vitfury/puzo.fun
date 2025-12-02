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
            'race' => $this->race ?? 'human',
            'avatar_level' => $this->avatar_level,
            'total_points' => $this->total_points,
            'level' => $this->level ?? 1,
            'coins' => $this->coins ?? 0,
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
            // Equipment
            'equipped_armor_id' => $this->equipped_armor_id,
            'equipped_weapon_id' => $this->equipped_weapon_id,
            'equipped_armor' => $this->whenLoaded('equippedArmor', function () {
                return $this->equippedArmor ? new EquipmentResource($this->equippedArmor) : null;
            }, $this->equippedArmor ? [
                'id' => $this->equippedArmor->id,
                'name' => $this->equippedArmor->name,
                'type' => $this->equippedArmor->type,
                'grade' => $this->equippedArmor->grade,
            ] : null),
            'equipped_weapon' => $this->whenLoaded('equippedWeapon', function () {
                return $this->equippedWeapon ? new EquipmentResource($this->equippedWeapon) : null;
            }, $this->equippedWeapon ? [
                'id' => $this->equippedWeapon->id,
                'name' => $this->equippedWeapon->name,
                'type' => $this->equippedWeapon->type,
                'grade' => $this->equippedWeapon->grade,
            ] : null),
            'available_grade' => $this->getAvailableGrade(),
        ];
    }
}
