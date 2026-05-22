"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { DiseaseSeverity } from "@/lib/types";

const SEVERITY_OPTIONS: { value: DiseaseSeverity | ""; label: string }[] = [
  { value: "", label: "Todos os níveis" },
  { value: "critical", label: "🔴 Crítico" },
  { value: "high", label: "🟠 Alto" },
  { value: "medium", label: "🟡 Médio" },
  { value: "low", label: "⚪ Baixo" },
];

interface OutbreakFilterProps {
  /** Lista de países disponíveis nos dados (para popular o select) */
  countries: string[];
}

export default function OutbreakFilter({ countries }: OutbreakFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCountry = searchParams.get("country") ?? "";
  const currentSeverity = searchParams.get("severity") ?? "";

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const activeCount = [currentCountry, currentSeverity].filter(Boolean).length;

  return (
    <div className="rounded-xs p-5 border border-zinc-300 dark:border-zinc-700 bg-background md:block">
      <h3 className="text-sm font-semibold dark:text-zinc-300 text-zinc-900 mb-4 flex items-center gap-2">
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
          />
        </svg>
        Filtros
        {activeCount > 0 && (
          <span className="ml-auto text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
            {activeCount}
          </span>
        )}
      </h3>

      <div className="space-y-4">
        {/* Filtro por País */}
        <div>
          <label
            htmlFor="filter-country"
            className="block text-xs text-muted-foreground mb-1.5"
          >
            País
          </label>
          <select
            id="filter-country"
            value={currentCountry}
            onChange={(e) => updateFilter("country", e.target.value)}
            className="w-full rounded-xs border border-zinc-300 dark:border-zinc-700 bg-background text-foreground text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Todos os países</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Severity */}
        <div>
          <label
            htmlFor="filter-severity"
            className="block text-xs text-muted-foreground mb-1.5"
          >
            Nível de Severidade
          </label>
          <select
            id="filter-severity"
            value={currentSeverity}
            onChange={(e) => updateFilter("severity", e.target.value)}
            className="w-full rounded-xs border border-zinc-300 dark:border-zinc-700 bg-background text-foreground text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {SEVERITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Botão limpar */}
        {activeCount > 0 && (
          <button
            onClick={() => router.push("?", { scroll: false })}
            className="w-full text-xs text-muted-foreground hover:text-foreground border border-zinc-300 dark:border-zinc-700 rounded-xs py-2 transition-colors"
          >
            Limpar filtros
          </button>
        )}
      </div>

      <p className="text-zinc-500 text-xs mt-5 text-center">
        Fonte: ReliefWeb / WHO
      </p>
    </div>
  );
}
