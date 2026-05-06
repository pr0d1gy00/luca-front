"use client";

import { SearchIcon } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_RESULTS = [
  {
    id: "1",
    category: "patient" as const,
    label: "Carlos Rodríguez",
    description: "DNI 35.234.567",
  },
  {
    id: "2",
    category: "medication" as const,
    label: "Paracetamol 500mg",
    description: "Receta #1234",
  },
  {
    id: "3",
    category: "appointment" as const,
    label: "Consulta cardiología",
    description: "Mañana 10:00",
  },
  {
    id: "4",
    category: "setting" as const,
    label: "Notificaciones",
    description: "Configurar alertas",
  },
];

type SearchResult = (typeof MOCK_RESULTS)[number];

const CATEGORY_LABELS: Record<SearchResult["category"], string> = {
  patient: "Pacientes",
  medication: "Medicamentos",
  appointment: "Citas",
  setting: "Configuración",
};

// Group results by category, preserving insertion order
function groupByCategory(results: readonly SearchResult[]) {
  const map = new Map<SearchResult["category"], SearchResult[]>();
  for (const r of results) {
    const existing = map.get(r.category);
    if (existing) {
      existing.push(r);
    } else {
      map.set(r.category, [r]);
    }
  }
  return map;
}

const groupedResults = groupByCategory(MOCK_RESULTS);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SearchCommandProps {
  /** Controlled mode: external open state (for SmartHeader → MobileHeader wiring) */
  open?: boolean;
  /** Controlled mode: external open-change handler */
  onOpenChange?: (open: boolean) => void;
}

export function SearchCommand({
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: SearchCommandProps = {}) {
  const { open: hookOpen, setOpen: hookSetOpen } = useKeyboardShortcut();
  const isControlled = openProp !== undefined && onOpenChangeProp !== undefined;

  const open = isControlled ? openProp : hookOpen;

  const handleOpenChange = (next: boolean) => {
    hookSetOpen(next);
    if (isControlled) {
      onOpenChangeProp(next);
    }
  };

  return (
    <>
      {/* Desktop trigger button */}
      <button
        onClick={() => handleOpenChange(true)}
        aria-label="Buscar (⌘K)"
        className={cn(
          "hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl",
          "bg-white border border-slate-200 text-sm text-luca-muted",
          "hover:border-slate-300 hover:text-slate-700 transition-colors",
          "focus-visible:ring-2 focus-visible:ring-luca-primary/20 focus-visible:outline-none",
          "min-w-[220px] h-10",
        )}
      >
        <SearchIcon className="size-4 shrink-0" />
        <span className="flex-1 text-left">Buscar...</span>
        <kbd
          className={cn(
            "text-[10px] font-medium tracking-widest text-slate-400",
            "bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200",
          )}
        >
          ⌘K
        </kbd>
      </button>

      {/* Command dialog */}
      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <Command>
          <CommandInput placeholder="Buscar pacientes, citas, recetas..." />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>
            {Array.from(groupedResults.entries()).map(([category, items]) => (
              <CommandGroup key={category} heading={CATEGORY_LABELS[category]}>
                {items.map((item) => (
                  <CommandItem key={item.id} value={item.label}>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-slate-800">
                        {item.label}
                      </span>
                      <span className="text-xs text-luca-muted">
                        {item.description}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
