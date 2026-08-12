import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { substituteSchema, type SubstituteFormValues } from "../schemas/substitute.schema";
import { usePharmacyInventory } from "./usePharmacyInventory";
import type { PharmacyInventoryItem } from "../types/pharmacy.types";
import { useState } from "react";

interface UseManualSubstituteFormProps {
  onSelectSubstitute: (item: PharmacyInventoryItem, reason: string) => void;
  onClose: () => void;
}

export function useManualSubstituteForm({ onSelectSubstitute, onClose }: UseManualSubstituteFormProps) {
  const form = useForm<SubstituteFormValues>({
    resolver: zodResolver(substituteSchema),
    defaultValues: {
      searchTerm: "",
      reason: "Sin stock de marca original, se ofrece bioequivalente de misma dosis",
      selectedItemId: "",
    },
  });

  const searchTerm = form.watch("searchTerm") || "";
  const { inventory, isLoading } = usePharmacyInventory({ search: searchTerm });
  
  // We keep the selected item object locally to pass it back via callback, 
  // while RHF tracks the ID for validation.
  const [selectedItem, setSelectedItem] = useState<PharmacyInventoryItem | null>(null);

  const handleSelectItem = (item: PharmacyInventoryItem) => {
    setSelectedItem(item);
    form.setValue("selectedItemId", (item as any).id || "", { shouldValidate: true });
  };

  const onSubmit = (data: SubstituteFormValues) => {
    if (selectedItem) {
      onSelectSubstitute(selectedItem, data.reason);
      onClose();
    }
  };

  return {
    form,
    inventory,
    isLoading,
    selectedItem,
    handleSelectItem,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
