import { fetchOutbreaksFromReliefWeb } from "@/lib/reliefweb";
import { Suspense } from "react";
import OutbreakCard from "@/components/Outbreak/OutbreakCard";
import AlertFeed from "@/components/Outbreak/OutbreakFilter";

// Dinâmico — nunca pre-renderizar no build (depende de curl + API externa)
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let outbreaks: Awaited<
    ReturnType<typeof fetchOutbreaksFromReliefWeb>
  >["outbreaks"] = [];
  let total = 0;

  try {
    const result = await fetchOutbreaksFromReliefWeb({ limit: 20 });
    outbreaks = result.outbreaks;
    total = result.total;
  } catch (err) {
    console.error("[Dashboard] Falha ao buscar dados:", err);
  }

  const critical = outbreaks.filter((o) => o.severity === "critical");
  const high = outbreaks.filter((o) => o.severity === "high");
  const others = outbreaks.filter(
    (o) => o.severity !== "critical" && o.severity !== "high",
  );

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          🌍 Monitor de Surtos — África
        </h1>
        <p className="text-zinc-400 mt-1">
          {total} registos activos · Actualizado via ReliefWeb API
        </p>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total de Surtos" value={total} color="zinc" />
        <StatCard label="Críticos" value={critical.length} color="red" />
        <StatCard label="Alta Prioridade" value={high.length} color="orange" />
        <StatCard
          label="Países Afectados"
          value={new Set(outbreaks.map((o) => o.country)).size}
          color="blue"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Outbreak list — ocupa 2/3 */}
        <section className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-300">
            Surtos Activos
          </h2>

          {critical.length > 0 && (
            <div>
              <p className="text-xs text-red-400 font-mono uppercase mb-2">
                ⚠ Crítico
              </p>
              {critical.map((o) => (
                <OutbreakCard key={o.id} outbreak={o} />
              ))}
            </div>
          )}

          {high.length > 0 && (
            <div>
              <p className="text-xs text-orange-400 font-mono uppercase mb-2">
                Alta Prioridade
              </p>
              {high.map((o) => (
                <OutbreakCard key={o.id} outbreak={o} />
              ))}
            </div>
          )}

          {others.map((o) => (
            <OutbreakCard key={o.id} outbreak={o} />
          ))}
        </section>

        {/* Alert feed — 1/3 */}
        <aside>
          <Suspense
            fallback={<div className="text-zinc-500">A carregar feed...</div>}
          >
            <AlertFeed outbreaks={outbreaks.slice(0, 10)} />
          </Suspense>
        </aside>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const colors: Record<string, string> = {
    zinc: "bg-zinc-800 text-zinc-100",
    red: "bg-red-950 text-red-300",
    orange: "bg-orange-950 text-orange-300",
    blue: "bg-blue-950 text-blue-300",
  };

  return (
    <div className={`rounded-xl p-4 ${colors[color] ?? colors.zinc}`}>
      <p className="text-xs opacity-60 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
