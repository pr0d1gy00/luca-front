import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

export function useLabAppointments(date: string) {
  return useQuery({
    queryKey: ["lab-appointments", date],
    queryFn: async () => {
      const response = await apiClient.get(
        `/api/v1/laboratory/appointments?date=${date}`,
      );
      return response.data;
    },
  });
}

export function useBookLabSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      lab_quote_offer_id: number;
      scheduled_date: string;
      time_slot?: string;
      notes?: string;
    }) => {
      const response = await apiClient.post(
        "/api/v1/laboratory/appointments/book",
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-appointments"] });
    },
  });
}
