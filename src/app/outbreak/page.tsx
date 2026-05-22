import { fetchOutbreaksFromReliefWeb } from "@/lib/reliefweb";
import { Suspense } from "react";
import OutbreakCard from "@/components/Outbreak/OutbreakCard";
import OutbreakFilter from "@/components/Outbreak/OutbreakFilter";
import type { DiseaseSeverity } from "@/lib/types";

// Dinâmico — depende de searchParams + dados externos
export const dynamic = "force-dynamic";

interface OutbreakPageProps {
  searchParams: Promise<{ country?: string; severity?: string }>;
}

export default async function OutbreakPage({ searchParams }: OutbreakPageProps) {
  const params = await searchParams;
  const filterCountry = params.country ?? "";
  const filterSeverity = (params.severity ?? "") as DiseaseSeverity | "";

  // Buscar todos os dados
  let allOutbreaks: Awaited<
    ReturnType<typeof fetchOutbreaksFromReliefWeb>
  >["outbreaks"] = [];
  let total = 0;

  try {
    const result = await fetchOutbreaksFromReliefWeb({ limit: 50 });
    allOutbreaks = result.outbreaks;
    total = result.total;
  } catch (err) {
    console.error("[Outbreak] Falha ao buscar dados:", err);
  }

  // Extrair lista de países únicos (para o filtro)
  const countries = [...new Set(allOutbreaks.map((o) => o.country))].sort();

  // Aplicar filtros
  let filtered = allOutbreaks;
  if (filterCountry) {
    filtered = filtered.filter((o) => o.country === filterCountry);
  }
  if (filterSeverity) {
    filtered = filtered.filter((o) => o.severity === filterSeverity);
  }

  const critical = filtered.filter((o) => o.severity === "critical");
  const high = filtered.filter((o) => o.severity === "high");
  const others = filtered.filter(
    (o) => o.severity !== "critical" && o.severity !== "high",
  );

  return (
    <div className="w-full px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif text-foreground">
            Monitor de Surtos — África
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mt-2">
            Surtos de doenças e emergências de saúde pública no continente
            africano.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} de {total} registos
            {filterCountry && ` · ${filterCountry}`}
            {filterSeverity && ` · ${filterSeverity}`}
          </p>
        </div>

        {/* Layout: cards + filtro lateral */}
        <div className="flex gap-8">
          {/* Outbreak list */}
          <section className="flex-1 space-y-4 min-w-0">
            <h2 className="text-lg font-semibold dark:text-zinc-300 text-zinc-900">
              Surtos Activos
            </h2>

            {filtered.length === 0 && (
              <p className="text-muted-foreground text-sm py-8 text-center border border-dashed rounded-xs">
                Nenhum surto encontrado com os filtros seleccionados.
              </p>
            )}

            {critical.length > 0 && (
              <div>
                <p className="text-xs text-red-400 font-mono uppercase mb-2">
                  ⚠ Crítico ({critical.length})
                </p>
                {critical.map((o) => (
                  <OutbreakCard key={o.id} outbreak={o} />
                ))}
              </div>
            )}

            {high.length > 0 && (
              <div>
                <p className="text-xs text-orange-400 font-mono uppercase mb-2">
                  Alta Prioridade ({high.length})
                </p>
                {high.map((o) => (
                  <OutbreakCard key={o.id} outbreak={o} />
                ))}
              </div>
            )}

            {others.length > 0 && (
              <div>
                {others.map((o) => (
                  <OutbreakCard key={o.id} outbreak={o} />
                ))}
              </div>
            )}
          </section>

          {/* Sidebar com filtro */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-24">
              <Suspense
                fallback={
                  <div className="text-zinc-500">A carregar filtros...</div>
                }
              >
                <OutbreakFilter countries={countries} />
              </Suspense>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
