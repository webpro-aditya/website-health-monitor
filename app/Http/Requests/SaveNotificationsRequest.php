<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaveNotificationsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'emails' => 'nullable|array',
            'emails.*' => 'nullable|email',
            'phones' => 'nullable|array',
            'phones.*' => 'nullable|string'
        ];
    }
}
