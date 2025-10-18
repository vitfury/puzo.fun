<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Get locale from request header or default to 'en'
        $locale = $request->header('Accept-Language', 'en');
        // Handle cases like 'en-US' or 'uk-UA'
        $locale = substr($locale, 0, 2);

        // Get translation if available
        $translation = $this->getTranslation($locale);

        return [
            'id' => $this->id,
            'name' => $translation?->name ?? $this->name,
            'type' => $this->type,
            'description' => $translation?->description ?? $this->description,
            'points' => $this->points,
            'active_from' => $this->active_from?->format('Y-m-d'),
            'active_to' => $this->active_to?->format('Y-m-d'),
            'is_active' => $this->is_active,
            'order_index' => $this->order_index,
            'completed_at' => $this->when(
                isset($this->completed_at),
                fn() => $this->completed_at?->toIso8601String()
            ),
            'is_completed' => $this->when(
                isset($this->is_completed),
                fn() => $this->is_completed
            ),
        ];
    }
}
