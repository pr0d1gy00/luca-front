"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inventoryItemSchema, InventoryItemFormValues } from "../schemas";
import { useAddInventoryItem } from "../hooks";

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
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export function InventoryItemForm() {
  const [open, setOpen] = useState(false);
  const addInventoryMutation = useAddInventoryItem();

  const form = useForm<InventoryItemFormValues>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      item_name: "",
      sku: "",
      price_usd: 0,
      price_bs: 0,
      stock: 0,
      is_active: true,
    },
  });

  function onSubmit(values: InventoryItemFormValues) {
    addInventoryMutation.mutate(values, {
      onSuccess: () => {
        form.reset();
        setOpen(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-teal-600 text-white hover:bg-teal-700">
          Add New Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-slate-900">
            Add Inventory Item
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Create a new medical supply item in your inventory.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="item_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Paracetamol 500mg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. PAR-500" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price_usd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (USD)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
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
              <FormField
                control={form.control}
                name="price_bs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (BS)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
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
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
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
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-100 p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base text-slate-900">
                      Active
                    </FormLabel>
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
              disabled={addInventoryMutation.isPending}
              className="w-full bg-teal-600 text-white hover:bg-teal-700"
            >
              {addInventoryMutation.isPending ? "Saving..." : "Save Item"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
