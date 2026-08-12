import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema, type SettingsFormValues } from "../schemas/settings.schema";
import { usePharmacySettings } from "./usePharmacySettings";
import { toast } from "sonner";

export function usePharmacySettingsForm(onClose?: () => void) {
  const { settings, location, isLoading, updateSettings, isUpdating } = usePharmacySettings();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      auto_quoting_enabled: false,
      allow_partial_quotes: true,
      is_24_hours: false,
      delivery_radius_km: 5,
      default_currency: "USD",
      custom_terms: "",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        auto_quoting_enabled: settings.auto_quoting_enabled || false,
        allow_partial_quotes: settings.allow_partial_quotes ?? true,
        is_24_hours: settings.is_24_hours || false,
        delivery_radius_km: Number(settings.delivery_radius_km) || 5,
        default_currency: (settings.default_currency as any) || "USD",
        custom_terms: settings.custom_terms || "",
      });
    }
  }, [settings, form]);

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      await updateSettings(data);
      if (onClose) {
        onClose();
      } else {
        toast.success("Configuración guardada exitosamente");
      }
    } catch (error: any) {
      const errorData = error?.response?.data;
      const errorMsg = errorData?.message || errorData?.detail || errorData?.error || "Ocurrió un error al guardar la configuración";
      toast.error(errorMsg);
    }
  };

  return {
    form,
    settingsLocation: location,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: isUpdating || isLoading,
  };
}
