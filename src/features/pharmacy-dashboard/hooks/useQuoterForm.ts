import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quoterSchema, type QuoterFormValues, type QuoterItemFormValues } from "../schemas/quoterSchema";
import { useCreateQuoteOffer, useUpdateQuoteOffer } from "./usePharmacyQuotes";
import type { UpsellRuleSuggestion, PharmacyInventoryItem } from "../types/pharmacy.types";

export function useQuoterForm(quoteRequest: any, existingOffer: any, onClose: () => void) {
  const createOfferMutation = useCreateQuoteOffer();
  const updateOfferMutation = useUpdateQuoteOffer();

  const form = useForm<QuoterFormValues>({
    resolver: zodResolver(quoterSchema),
    defaultValues: {
      comments: "",
      items: []
    }
  });

  const { fields: items, append, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    if (existingOffer?.quote_offer_items) {
      const formattedItems = existingOffer.quote_offer_items.map((offerItem: any, idx: number) => {
        const originalItem = quoteRequest?.prescription?.items?.find((i: any) => i.id === offerItem.prescription_item_id);
        let medName = `Medicamento #${idx + 1}`;
        let defaultProductName = "";
        
        if (originalItem?.medication) {
          const commName = originalItem.medication.commercial_name;
          const actPrinc = originalItem.medication.active_principle;
          const basicName = originalItem.medication.name;
          
          if (commName && actPrinc) {
            medName = `${commName} (${actPrinc})`;
          } else {
            medName = basicName || commName || actPrinc || medName;
          }
          defaultProductName = commName || basicName || actPrinc || medName;
        }
        
        return {
          tempId: `existing-${idx}`,
          prescription_item_id: offerItem.prescription_item_id,
          originalName: medName,
          custom_product_name: offerItem.custom_product_name || defaultProductName,
          availabilityStatus: offerItem.is_substituted ? "substitute" : "available",
          is_substituted: offerItem.is_substituted,
          substituted_inventory_id: offerItem.substituted_inventory_id,
          substitution_reason: offerItem.substitution_reason,
          sell_format: offerItem.sell_format,
          quantity: offerItem.quantity,
          prices_manual: offerItem.prices_manual || { USD: 0, VES: 0, EUR: 0 },
          notes: offerItem.notes || "",
        };
      });
      form.reset({ comments: existingOffer.comments || "", items: formattedItems });
    } else if (quoteRequest?.prescription?.items) {
      const initialItems = quoteRequest.prescription.items.map((item: any, idx: number) => {
        let medName = `Medicamento #${idx + 1}`;
        let defaultProductName = "";
        
        if (item.medication) {
          const commName = item.medication.commercial_name;
          const actPrinc = item.medication.active_principle;
          const basicName = item.medication.name;
          
          if (commName && actPrinc) {
            medName = `${commName} (${actPrinc})`;
          } else {
            medName = basicName || commName || actPrinc || medName;
          }
          defaultProductName = commName || basicName || actPrinc || medName;
        }

        return {
          tempId: `presc-${idx}`,
          prescription_item_id: item.id,
          originalName: medName,
          custom_product_name: defaultProductName,
          availabilityStatus: "available",
          is_substituted: false,
          sell_format: "package",
          quantity: 1,
          prices_manual: { USD: 0, VES: 0, EUR: 0 },
          notes: "",
        };
      });
      form.reset({ comments: "", items: initialItems });
    } else {
      form.reset({
        comments: "",
        items: [{
          tempId: "adhoc-0",
          originalName: "Ítem Ad-Hoc",
          custom_product_name: "",
          availabilityStatus: "available",
          is_substituted: false,
          sell_format: "package",
          quantity: 1,
          prices_manual: { USD: 0, VES: 0, EUR: 0 },
          notes: "",
        }]
      });
    }
  }, [quoteRequest, existingOffer, form]);

  const watchedItems = form.watch("items");

  const totalUSD = watchedItems?.reduce((sum, it) => sum + (it.prices_manual?.USD || 0) * (it.quantity || 1), 0) || 0;
  const totalVES = watchedItems?.reduce((sum, it) => sum + (it.prices_manual?.VES || 0) * (it.quantity || 1), 0) || 0;
  const totalEUR = watchedItems?.reduce((sum, it) => sum + (it.prices_manual?.EUR || 0) * (it.quantity || 1), 0) || 0;

  const handleSetAvailabilityStatus = (index: number, status: "available" | "substitute") => {
    const item = form.getValues(`items.${index}`);
    if (status === "available") {
      update(index, {
        ...item,
        availabilityStatus: "available",
        is_substituted: false,
        substituted_inventory_id: undefined,
        substitution_reason: undefined,
        custom_product_name: item.originalName,
      });
    } else {
      update(index, {
        ...item,
        availabilityStatus: "substitute",
        is_substituted: true,
        substitution_reason: item.substitution_reason || "Sin stock de marca original, se ofrece alternativa",
      });
    }
  };

  const handleAddAdHocItem = () => {
    append({
      tempId: `adhoc-${Date.now()}`,
      originalName: "Producto Libre / Ad-Hoc",
      custom_product_name: "",
      availabilityStatus: "available",
      is_substituted: false,
      sell_format: "package",
      quantity: 1,
      prices_manual: { USD: 0, VES: 0, EUR: 0 },
      notes: "",
    } as QuoterItemFormValues);
  };

  const handleAddUpsellToOffer = (suggestion: UpsellRuleSuggestion) => {
    append({
      tempId: `upsell-${Date.now()}`,
      pharmacy_inventory_id: suggestion.recommended_inventory_id,
      originalName: suggestion.recommended_inventory?.medication?.name || "Producto OTC",
      custom_product_name: suggestion.recommended_inventory?.medication?.name || "Producto OTC Sugerido",
      availabilityStatus: "available",
      is_substituted: false,
      sell_format: "package",
      quantity: 1,
      prices_manual: suggestion.recommended_inventory?.prices_manual || { USD: 5, VES: 25, EUR: 4 },
      notes: `Sugerencia OTC: ${suggestion.recommendation_reason}`,
    } as QuoterItemFormValues);
  };

  const handleSelectSubstitute = (index: number, subItem: PharmacyInventoryItem, reason: string) => {
    const item = form.getValues(`items.${index}`);
    update(index, {
      ...item,
      availabilityStatus: "substitute",
      is_substituted: true,
      substituted_inventory_id: subItem.id,
      substitution_reason: reason,
      custom_product_name: subItem.medication?.name || subItem.active_ingredient || item.custom_product_name,
      prices_manual: {
        USD: subItem.prices_manual?.USD || item.prices_manual.USD,
        VES: subItem.prices_manual?.VES || item.prices_manual.VES,
        EUR: subItem.prices_manual?.EUR || item.prices_manual.EUR,
      },
      notes: item.notes || `Sustituto de inventario: ${reason}`,
    });
  };

  const onSubmit = async (data: QuoterFormValues) => {
    const payload = {
      total_price_base: totalUSD,
      currency: "USD",
      comments: data.comments,
      items: data.items.map((item) => ({
        prescription_item_id: item.prescription_item_id,
        pharmacy_inventory_id: item.pharmacy_inventory_id,
        custom_product_name: item.custom_product_name,
        is_substituted: item.is_substituted,
        substituted_inventory_id: item.substituted_inventory_id,
        substitution_reason: item.substitution_reason,
        sell_format: item.sell_format,
        quantity: item.quantity,
        prices_manual: item.prices_manual,
        notes: item.notes,
      })),
    };

    if (existingOffer) {
      await updateOfferMutation.mutateAsync({
        requestId: quoteRequest.id,
        offerId: existingOffer.id,
        payload,
      });
    } else {
      await createOfferMutation.mutateAsync({
        requestId: quoteRequest.id,
        payload,
      });
    }

    onClose();
  };

  return {
    form,
    items,
    watchedItems,
    append,
    remove,
    update,
    totals: { USD: totalUSD, VES: totalVES, EUR: totalEUR },
    handlers: {
      handleSetAvailabilityStatus,
      handleAddAdHocItem,
      handleAddUpsellToOffer,
      handleSelectSubstitute,
    },
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: createOfferMutation.isPending || updateOfferMutation.isPending,
  };
}
