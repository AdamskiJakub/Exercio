"use client";

import { useMemo, useState } from "react";
import rawCitiesData from "polish-cities/data/city.json";

export interface RawCity {
  name: string;
  location: string;
  radius: number;
  county_code: string;
}

export interface City {
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  county_code: string;
}

export interface UseCityAutocompleteReturn {
  query: string;
  setQuery: (query: string) => void;
  filteredCities: City[];
  allCities: City[];
}

function parseLocation(location: string): {
  latitude: number;
  longitude: number;
} {
  const match = location.match(/POINT\s*\(([\d.-]+)\s+([\d.-]+)\)/);
  if (match) {
    return {
      latitude: parseFloat(match[1]),
      longitude: parseFloat(match[2]),
    };
  }
  return { latitude: 0, longitude: 0 };
}

let parsedCities: City[] | null = null;

function getCities(): City[] {
  if (parsedCities) return parsedCities;

  const data = rawCitiesData as unknown as { city: RawCity[] };
  parsedCities = data.city.map((raw: RawCity) => {
    const { latitude, longitude } = parseLocation(raw.location);
    return {
      name: raw.name,
      latitude,
      longitude,
      radius: raw.radius,
      county_code: raw.county_code,
    };
  });
  return parsedCities;
}

function normalizeDiacritics(str: string): string {
  return str
    .toLowerCase()
    .replace(/ą/g, "a")
    .replace(/ć/g, "c")
    .replace(/ę/g, "e")
    .replace(/ł/g, "l")
    .replace(/ń/g, "n")
    .replace(/ó/g, "o")
    .replace(/ś/g, "s")
    .replace(/ź/g, "z")
    .replace(/ż/g, "z");
}

export function useCityAutocomplete(): UseCityAutocompleteReturn {
  const [query, setQuery] = useState("");

  const allCities = useMemo(() => getCities(), []);

  const filteredCities = useMemo(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];

    const normalizedQuery = normalizeDiacritics(trimmed);

    return allCities.filter((city) => {
      const normalizedName = normalizeDiacritics(city.name);
      return normalizedName.includes(normalizedQuery);
    });
  }, [query, allCities]);

  return {
    query,
    setQuery,
    filteredCities,
    allCities,
  };
}
