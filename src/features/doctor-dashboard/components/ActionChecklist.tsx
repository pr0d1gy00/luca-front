"use client";

import { motion, AnimatePresence } from "motion/react";
import { staggerChildrenVariant } from "@/app/lib/animations";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Circle,
  FlaskConical,
  Phone,
  FileText,
  Calendar,
} from "lucide-react";
import type { ActionItem } from "../types";

interface ActionChecklistProps {
  actions: ActionItem[];
  onToggle: (id: string) => void;
}

const TYPE_ICONS = {
  lab: FlaskConical,
  call: Phone,
  prescription: FileText,
  "follow-up": Calendar,
};

const TYPE_COLORS = {
  lab: "text-pharmako-care",
  call: "text-amber-500",
  prescription: "text-emerald-500",
  "follow-up": "text-violet-500",
};

export function ActionChecklist({ actions, onToggle }: ActionChecklistProps) {
  const pendingItems = actions.filter((a) => !a.completed);
  const completedItems = actions.filter((a) => a.completed);

  if (actions.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-sm border border-slate-100/80 shadow-sm rounded-xl p-5">
        <p className="text-xs text-slate-400 text-center py-4">
          No hay acciones pendientes
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-slate-100/80 shadow-sm rounded-xl overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-800">
            Acciones Requeridas
          </h3>
          {pendingItems.length > 0 && (
            <span className="text-[11px] font-medium text-pharmako-care">
              {pendingItems.length} pendiente
              {pendingItems.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <motion.div
          variants={staggerChildrenVariant}
          initial="hidden"
          animate="visible"
          className="space-y-0.5"
        >
          {[...pendingItems, ...completedItems].map((action) => {
            const Icon = TYPE_ICONS[action.type];
            const colorClass = TYPE_COLORS[action.type];

            return (
              <motion.button
                key={action.id}
                onClick={() => onToggle(action.id)}
                className={cn(
                  "flex items-start gap-3 w-full text-left p-3 rounded-lg transition-all duration-200",
                  action.completed
                    ? "opacity-50 hover:opacity-70"
                    : "hover:bg-slate-50",
                )}
                whileTap={{ scale: 0.99 }}
              >
                {/* Checkbox */}
                <div className="mt-0.5 shrink-0">
                  {action.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("w-3.5 h-3.5", colorClass)} />
                    <span
                      className={cn(
                        "text-sm",
                        action.completed
                          ? "line-through text-slate-400"
                          : "text-slate-700 font-medium",
                      )}
                    >
                      {action.label}
                    </span>
                  </div>
                  {action.patientName !== "—" && (
                    <p className="text-xs text-slate-400 mt-0.5 ml-5.5">
                      {action.patientName}
                    </p>
                  )}
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
