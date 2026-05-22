import { fetchOutbreaksFromReliefWeb } from "@/lib/reliefweb";
import { Suspense } from "react";
import OutbreakCard from "@/components/Outbreak/OutbreakCard";
import OutbreakFilter from "@/components/Outbreak/OutbreakFilter";

export default async function OutbreakPage() {
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
    <div className="w-full px-6 py-12 flex flex-col gap-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif text-foreground">
          Monitor de Surtos — África
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl">
          Nesta seção você encontrará informações sobre surtos de doenças e
          emergências de saúde pública.
        </p>

        <section className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold dark:text-zinc-300 text-zinc-900">
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
      </div>
      <aside className="fixed right-[5vw] top-[25vh]">
        <Suspense
          fallback={<div className="text-zinc-500">A carregar feed...</div>}
        >
          <OutbreakFilter />
        </Suspense>
      </aside>
    </div>
  );
}
