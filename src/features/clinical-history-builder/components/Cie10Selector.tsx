"use client";

import { useState, useCallback } from "react";
import { Search, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Cie10SelectorBlock } from "../../types";

// ─── Simulated CIE-10 dataset ──────────────────────────────
const CIE10_DATASET: Cie10Entry[] = [
  { code: "A00", description: "Cólera" },
  { code: "A01", description: "Fiebres tifoidea y paratifoidea" },
  {
    code: "A09",
    description: "Diarrea y gastroenteritis de origen infeccioso",
  },
  { code: "B00", description: "Infecciones herpéticas [herpes simple]" },
  { code: "B01", description: "Varicela [viruela loca]" },
  { code: "B02", description: "Herpes zóster" },
  { code: "B05", description: "Sarampión" },
  { code: "B06", description: "Rubeola" },
  { code: "B15", description: "Hepatitis aguda tipo A" },
  { code: "B16", description: "Hepatitis aguda tipo B" },
  { code: "B20", description: "Enfermedad por VIH/SIDA" },
  { code: "E10", description: "Diabetes mellitus tipo 1" },
  { code: "E11", description: "Diabetes mellitus tipo 2" },
  { code: "E14", description: "Diabetes mellitus, no especificada" },
  {
    code: "F10",
    description:
      "Trastornos mentales y de comportamiento debido al uso de alcohol",
  },
  { code: "F20", description: "Esquizofrenia" },
  { code: "F32", description: "Episodio depresivo" },
  { code: "F41", description: "Trastornos de ansiedad" },
  { code: "G40", description: "Epilepsia y crisis epilépticas recurrentes" },
  { code: "G43", description: "Migraña" },
  { code: "H10", description: "Conjuntivitis" },
  { code: "H25", description: "Catarata" },
  { code: "H66", description: "Otitis media supurativa" },
  { code: "I10", description: "Hipertensión esencial (primaria)" },
  { code: "I11", description: "Enfermedad cardíaca hipertensiva" },
  { code: "I20", description: "Angina de pecho" },
  { code: "I21", description: "Infarto agudo de miocardio" },
  { code: "I25", description: "Enfermedad isquémica crónica del corazón" },
  { code: "I50", description: "Insuficiencia cardíaca" },
  { code: "J00", description: "Nasofaringitis aguda [resfriado común]" },
  { code: "J02", description: "Faringitis aguda" },
  { code: "J03", description: "Amigdalitis aguda" },
  {
    code: "J06",
    description: "Infecciones agudas de las vías aéreas superiores múltiples",
  },
  { code: "J18", description: "Neumonía" },
  { code: "J44", description: "Enfermedad pulmonar obstructiva crónica" },
  { code: "J45", description: "Asma" },
  { code: "K25", description: "Úlcera gástrica" },
  { code: "K26", description: "Úlcera duodenal" },
  { code: "K29", description: "Gastritis y duodenitis" },
  { code: "K35", description: "Apendicitis aguda" },
  { code: "K50", description: "Enfermedad de Crohn" },
  { code: "K51", description: "Colitis ulcerosa" },
  { code: "K70", description: "Enfermedad hepática alcohólica" },
  { code: "K76", description: "Otras enfermedades del hígado" },
  { code: "L20", description: "Dermatitis atópica" },
  { code: "L30", description: "Dermatitis de contacto" },
  { code: "L40", description: "Psoriasis" },
  { code: "L50", description: "Urticaria" },
  { code: "M05", description: "Artritis reumatoide seropositiva" },
  { code: "M10", description: "Gota" },
  { code: "M15", description: "Poliartrosis" },
  { code: "M16", description: "Coxartrosis [artrosis de cadera]" },
  { code: "M17", description: "Gonartrosis [artrosis de rodilla]" },
  { code: "M54", description: "Dorsalgia" },
  { code: "M79", description: "Otros trastornos de los tejidos blandos" },
  { code: "N10", description: "Pielonefritis aguda" },
  { code: "N17", description: "Insuficiencia renal aguda" },
  { code: "N18", description: "Enfermedad renal crónica" },
  { code: "N20", description: "Cálculo del riñón y del uréter" },
  { code: "N39", description: "Otros trastornos del sistema urinario" },
  { code: "O03", description: "Aborto espontáneo" },
  {
    code: "O10",
    description: "Hipertensión preexistente complicando el embarazo",
  },
  { code: "O14", description: "Preeclampsia" },
  { code: "O24", description: "Diabetes mellitus en el embarazo" },
  { code: "O80", description: "Parto único espontáneo" },
  { code: "R05", description: "Tos" },
  { code: "R06", description: "Alteraciones de la respiración" },
  { code: "R07", description: "Dolor de garganta y en el pecho" },
  { code: "R10", description: "Dolor abdominal y pélvico" },
  { code: "R50", description: "Fiebre de origen desconocido" },
  { code: "R51", description: "Cefalea" },
  { code: "R53", description: "Malestar y fatiga" },
  { code: "S00", description: "Traumatismo superficial de la cabeza" },
  { code: "S22", description: "Fractura de costilla(s) y esternón" },
  { code: "S42", description: "Fractura a nivel del hombro y del brazo" },
  { code: "S72", description: "Fractura del fémur" },
  { code: "T78", description: "Reacciones adversas a alimentos" },
  {
    code: "Z00",
    description: "Examen e investigación normal de pacientes sin diagnóstico",
  },
  {
    code: "Z23",
    description: "Necesidad de inmunización contra enfermedades infecciosas",
  },
  { code: "Z34", description: "Supervisión de embarazo normal" },
  { code: "Z38", description: "Recén nacido vivo según lugar de nacimiento" },
  {
    code: "Z70",
    description: "Asesoramiento relacionados con la salud sexual",
  },
  {
    code: "Z76",
    description:
      "Personas en contacto con los servicios de salud en otras circunstancias",
  },
];

type Cie10Entry = { code: string; description: string };

function searchCie10(query: string, limit = 10): Cie10Entry[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return CIE10_DATASET.filter(
    (e) =>
      e.code.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q),
  ).slice(0, limit);
}

// ─── COMPONENT ──────────────────────────────────────────────
interface Cie10SelectorProps {
  element: Cie10SelectorBlock;
  value?: string;
  onChange: (v: string) => void;
}

export function Cie10Selector({
  element,
  value,
  onChange,
}: Cie10SelectorProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Cie10Entry[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const selectedEntry = CIE10_DATASET.find((e) => e.code === value);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    setResults(searchCie10(q));
    setFocusedIndex(-1);
  }, []);

  function handleSelect(entry: Cie10Entry) {
    onChange(entry.code);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  }

  function handleClear() {
    onChange("");
    setIsOpen(false);
    setQuery("");
    setResults([]);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen && results.length > 0) {
      setIsOpen(true);
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((i) => Math.min(i + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && results[focusedIndex]) {
          handleSelect(results[focusedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  }

  return (
    <div className="relative">
      {/* Selected display */}
      {selectedEntry && !isOpen ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                {selectedEntry.code}
              </span>
              <span className="text-sm text-blue-700 truncate">
                {selectedEntry.description}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded hover:bg-blue-100 text-blue-700 transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Search input */
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => query && setResults(searchCie10(query))}
            onKeyDown={handleKeyDown}
            placeholder={
              element.placeholder ?? "Buscar código o descripción CIE-10..."
            }
            className={cn(
              "w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-sm text-slate-900",
              "placeholder-slate-400 focus:outline-none focus:ring-2",
              "focus:ring-blue-700/20 focus:border-blue-700 transition-shadow",
            )}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                setIsOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <ul
          className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-100
                     shadow-lg max-h-64 overflow-y-auto py-1"
        >
          {results.map((entry, idx) => (
            <li key={entry.code}>
              <button
                type="button"
                onClick={() => handleSelect(entry)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                  focusedIndex === idx
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-slate-50 text-slate-700",
                )}
              >
                <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded min-w-[2.5rem] text-center flex-shrink-0">
                  {entry.code}
                </span>
                <span className="text-sm flex-1">{entry.description}</span>
                {value === entry.code && (
                  <Check className="w-4 h-4 text-blue-700 flex-shrink-0" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* No results */}
      {isOpen && query && results.length === 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-100 shadow-lg px-4 py-6 text-center">
          <p className="text-sm text-slate-500">
            Sin resultados para &quot;{query}&quot;
          </p>
          {element.allowFreeText && (
            <button
              type="button"
              onClick={() => {
                onChange(query);
                setIsOpen(false);
                setResults([]);
              }}
              className="mt-2 text-xs text-blue-700 hover:text-blue-800 underline"
            >
              Usar como texto libre
            </button>
          )}
        </div>
      )}

      {/* Free text hint */}
      {!isOpen && !selectedEntry && element.allowFreeText && (
        <p className="text-xs text-slate-400 mt-1">
          Sin coincidencia exacta. Presiona Enter para usar texto libre.
        </p>
      )}
    </div>
  );
}
