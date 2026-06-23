import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { Specialty, ApiResponse } from "../types";

const fetchSpecialties = async (): Promise<Specialty[]> => {
  const { data } =
    await apiClient.get<ApiResponse<Specialty[]>>("/specialties");
  return data.data;
};

/**
 * Hook para obtener el listado de especialidades médicas disponibles.
 * Configura un staleTime de 10 minutos debido a que las especialidades cambian raramente.
 */
export function useGetSpecialties() {
  return useQuery({
    queryKey: ["specialties"],
    queryFn: fetchSpecialties,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}
