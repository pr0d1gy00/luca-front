"use client";

import { motion } from "motion/react";
import { staggerChildrenVariant } from "@/app/lib/animations";
import { usePatientTreatments } from "../hooks/usePatientTreatments";
import { usePatientVitals } from "../hooks/usePatientVitals";
import { usePatientConsultations } from "../hooks/usePatientConsultations";
import { PatientGreeting } from "./PatientGreeting";
import { PatientKpiCards } from "./PatientKpiCards";
import { NextAppointmentCard } from "./NextAppointmentCard";
import { PatientQuickActions } from "./PatientQuickActions";
import { ActiveTreatment } from "./ActiveTreatment";
import { VitalSigns } from "./VitalSigns";
import { ConsultationHistory } from "./ConsultationHistory";

export function PatientDashboard() {
  const treatments = usePatientTreatments();
  const vitals = usePatientVitals();
  const consultations = usePatientConsultations();

  return (
    <motion.div
      variants={staggerChildrenVariant}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Greeting */}
      <motion.div variants={staggerChildrenVariant}>
        <PatientGreeting />
      </motion.div>

      {/* KPIs */}
      <motion.div variants={staggerChildrenVariant}>
        <PatientKpiCards />
      </motion.div>

      {/* Next Appointment + Quick Actions */}
      <motion.div
        variants={staggerChildrenVariant}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2">
          <NextAppointmentCard />
        </div>
        <div className="lg:col-span-1">
          <PatientQuickActions />
        </div>
      </motion.div>

      {/* Treatments + Vitals */}
      <motion.div
        variants={staggerChildrenVariant}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <ActiveTreatment treatments={treatments} />
        <VitalSigns vitals={vitals} />
      </motion.div>

      {/* Consultation History */}
      <motion.div variants={staggerChildrenVariant}>
        <ConsultationHistory consultations={consultations} />
      </motion.div>
    </motion.div>
  );
}
