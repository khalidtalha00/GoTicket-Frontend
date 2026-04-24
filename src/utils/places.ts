export type PlaceSuggestion = {
  description: string;
  placeId: string;
};

import { buildApiUrl } from './api';

type PlacesApiResponse = {
  suggestions?: PlaceSuggestion[];
};

type ReverseApiResponse = {
  place?: string | null;
};

export async function getPlaceSuggestions(input: string): Promise<PlaceSuggestion[]> {
  const query = input.trim();
  if (query.length < 3) return [];

  try {
    const response = await fetch(buildApiUrl(`/api/location/search?q=${encodeURIComponent(query)}`));

    if (!response.ok) return [];

    const data = (await response.json()) as PlacesApiResponse;
    return Array.isArray(data.suggestions) ? data.suggestions : [];
  } catch {
    return [];
  }
}

export const reverseGeocodePlace = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const response = await fetch(
      buildApiUrl(`/api/location/reverse?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`)
    );

    if (!response.ok) return null;

    const data = (await response.json()) as ReverseApiResponse;
    return data.place ?? null;
  } catch {
    return null;
  }
};