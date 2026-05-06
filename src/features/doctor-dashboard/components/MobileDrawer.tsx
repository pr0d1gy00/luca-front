"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { X } from "lucide-react";

interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function MobileDrawer({
  open,
  onOpenChange,
  children,
}: MobileDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        showCloseButton={false}
        /* w-64 = 256px, exactamente igual que el sidebar expandido */
        className="w-64 p-0 border-r-0 bg-luca-surface shadow-xl"
      >
        <SheetTitle className="sr-only">Menú de navegación</SheetTitle>

        <SheetClose asChild>
          <button
            className="absolute top-5 right-4 z-50 size-9 rounded-full flex items-center justify-center hover:bg-luca-surface-dark/50 transition-colors duration-200"
            aria-label="Cerrar menú"
          >
            <X className="size-5 text-luca-muted-dark" />
          </button>
        </SheetClose>

        <div className="h-full overflow-y-auto">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
