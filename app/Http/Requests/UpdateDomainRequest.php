<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDomainRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        if ($this->has('url')) {
            $this->merge([
                'url' => rtrim($this->url, '/')
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'domain_name' => 'required|string|max:255',
            'url' => [
                'required',
                'url',
                'max:500',
                Rule::unique('domain_urls')->where(function ($query) {
                    return $query->where('user_id', $this->user()->id);
                })->ignore($this->route('id'))
            ],
            'status' => 'required|in:enabled,disabled'
        ];
    }

    public function messages(): array
    {
        return [
            'url.unique' => 'You have already added this domain URL.'
        ];
    }
}
