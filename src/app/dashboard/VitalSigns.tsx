import { Heart, Thermometer, Waves } from "lucide-react";
import { motion } from "motion/react";
import { fadeUpVariant } from "../lib/animations";

// Mock data
const mockVitalSigns = [
  {
    id: 1,
    name: "Presión Arterial",
    value: "120/80",
    unit: "mmHg",
    time: "10:30 AM",
    status: "stable",
    icon: <Heart className="w-5 h-5" />,
  },
  {
    id: 2,
    name: "Frecuencia Cardíaca",
    value: "72",
    unit: "bpm",
    time: "10:30 AM",
    status: "stable",
    icon: <Heart className="w-5 h-5" />,
  },
  {
    id: 3,
    name: "Temperatura",
    value: "38.5",
    unit: "°C",
    time: "10:30 AM",
    status: "alert",
    icon: <Thermometer className="w-5 h-5" />,
  },
  {
    id: 4,
    name: "Saturación de Oxígeno",
    value: "98",
    unit: "%",
    time: "10:30 AM",
    status: "stable",
    icon: <Waves className="w-5 h-5" />,
  },
];

export default function VitalSigns() {
  return (
    <motion.div
      className="flex justify-center"
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="relative w-full flex flex-col gap-6">
        <h3 className="text-2xl font-bold text-slate-900">Signos Vitales</h3>

        <div className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-0.5 bg-gray-300 z-0"></div>

        <div className="flex justify-between">
          <div className="w-[45%] flex flex-col gap-6">
            {mockVitalSigns.slice(0, 2).map((item) => (
              <motion.div
                key={item.id}
                className="relative bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all z-10"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${item.status === "stable" ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"}`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-slate-900">
                      {item.name}
                    </h3>
                    <p className="text-sm font-medium text-slate-600">
                      {item.time}
                    </p>
                  </div>
                  {item.status === "stable" ? (
                    <span className="ml-auto text-sm font-bold text-emerald-600">
                      Normal
                    </span>
                  ) : (
                    <span className="ml-auto text-sm font-bold text-orange-600">
                      Alerta
                    </span>
                  )}
                </div>
                <div className="flex items-baseline mt-4">
                  <span className="text-3xl font-bold text-slate-900">
                    {item.value}
                  </span>
                  <span className="ml-2 text-xl text-slate-500">
                    {item.unit}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="w-[45%] flex flex-col gap-6">
            {mockVitalSigns.slice(2).map((item) => (
              <motion.div
                key={item.id}
                className="relative bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all z-10"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${item.status === "stable" ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"}`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-slate-900">
                      {item.name}
                    </h3>
                    <p className="text-sm font-medium text-slate-600">
                      {item.time}
                    </p>
                  </div>
                  {item.status === "stable" ? (
                    <span className="ml-auto text-sm font-bold text-emerald-600">
                      Normal
                    </span>
                  ) : (
                    <span className="ml-auto text-sm font-bold text-orange-600">
                      Alerta
                    </span>
                  )}
                </div>
                <div className="flex items-baseline mt-4">
                  <span className="text-3xl font-bold text-slate-900">
                    {item.value}
                  </span>
                  <span className="ml-2 text-xl text-slate-500">
                    {item.unit}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
