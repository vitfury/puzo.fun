<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EquipmentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'grade' => $this->grade,
            'required_level' => $this->required_level,
            'price' => $this->price,
            'is_active' => $this->is_active,
            'can_equip' => $user ? $this->canBeEquippedBy($user) : false,
            'can_purchase' => $user ? $this->canBePurchasedBy($user) : false,
            'is_owned' => $this->when(
                $this->relationLoaded('owners') || isset($this->pivot),
                fn() => true,
                fn() => $user ? $user->ownedEquipment()->where('equipment_id', $this->id)->exists() : false
            ),
        ];
    }
}

