"use client";

import { motion } from "motion/react";
import { staggerChildrenVariant } from "@/app/lib/animations";
import { ClinicGreeting } from "./ClinicGreeting";
import { ClinicKpiCards } from "./ClinicKpiCards";
import { TodayAgenda } from "./TodayAgenda";
import { DoctorsList } from "./DoctorsList";
import { ClinicQuickActions } from "./ClinicQuickActions";

export function ClinicDashboard() {
  return (
    <motion.div
      variants={staggerChildrenVariant}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <motion.div variants={staggerChildrenVariant}>
        <ClinicGreeting />
      </motion.div>

      <motion.div variants={staggerChildrenVariant}>
        <ClinicKpiCards />
      </motion.div>

      <motion.div
        variants={staggerChildrenVariant}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <TodayAgenda />
        <DoctorsList />
      </motion.div>

      <motion.div variants={staggerChildrenVariant}>
        <ClinicQuickActions />
      </motion.div>
    </motion.div>
  );
}
