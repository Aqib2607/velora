<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'shipping'                  => 'required|array',
            'shipping.name'             => 'required|string',
            'shipping.address_line1'    => 'required|string',
            'shipping.city'             => 'required|string',
            'shipping.state'            => 'required|string',
            'shipping.postal_code'      => 'required|string',
            'shipping.country'          => 'required|string|size:2',
            'billing'                   => 'nullable|array',
            'currency_code'             => 'sometimes|string|size:3',
            'exchange_rate'             => 'sometimes|numeric|min:0.000001',
            'region_code'               => 'sometimes|string|max:10',
        ];
    }
}
