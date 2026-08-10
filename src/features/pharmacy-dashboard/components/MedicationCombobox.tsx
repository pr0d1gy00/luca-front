"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useDebounce } from "@/features/public/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMedications } from "@/features/medications/hooks/useMedications";
import type { Medication } from "@/features/medications/schemas";

interface MedicationComboboxProps {
  value: string; // The custom active principle text or selected medication name
  onSelect: (medication: Medication | null, customText: string) => void;
  placeholder?: string;
  className?: string;
}

export function MedicationCombobox({
  value,
  onSelect,
  placeholder = "Buscar o escribir...",
  className,
}: MedicationComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data, isLoading } = useMedications(debouncedSearch, 1);
  const medications = data?.data || [];

  // When value is completely cleared externally
  React.useEffect(() => {
    if (!value) {
      setSearchTerm("");
    }
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal hover:bg-slate-50 text-left truncate overflow-hidden border-slate-200",
            !value && "text-slate-400",
            className
          )}
        >
          <span className="truncate flex-1">{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar medicamento..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {isLoading && (
              <div className="p-4 flex items-center justify-center text-slate-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Buscando...
              </div>
            )}
            {!isLoading && medications.length === 0 && (
              <CommandEmpty className="p-2">
                <div className="text-sm text-slate-500 text-center py-2">
                  No se encontró en el catálogo.
                </div>
                {searchTerm && (
                  <Button
                    variant="ghost"
                    className="w-full text-pharmako-primary justify-start font-medium text-sm mt-1 h-8 px-2"
                    onClick={() => {
                      onSelect(null, searchTerm);
                      setOpen(false);
                    }}
                  >
                    Usar "{searchTerm}"
                  </Button>
                )}
              </CommandEmpty>
            )}
            {!isLoading && medications.length > 0 && (
              <CommandGroup>
                {medications.map((med: any) => (
                  <CommandItem
                    key={med.uuid}
                    value={med.uuid}
                    onSelect={() => {
                      onSelect(med, med.active_principle || med.activePrinciple);
                      setOpen(false);
                    }}
                    className="flex flex-col items-start py-2 px-3 cursor-pointer"
                  >
                    <span className="font-medium text-slate-900 leading-tight">
                      {med.active_principle || med.activePrinciple} {med.concentration ? `- ${med.concentration}` : ''}
                    </span>
                    {(med.commercial_name || med.commercialName || med.laboratory) && (
                      <span className="text-xs text-slate-500 mt-1 leading-tight">
                        {med.commercial_name || med.commercialName} {med.laboratory ? `(${med.laboratory})` : ''}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {!isLoading && medications.length > 0 && searchTerm && (
              <div className="p-1 border-t border-slate-100 mt-1">
                <Button
                  variant="ghost"
                  className="w-full text-pharmako-primary justify-start font-medium text-sm h-8 px-2"
                  onClick={() => {
                    onSelect(null, searchTerm);
                    setOpen(false);
                  }}
                >
                  Usar "{searchTerm}"
                </Button>
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
