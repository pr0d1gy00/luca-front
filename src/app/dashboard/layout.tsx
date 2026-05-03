"use client";
import Sidebar from "@/components/Sidebar";
import { motion } from "motion/react";
import { fadeUpVariant } from "@/app/lib/animations";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-linear-to-br from-luca-gradient-start via-luca-gradient-mid to-luca-gradient-end">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        <motion.div
          className="w-[95%] lg:w-full h-24 bg-white self-center flex items-center justify-end px-8"
          variants={fadeUpVariant}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <p className="text-2xl font-semibold text-luca-primary">Perfil</p>
        </motion.div>
        <div className="py-8 lg:py-12 flex-1">{children}</div>
      </main>
    </div>
  );
}
