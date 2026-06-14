import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiFetch } from "@/lib/api";

export interface LocationState {
    city: string;
    postalCode: string;
    countryCode: string;
    displayName: string;
    lat: number | null;
    lon: number | null;
    isLoading: boolean;
    error: string | null;

    fetchLocation: () => Promise<void>;
    setLocation: (location: Partial<LocationState>) => void;
}

export interface GeocodeResponse {
    city: string;
    postal_code: string;
    country_code: string;
    display_name: string;
    lat: number;
    lon: number;
}

export const useLocationStore = create<LocationState>()(
    persist(
        (set) => ({
            city: "New York",
            postalCode: "10001",
            countryCode: "US",
            displayName: "New York 10001",
            lat: null,
            lon: null,
            isLoading: false,
            error: null,

            setLocation: (location) => set((state) => ({ ...state, ...location })),

            fetchLocation: async () => {
                set({ isLoading: true, error: null });
                
                try {
                    // Try to get browser geolocation
                    if ("geolocation" in navigator) {
                        navigator.geolocation.getCurrentPosition(
                            async (position) => {
                                const { latitude, longitude } = position.coords;
                                try {
                                    const res = await apiFetch<{ data: GeocodeResponse }>('GET', `/v1/location/reverse-geocode?lat=${latitude}&lon=${longitude}`);
                                    if (res && res.data) {
                                        set({
                                            city: res.data.city,
                                            postalCode: res.data.postal_code,
                                            countryCode: res.data.country_code,
                                            displayName: `${res.data.city} ${res.data.postal_code}`.trim(),
                                            lat: latitude,
                                            lon: longitude,
                                            isLoading: false,
                                        });
                                    } else {
                                        throw new Error("Invalid location data");
                                    }
                                } catch (e) {
                                    set({ error: "Failed to reverse geocode", isLoading: false });
                                }
                            },
                            (error) => {
                                // GPS blocked or unavailable, use fallback (could implement IP fallback here)
                                set({ error: "Geolocation denied or unavailable. Using default location.", isLoading: false });
                            },
                            { timeout: 10000 }
                        );
                    } else {
                        set({ error: "Geolocation not supported by this browser.", isLoading: false });
                    }
                } catch (error) {
                    set({ error: "Location fetch failed", isLoading: false });
                }
            },
        }),
        {
            name: "velora-location",
        }
    )
);
