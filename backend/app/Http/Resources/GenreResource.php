<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GenreResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $progress = null;

        if ($user) {
            $progress = $this->userProgress()
                ->where('user_id', $user->id)
                ->first();
        }

        return [
            'id' => $this->id,
            'parent_id' => $this->parent_id,
            'name' => $this->name,
            'description' => $this->description,
            'playlist_url' => $this->playlist_url,
            'year' => $this->year,
            'x_position' => $this->x_position,
            'y_position' => $this->y_position,
            'order_index' => $this->order_index,
            'children' => GenreResource::collection($this->whenLoaded('children')),
            'comments_count' => $this->whenCounted('comments'),
            'user_progress' => $progress ? [
                'is_available' => $progress->is_available,
                'is_completed' => $progress->isCompleted(),
                'completed_at' => $progress->completed_at?->toIso8601String(),
            ] : null,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
