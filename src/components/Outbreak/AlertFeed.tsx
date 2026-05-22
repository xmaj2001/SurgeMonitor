import { Outbreak } from "@/lib/types";

export default function AlertFeed({ outbreaks }: { outbreaks: Outbreak[] }) {
  return (
    <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
      <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        Feed de Alertas
      </h3>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {outbreaks.map((o) => (
          <div
            key={o.id}
            className="text-xs border-l-2 border-zinc-700 pl-3 py-1"
          >
            <p className="text-zinc-200 font-medium">{o.disease}</p>
            <p className="text-zinc-500">
              {o.country} ·{" "}
              {new Date(o.date).toLocaleDateString("pt-PT", {
                day: "2-digit",
                month: "short",
              })}
            </p>
          </div>
        ))}
      </div>

      <p className="text-zinc-600 text-xs mt-4 text-center">
        Fonte: ReliefWeb / WHO
      </p>
    </div>
  );
}
