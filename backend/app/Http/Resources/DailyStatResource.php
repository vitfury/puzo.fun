<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DailyStatResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'date' => $this->date->format('Y-m-d'),
            'steps' => $this->steps,
            'calories_burned' => $this->calories_burned,
            'calories_consumed' => $this->calories_consumed,
            'points_earned' => $this->points_earned,
            'activities_completed' => $this->activities_completed,
        ];
    }
}
