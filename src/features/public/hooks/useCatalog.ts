import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "../api/catalogApi";
import type { Doctor, Pharmacy, Clinic, City } from "../types/catalog.types";

// ============================================
// DOCTORS
// ============================================

interface UseDoctorsOptions {
	city_id?: number;
	specialty_id?: number;
	page?: number;
	per_page?: number;
	search?: string;
}

export function useDoctors(options: UseDoctorsOptions = {}) {
	return useQuery({
		queryKey: ["public", "doctors", options],
		queryFn: () => catalogApi.getDoctors(options),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// ============================================
// PHARMACIES
// ============================================

interface UsePharmaciesOptions {
	city_id?: number;
	page?: number;
	per_page?: number;
	search?: string;
}

export function usePharmacies(options: UsePharmaciesOptions = {}) {
	return useQuery({
		queryKey: ["public", "pharmacies", options],
		queryFn: () => catalogApi.getPharmacies(options),
		staleTime: 5 * 60 * 1000,
	});
}

// ============================================
// CLINICS
// ============================================

interface UseClinicsOptions {
	city_id?: number;
	page?: number;
	per_page?: number;
	search?: string;
}

export function useClinics(options: UseClinicsOptions = {}) {
	return useQuery({
		queryKey: ["public", "clinics", options],
		queryFn: () => catalogApi.getClinics(options),
		staleTime: 5 * 60 * 1000,
	});
}

// ============================================
// CITIES (for filters)
// ============================================

export function useCities() {
	return useQuery({
		queryKey: ["public", "cities"],
		queryFn: () => catalogApi.getCities(),
		staleTime: 30 * 60 * 1000, // 30 minutes - cities don't change often
	});
}
