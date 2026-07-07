"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patientInvoiceApi } from "../api/patientInvoiceApi";
import { patientInvoiceKeys } from "./usePatientInvoicesQuery";

export function useReportPaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      uuid,
      paymentData,
    }: {
      uuid: string;
      paymentData: FormData;
    }) => patientInvoiceApi.reportPatientPayment(uuid, paymentData),
    onSuccess: (_, variables) => {
      // Invalidar listas y el detalle de la factura modificada para refrescar los datos
      queryClient.invalidateQueries({
        queryKey: patientInvoiceKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: ["patient-invoices", "detail", variables.uuid],
      });
    },
  });
}
