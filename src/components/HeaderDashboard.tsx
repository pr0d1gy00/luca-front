import { fadeUpVariant } from "@/app/lib/animations";
import { CalendarIcon } from "lucide-react";
import { motion } from "motion/react";

export default function HeaderDashboard({ user }: { user: string }) {
  return (
    <motion.div
      className="flex justify-between items-center w-full"
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div>
        <h2 className="text-5xl font-bold tracking-tight text-luca-primary">
          Hola, {user}
        </h2>
        <p className="text-xl text-luca-muted font-semibold tracking-tight">
          ¿En qué puedo ayudarte hoy?
        </p>
      </div>
      <button className="rounded-[5rem] bg-luca-primary h-16 py-4 px-8 w-[18rem] flex items-center shadow-md hover:scale-105 transition-all duration-300">
        <CalendarIcon className="text-white w-8 h-8" />
        <p className="text-white font-bold text-lg ml-4">Citas</p>
      </button>
    </motion.div>
  );
}
