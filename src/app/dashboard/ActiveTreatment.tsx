"use client";
import { motion } from "motion/react";
import { fadeUpVariant } from "@/app/lib/animations";
import { AiFillMedicineBox } from "react-icons/ai";

export default function ActiveTreatment() {
  return (
    <motion.div
      className="w-[50%] flex flex-col justify-start mb-12"
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="flex justify-between">
        <h3 className="text-2xl font-bold text-slate-900">
          Tratamiento Activo
        </h3>
        <button className=" text-orange-400 font-semibold px-4 py-2 rounded-xl">
          Ver historial completo
        </button>
      </div>
      <div className="flex flex-row w-full gap-6">
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col">
          <div className="flex items-center justify-between  w-full">
            <div className="p-3 bg-orange-200 rounded-xl mb-4">
              <AiFillMedicineBox className="w-6 h-6 text-teal-600" />
            </div>
            <div className="bg-emerald-50 text-emerald-600 font-semibold px-3 py-1 rounded-full text-sm">
              Activo
            </div>
          </div>

          <div className="flex flex-col w-full justify-start mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              AMOXICILINA 500MG
            </h3>
            <p className="text-slate-600 mb-1">1 cápsula cada 8 horas</p>
            <p className="text-slate-500 text-sm font-medium">
              DURACIÓN: 7 DÍAS
            </p>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-auto">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Siguiente toma:{" "}
              </p>
              <p className="text-sm font-bold text-slate-900">12/12/2022</p>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col">
          <div className="flex items-center justify-between mb-6 w-full">
            <div className="p-3 bg-orange-200 rounded-xl mb-4">
              <AiFillMedicineBox className="w-6 h-6 text-teal-600" />
            </div>
            <div className="bg-emerald-50 text-emerald-600 font-semibold px-3 py-1 rounded-full text-sm">
              Activo
            </div>
          </div>

          <div className="flex flex-col w-full justify-start mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              AMOXICILINA 500MG
            </h3>
            <p className="text-slate-600 mb-1">1 cápsula cada 8 horas</p>
            <p className="text-slate-500 text-sm font-medium">
              DURACIÓN: 7 DÍAS
            </p>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-auto">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Siguiente toma:{" "}
              </p>
              <p className="text-sm font-bold text-slate-900">12/12/2022</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
