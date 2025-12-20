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

        $isAvailable = false;
        $isCompleted = false;
        $completedAt = null;

        if ($progress) {
            $isAvailable = $progress->is_available;
            $isCompleted = $progress->isCompleted();
            $completedAt = $progress->completed_at?->toIso8601String();
        } else {
            // Check if it's a root genre (no parents)
            $hasLegacyParent = $this->parent_id !== null;
            $hasManyToManyParents = $this->whenLoaded('parents') ? $this->parents->isNotEmpty() : $this->parents()->exists();
            
            if (!$hasLegacyParent && !$hasManyToManyParents) {
                // Root genres should be available by default
                // (they will be initialized on first access via initializeUserGenres)
                $isAvailable = true;
            }
        }

        // Get parent IDs from both legacy and many-to-many relationships
        $parentIds = collect();
        if ($this->parent_id) {
            $parentIds->push($this->parent_id);
        }
        if ($this->whenLoaded('parents')) {
            $parentIds = $parentIds->merge($this->parents->pluck('id'));
        }

        return [
            'id' => $this->id,
            'parent_id' => $this->parent_id, // Legacy single parent (for backward compatibility)
            'parent_ids' => $parentIds->unique()->values()->toArray(), // All parent IDs
            'name' => $this->name,
            'description' => $this->description,
            'playlist_url' => $this->playlist_url,
            'year' => $this->year,
            'x_position' => $this->x_position,
            'y_position' => $this->y_position,
            'order_index' => $this->order_index,
            'children' => GenreResource::collection($this->whenLoaded('children')),
            'parents' => GenreResource::collection($this->whenLoaded('parents')), // Many-to-many parents
            'comments_count' => $this->whenCounted('comments'),
            'user_progress' => [
                'is_available' => $isAvailable,
                'is_completed' => $isCompleted,
                'completed_at' => $completedAt,
            ],
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
