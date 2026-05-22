import { Outbreak } from "@/lib/types";

const severityStyles = {
  critical: "border-red-500 bg-red-950/40",
  high: "border-orange-500 bg-orange-950/30",
  medium: "border-yellow-600 bg-yellow-950/20",
  low: "border-zinc-600 bg-zinc-900",
};

const severityBadge = {
  critical: "bg-red-600 text-white",
  high: "bg-orange-600 text-white",
  medium: "bg-yellow-700 text-white",
  low: "bg-zinc-700 text-zinc-300",
};

export default function OutbreakCard({ outbreak }: { outbreak: Outbreak }) {
  const dateStr = new Date(outbreak.date).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <a
      href={outbreak.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        block border rounded-xl p-4 mb-3 transition-all hover:opacity-80
        ${severityStyles[outbreak.severity]}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {outbreak.title}
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            {outbreak.country} · {dateStr}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">{outbreak.source}</p>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span
            className={`
              text-xs font-mono px-2 py-0.5 rounded-full
              ${severityBadge[outbreak.severity]}
            `}
          >
            {outbreak.disease}
          </span>
          {outbreak.severity === "critical" && (
            <span className="text-xs text-red-400 font-mono animate-pulse">
              CRÍTICO
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
