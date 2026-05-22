import { Outbreak } from "@/lib/types";
import { countryCodeToFlag } from "@/lib/flags";

const severityStyles = {
  critical: "border-red-500",
  high: "border-orange-500",
  medium: "border-yellow-600",
  low: "border-zinc-600",
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

  const flag = countryCodeToFlag(outbreak.countryCode);

  return (
    <a
      href={outbreak.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        block border rounded-xs p-4 mb-3 transition-all hover:opacity-80
        ${severityStyles[outbreak.severity]}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Bandeira do país */}
          <span className="text-2xl leading-none shrink-0 mt-0.5" aria-label={outbreak.country}>
            {flag}
          </span>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold dark:text-white text-black truncate">
              {outbreak.title}
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              {outbreak.country} · {dateStr}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">{outbreak.source}</p>
          </div>
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
