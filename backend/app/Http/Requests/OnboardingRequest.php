<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OnboardingRequest extends FormRequest
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
            'birth_date' => ['required', 'date', 'before:today', 'after:1900-01-01'],
            'weight' => ['required', 'numeric', 'min:20', 'max:500'],
            'height' => ['required', 'integer', 'min:50', 'max:300'],
            'race' => ['required', 'in:human,orc,elf,dark_elf,dwarf'],
            'activity_preference' => ['required', 'in:gym,bodyweight,walking_running'],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'birth_date.required' => 'Birth date is required',
            'birth_date.date' => 'Birth date must be a valid date',
            'birth_date.before' => 'Birth date must be in the past',
            'birth_date.after' => 'Birth date must be after 1900',
            'weight.required' => 'Weight is required',
            'weight.numeric' => 'Weight must be a number',
            'weight.min' => 'Weight must be at least 20 kg',
            'weight.max' => 'Weight must not exceed 500 kg',
            'height.required' => 'Height is required',
            'height.integer' => 'Height must be an integer',
            'height.min' => 'Height must be at least 50 cm',
            'height.max' => 'Height must not exceed 300 cm',
            'race.required' => 'Race is required',
            'race.in' => 'Invalid race selected',
            'activity_preference.required' => 'Activity preference is required',
            'activity_preference.in' => 'Invalid activity preference selected',
        ];
    }
}
