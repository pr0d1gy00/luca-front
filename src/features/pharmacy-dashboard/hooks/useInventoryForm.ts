import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inventorySchema, type InventoryFormValues } from "../schemas/inventorySchema";
import type { PharmacyInventoryItem } from "../types/pharmacy.types";
import { usePharmacyInventory } from "./usePharmacyInventory";

export function useInventoryForm(itemToEdit?: PharmacyInventoryItem | null, onClose?: () => void) {
  const { createItem, updateItem, isCreating, isUpdating } = usePharmacyInventory();

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      medicationId: 1,
      eanCode: "",
      activeIngredient: "",
      laboratory: "",
      saleCondition: "prescription",
      packageStock: 10,
      fractionStock: 0,
      minStockAlert: 5,
      batchNumber: "",
      expirationDate: "",
      locationRack: "",
      allowsFractioning: false,
      unitsPerPackage: 10,
      fractionUnitName: "Blíster",
      prices: { USD: 0, VES: 0, EUR: 0 }
    }
  });

  useEffect(() => {
    if (itemToEdit) {
      form.reset({
        medicationId: itemToEdit.medication_id || 1,
        eanCode: itemToEdit.ean_code || "",
        activeIngredient: itemToEdit.active_ingredient || "",
        laboratory: itemToEdit.laboratory || "",
        saleCondition: itemToEdit.sale_condition || "prescription",
        packageStock: itemToEdit.package_stock || 0,
        fractionStock: itemToEdit.fraction_stock || 0,
        minStockAlert: itemToEdit.min_stock_alert || 5,
        batchNumber: itemToEdit.batch_number || "",
        expirationDate: itemToEdit.expiration_date || "",
        locationRack: itemToEdit.location_rack || "",
        allowsFractioning: itemToEdit.allows_fractioning || false,
        unitsPerPackage: itemToEdit.units_per_package || 10,
        fractionUnitName: itemToEdit.fraction_unit_name || "Blíster",
        prices: {
          USD: itemToEdit.prices_manual?.USD || 0,
          VES: itemToEdit.prices_manual?.VES || 0,
          EUR: itemToEdit.prices_manual?.EUR || 0,
        }
      });
    }
  }, [itemToEdit, form]);

  const onSubmit = async (data: InventoryFormValues) => {
    const payload: Partial<PharmacyInventoryItem> = {
      medication_id: data.medicationId,
      ean_code: data.eanCode,
      active_ingredient: data.activeIngredient,
      laboratory: data.laboratory,
      sale_condition: data.saleCondition,
      package_stock: data.packageStock,
      fraction_stock: data.fractionStock,
      stock: data.packageStock, // using package stock as main stock
      min_stock_alert: data.minStockAlert,
      batch_number: data.batchNumber,
      expiration_date: data.expirationDate,
      location_rack: data.locationRack,
      allows_fractioning: data.allowsFractioning,
      units_per_package: data.unitsPerPackage,
      fraction_unit_name: data.fractionUnitName,
      prices_manual: data.prices,
    };

    if (itemToEdit) {
      await updateItem({ id: itemToEdit.id, payload });
    } else {
      await createItem(payload);
    }

    if (onClose) onClose();
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: isCreating || isUpdating,
  };
}
