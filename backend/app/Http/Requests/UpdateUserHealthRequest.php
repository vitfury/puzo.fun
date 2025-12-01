<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserHealthRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'birth_date' => 'nullable|date|before:today',
            'height' => 'nullable|integer|min:50|max:300',
            'weight' => 'nullable|numeric|min:20|max:500',
            'waist_circumference' => 'nullable|integer|min:40|max:200',
            'body_fat_percentage' => 'nullable|numeric|min:3|max:60',
        ];
    }
}
