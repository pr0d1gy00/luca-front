import { useAuthStore } from "@/store/auth";

export function usePatientGreeting() {
  const name = useAuthStore((s) => s.name);

  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(today);

  return {
    name: name || "Paciente",
    date: formattedDate,
  };
}
