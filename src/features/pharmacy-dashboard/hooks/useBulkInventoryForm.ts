import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bulkInventorySchema, type BulkInventoryFormValues } from "../schemas/bulk-inventory.schema";
import { useCreateBatchMutation, useUploadDocumentsMutation } from "@/features/inventory/hooks/useInventoryMutations";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";
import type { Medication } from "@/features/medications/schemas";

export function useBulkInventoryForm(initialData?: any, onBack?: () => void) {
  const user = useAuthStore((state) => state.user);
  const providerId = user?.id || "provider-id-fallback";

  const createBatchMutation = useCreateBatchMutation();
  const uploadDocumentsMutation = useUploadDocumentsMutation();
  const updateBatchMutation = (require("../hooks/usePharmacyBatches") as any).useUpdateBatchMutation();

  const form = useForm<BulkInventoryFormValues>({
    resolver: zodResolver(bulkInventorySchema),
    defaultValues: {
      notes: "",
      documents: [],
      items: [
        {
          id: "1",
          customActivePrinciple: "",
          brandName: "",
          laboratory: "",
          stock: 0,
          batchNumber: "",
          unitPrice: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
    keyName: "_key", // use custom key to avoid conflict with our 'id'
  });

  useEffect(() => {
    if (initialData) {
      let mappedDocuments = [];
      if (initialData.document_urls) {
        mappedDocuments = initialData.document_urls.map((url: string) => ({ url, name: "Documento adjunto" }));
      }
      
      let mappedItems = [];
      if (initialData.items && initialData.items.length > 0) {
        mappedItems = initialData.items.map((item: any, index: number) => ({
          id: item.id?.toString() || index.toString(),
          uuid: item.uuid,
          medicationId: item.medication?.uuid,
          customActivePrinciple: item.active_ingredient || "",
          brandName: item.laboratory || item.medication?.commercial_name || "",
          laboratory: item.laboratory || "",
          stock: item.stock || 0,
          batchNumber: item.batch_number || "",
          unitPrice: Number(item.unit_price || 0),
        }));
      }

      form.reset({
        notes: initialData.notes || "",
        documents: mappedDocuments,
        items: mappedItems,
      });
    }
  }, [initialData, form]);

  const handleMedicationSelect = (index: number, medication: Medication | null, customText: string) => {
    form.setValue(`items.${index}.customActivePrinciple`, customText);
    form.setValue(`items.${index}.medicationId`, medication?.uuid || undefined);
    form.setValue(`items.${index}.brandName`, (medication as any)?.commercial_name || (medication as any)?.commercialName || "");
    form.setValue(`items.${index}.laboratory`, (medication as any)?.laboratory || "");
  };

  const onSubmit = async (data: BulkInventoryFormValues) => {
    try {
      let uploadedUrls: string[] = [];

      // Upload documents if needed
      const rawFiles = (data.documents || []).map((d: any) => d.file).filter(Boolean) as File[];
      if (rawFiles.length > 0) {
        uploadedUrls = await uploadDocumentsMutation.mutateAsync(rawFiles);
      }

      const payload: any = {
        batch: {
          providerId,
          documentUrls: uploadedUrls.length > 0 ? uploadedUrls : (initialData?.document_urls || undefined),
          notes: data.notes,
        },
        items: data.items.map((i) => ({
          uuid: i.uuid || undefined,
          providerId,
          medicationId: i.medicationId || undefined,
          customActivePrinciple: i.customActivePrinciple || undefined,
          brandName: i.brandName || undefined,
          laboratory: i.laboratory || undefined,
          stock: i.stock,
          minStockAlert: 10,
          batchNumber: i.batchNumber || undefined,
          unitPrice: i.unitPrice || 0,
          isTaxExempt: false,
          isActive: true,
        })),
      };

      if (initialData && initialData.uuid) {
        const editPayload = {
          notes: payload.batch.notes,
          documentUrls: payload.batch.documentUrls,
          items: payload.items,
        };
        await updateBatchMutation.mutateAsync({ uuid: initialData.uuid, data: editPayload });
        toast.success("Lote actualizado");
      } else {
        await createBatchMutation.mutateAsync(payload);
        toast.success("Lote cargado exitosamente");
      }
      
      if (onBack) onBack();
    } catch (error) {
      toast.error("Error guardando el lote");
    }
  };

  const isSaving = uploadDocumentsMutation.isPending || createBatchMutation.isPending || (updateBatchMutation?.isPending ?? false);

  return {
    form,
    fields,
    append,
    remove,
    handleMedicationSelect,
    onSubmit: form.handleSubmit(onSubmit),
    isSaving,
  };
}
