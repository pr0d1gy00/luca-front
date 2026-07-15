import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { City, ApiResponse } from "../types";

const fetchCities = async (): Promise<City[]> => {
  const { data } =
    await apiClient.get<ApiResponse<City[]>>("/locations/cities");
  return data.data;
};

/**
 * Hook para obtener el listado de ciudades con sus provincias y países.
 * Configura un staleTime de 10 minutos debido a que la geografía cambia raramente.
 */
export function useGetCities() {
  return useQuery({
    queryKey: ["cities"],
    queryFn: fetchCities,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

export interface Country {
  id: string;
  name: string;
  code: string;
}

const fetchCountries = async (): Promise<Country[]> => {
  const { data } = await apiClient.get<ApiResponse<Country[]>>(
    "/locations/countries",
  );
  return data.data;
};

export function useGetCountries() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: fetchCountries,
    staleTime: 10 * 60 * 1000,
  });
}

const fetchCountryCities = async (countryUuid: string): Promise<City[]> => {
  if (!countryUuid) return [];
  const { data } = await apiClient.get<ApiResponse<City[]>>(
    `/locations/countries/${countryUuid}/cities`,
  );
  return data.data;
};

export function useGetCountryCities(countryUuid: string) {
  return useQuery({
    queryKey: ["country-cities", countryUuid],
    queryFn: () => fetchCountryCities(countryUuid),
    enabled: !!countryUuid,
    staleTime: 10 * 60 * 1000,
  });
}
