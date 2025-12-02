<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateActivityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'type' => ['sometimes', 'in:daily_task,ongoing_rule,music_walk,training'],
            'description' => ['nullable', 'string'],
            'coins' => ['sometimes', 'integer', 'min:0'],
            'experience' => ['sometimes', 'integer', 'min:0'],
            'active_from' => ['nullable', 'date'],
            'active_to' => ['nullable', 'date', 'after_or_equal:active_from'],
            'is_active' => ['boolean'],
            'order_index' => ['integer', 'min:0'],
        ];
    }
}
