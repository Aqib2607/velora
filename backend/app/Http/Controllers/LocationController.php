<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LocationController extends Controller
{
    /**
     * Reverse geocode latitude and longitude to get city and postal code
     */
    public function reverseGeocode(Request $request): JsonResponse
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lon' => 'required|numeric',
        ]);

        $lat = $request->input('lat');
        $lon = $request->input('lon');

        try {
            // Using OpenStreetMap Nominatim API for reverse geocoding
            // Note: Nominatim requires a valid User-Agent
            $response = Http::withHeaders([
                'User-Agent' => 'Velora-App/1.0',
                'Accept-Language' => 'en-US,en;q=0.9',
            ])->timeout(5)->get('https://nominatim.openstreetmap.org/reverse', [
                'lat' => $lat,
                'lon' => $lon,
                'format' => 'jsonv2',
                'addressdetails' => 1,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                $address = $data['address'] ?? [];
                
                // Fallback mechanisms to extract the best city name
                $city = $address['city'] ?? $address['town'] ?? $address['village'] ?? $address['county'] ?? 'Unknown Location';
                $postalCode = $address['postcode'] ?? '';
                $country = $address['country_code'] ?? 'us';
                
                return response()->json([
                    'status' => 'success',
                    'data' => [
                        'city' => $city,
                        'postal_code' => $postalCode,
                        'country_code' => strtoupper($country),
                        'display_name' => $data['display_name'] ?? "$city $postalCode",
                        'lat' => $lat,
                        'lon' => $lon,
                    ]
                ]);
            }
            
            Log::warning('Reverse geocoding failed with Nominatim: ' . $response->body());
        } catch (\Exception $e) {
            Log::error('Reverse geocoding exception: ' . $e->getMessage());
        }

        // IP-based or Default fallback
        return response()->json([
            'status' => 'success',
            'data' => [
                'city' => 'Unknown Location',
                'postal_code' => '',
                'country_code' => 'US',
                'display_name' => 'Unknown Location',
                'lat' => $lat,
                'lon' => $lon,
            ]
        ]);
    }
}
