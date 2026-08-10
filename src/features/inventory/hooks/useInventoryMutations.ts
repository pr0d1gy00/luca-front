import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "../api/inventoryApi";
import { BulkInventoryUpload } from "../schemas";
import { toast } from "sonner";

export function useUploadDocumentsMutation() {
  return useMutation({
    mutationFn: (files: File[]) => inventoryApi.uploadDocuments(files),
    onError: (error) => {
      console.error("Error uploading documents:", error);
      toast.error("Hubo un error al subir los documentos.");
    },
  });
}

export function useCreateBatchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkInventoryUpload) => inventoryApi.uploadBatch(payload),
    onSuccess: () => {
      toast.success("Lote procesado correctamente.");
      // Invalidate relevant queries to refresh the tables and metrics
      queryClient.invalidateQueries({ queryKey: ["pharmacy", "inventory"] });
      queryClient.invalidateQueries({ queryKey: ["pharmacy", "batches"] });
      queryClient.invalidateQueries({ queryKey: ["pharmacy", "metrics"] });
    },
    onError: (error) => {
      console.error("Error creating batch:", error);
      toast.error("Error al procesar el lote. Intenta nuevamente.");
    },
  });
}
