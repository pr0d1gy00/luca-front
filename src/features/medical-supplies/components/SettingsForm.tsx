import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  medicalSupplySettingsSchema,
  MedicalSupplySettingsFormValues,
} from "../schemas";
import { useGetSettings, useUpdateSettings } from "../hooks";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function SettingsForm() {
  const { data: settings, isLoading } = useGetSettings();
  const updateSettingsMutation = useUpdateSettings();

  const form = useForm<MedicalSupplySettingsFormValues>({
    resolver: zodResolver(medicalSupplySettingsSchema),
    defaultValues: {
      is_24_hours: false,
      working_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opening_time: "08:00",
      closing_time: "18:00",
      auto_matching_enabled: false,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        is_24_hours: settings.is_24_hours,
        working_days: settings.working_days,
        opening_time: settings.opening_time || "08:00",
        closing_time: settings.closing_time || "18:00",
        auto_matching_enabled: settings.auto_matching_enabled,
      });
    }
  }, [settings, form]);

  function onSubmit(values: MedicalSupplySettingsFormValues) {
    updateSettingsMutation.mutate(values);
  }

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <Card className="border-slate-100 shadow-sm rounded-xl">
      <CardHeader>
        <CardTitle className="text-slate-900">
          Medical Supplies Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="is_24_hours"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-100 p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base text-slate-900">
                      24/7 Operations
                    </FormLabel>
                    <FormDescription>
                      Enable if your pharmacy or supply center operates 24 hours
                      a day.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {!form.watch("is_24_hours") && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="opening_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opening Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="closing_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Closing Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="auto_matching_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-100 p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base text-slate-900">
                      Auto-matching
                    </FormLabel>
                    <FormDescription>
                      Automatically match quote requests against available
                      inventory.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={updateSettingsMutation.isPending}
              className="bg-teal-600 text-white hover:bg-teal-700 w-full md:w-auto"
            >
              {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
