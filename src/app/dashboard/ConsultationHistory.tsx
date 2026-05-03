"use client";

import { motion } from "motion/react";
import { BriefcaseMedical } from "lucide-react";
import { fadeUpVariant } from "../lib/animations";

// Mock data to demonstrate the dynamic layout
const mockConsultations = [
  {
    id: 1,
    date: "Oct. 12, 2024",
    time: "14:30 - 15:00",
    type: "Consulta General",
    reason: "Resfriado común",
    diagnosis: "Gripe común",
  },
  {
    id: 2,
    date: "Oct. 15, 2024",
    time: "09:00 - 09:30",
    type: "Revisión General",
    reason: "Dolor de cabeza",
    diagnosis: "Migraña",
  },
  {
    id: 3,
    date: "Nov. 02, 2024",
    time: "11:15 - 11:45",
    type: "Dermatología",
    reason: "Alergia cutánea",
    diagnosis: "Dermatitis por contacto",
  },
];

export default function ConsultationHistory() {
  return (
    <motion.div
      className="w-full h-full"
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <h2 className="text-2xl text-luca-primary-hover font-bold">
        Historial de consultas
      </h2>

      <div className="relative mt-12 w-full max-w-5xl flex flex-col gap-12">
        {mockConsultations.map((consultation, index) => {
          const isEven = index % 2 === 0;

          return (
            <div
              key={consultation.id}
              className={`flex items-stretch w-full ${
                !isEven ? "flex-row-reverse" : ""
              }`}
            >
              {" "}
              <div
                className={`flex-1 flex flex-col justify-center ${
                  isEven ? "items-end pr-8" : "items-start pl-8"
                }`}
              >
                <h3 className="text-xl font-bold text-orange-400">
                  {consultation.date}
                </h3>
                <p className="text-lg font-semibold text-gray-500">
                  {consultation.time}
                </p>
              </div>
              <div className="w-16 shrink-0 relative flex flex-col items-center justify-center">
                <div
                  className={`absolute w-1 bg-green-950/20 z-0 
                    ${index === 0 ? "top-1/2" : "top-0"} 
                    ${
                      index === mockConsultations.length - 1
                        ? "bottom-1/2"
                        : "-bottom-12"
                    }
                  `}
                ></div>

                <div className="h-12 w-12 bg-green-950 rounded-full z-10 flex items-center justify-center relative shadow-sm">
                  <div className="h-6 w-6 bg-white rounded-full"></div>
                </div>
              </div>
              <div
                className={`flex-1 flex ${
                  isEven ? "justify-start pl-8" : "justify-end pr-8"
                }`}
              >
                <div className="w-full max-w-md text-sm bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-luca-primary-hover rounded-full p-3">
                      <BriefcaseMedical className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl text-green-950 font-bold">
                      {consultation.type}
                    </h3>
                  </div>

                  <div className="flex flex-col w-full justify-start gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-bold text-slate-800">
                        Motivo:
                      </p>
                      <p className="text-base text-slate-600">
                        {consultation.reason}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-bold text-slate-800">
                        Diagnóstico:
                      </p>
                      <p className="text-base text-slate-600">
                        {consultation.diagnosis}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
