import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quotePayloadSchema, QuotePayloadFormValues } from "../schemas";
import { useSubmitQuote, useGetInventory } from "../hooks";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export function QuoteForm({ orderId }: { orderId: number }) {
  const submitQuoteMutation = useSubmitQuote();
  const { data: inventory } = useGetInventory();

  const form = useForm<QuotePayloadFormValues>({
    resolver: zodResolver(quotePayloadSchema),
    defaultValues: {
      medical_supply_order_id: orderId,
      total_price: 0,
      currency: "USD",
      items_detail: [{ item: "", qty: 1, price_usd: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items_detail",
  });

  const watchItems = form.watch("items_detail");
  const totalPrice = watchItems.reduce(
    (acc, item) => acc + (item.qty || 0) * (item.price_usd || 0),
    0,
  );

  // Update total price automatically
  if (form.watch("total_price") !== totalPrice) {
    form.setValue("total_price", totalPrice);
  }

  function onSubmit(values: QuotePayloadFormValues) {
    submitQuoteMutation.mutate(values, {
      onSuccess: () => {
        form.reset();
        // Here you might trigger a close modal or redirect
      },
    });
  }

  return (
    <Card className="border-slate-100 shadow-sm rounded-xl">
      <CardHeader>
        <CardTitle className="text-slate-900">Create Quote</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex gap-4 items-end border p-4 rounded-lg bg-slate-50 border-slate-100"
                >
                  <div className="flex-1 space-y-4">
                    <FormField
                      control={form.control}
                      name={`items_detail.${index}.item`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Item Name (or select from inventory)
                          </FormLabel>
                          <div className="flex gap-2">
                            {/* Inventory Select */}
                            <Select
                              onValueChange={(val) => {
                                const invItem = inventory?.find(
                                  (i) => i.sku === val,
                                );
                                if (invItem) {
                                  field.onChange(invItem.item_name);
                                  form.setValue(
                                    `items_detail.${index}.price_usd`,
                                    invItem.price_usd,
                                  );
                                }
                              }}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="From inventory" />
                              </SelectTrigger>
                              <SelectContent>
                                {inventory
                                  ?.filter((i) => i.is_active)
                                  .map((invItem) => (
                                    <SelectItem
                                      key={invItem.sku}
                                      value={invItem.sku}
                                    >
                                      {invItem.item_name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <FormControl>
                              <Input
                                placeholder="Manual item name"
                                {...field}
                                className="flex-1"
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-4">
                      <FormField
                        control={form.control}
                        name={`items_detail.${index}.qty`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value, 10))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items_detail.${index}.price_usd`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Unit Price (USD)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min={0}
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseFloat(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:bg-red-50 hover:text-red-600 mb-2"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed"
              onClick={() => append({ item: "", qty: 1, price_usd: 0 })}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>

            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-100">
              <span className="font-medium text-slate-700">Total Price:</span>
              <span className="text-xl font-bold text-teal-600">
                ${totalPrice.toFixed(2)} USD
              </span>
            </div>

            <Button
              type="submit"
              disabled={submitQuoteMutation.isPending}
              className="w-full bg-teal-600 text-white hover:bg-teal-700"
            >
              {submitQuoteMutation.isPending
                ? "Submitting Quote..."
                : "Submit Quote"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
