import type { Outbreak, DiseaseSeverity } from "@/lib/types";

const RELIEFWEB_API = "https://api.reliefweb.int/v1";
const APP_NAME = "africa-disease-monitor"; // obrigatório nos headers

// Mapeamento de doenças para severity
const DISEASE_SEVERITY_MAP: Record<string, DiseaseSeverity> = {
  ebola: "critical",
  marburg: "critical",
  cholera: "high",
  plague: "high",
  "yellow fever": "high",
  meningitis: "high",
  malaria: "medium",
  measles: "medium",
  mpox: "medium",
  dengue: "medium",
  typhoid: "low",
  default: "low",
};

function getSeverity(title: string): DiseaseSeverity {
  const lower = title.toLowerCase();
  for (const [disease, severity] of Object.entries(DISEASE_SEVERITY_MAP)) {
    if (lower.includes(disease)) return severity;
  }
  return "low";
}

function extractDisease(title: string): string {
  const diseases = Object.keys(DISEASE_SEVERITY_MAP).filter(
    (d) => d !== "default",
  );
  const lower = title.toLowerCase();
  for (const d of diseases) {
    if (lower.includes(d)) return d.charAt(0).toUpperCase() + d.slice(1);
  }
  // fallback — pega a primeira palavra significativa
  return title.split(" ").slice(0, 2).join(" ");
}

// Coordenadas aproximadas por país (África) — expande conforme necessário
const COUNTRY_COORDS: Record<string, [number, number]> = {
  "Democratic Republic of the Congo": [-4.0383, 21.7587],
  Congo: [-0.228, 15.8277],
  Nigeria: [9.082, 8.6753],
  Ethiopia: [9.145, 40.4897],
  Kenya: [-0.0236, 37.9062],
  Uganda: [1.3733, 32.2903],
  Tanzania: [-6.369, 34.8888],
  Sudan: [12.8628, 30.2176],
  Somalia: [5.1521, 46.1996],
  Mozambique: [-18.6657, 35.5296],
  Zimbabwe: [-19.0154, 29.1549],
  Zambia: [-13.1339, 27.8493],
  Angola: [-11.2027, 17.8739],
  Cameroon: [3.848, 11.5021],
  Ghana: [7.9465, -1.0232],
  Senegal: [14.4974, -14.4524],
  Mali: [17.5707, -3.9962],
  Niger: [17.6078, 8.0817],
  Chad: [15.4542, 18.7322],
  Guinea: [9.9456, -11.3247],
  "Sierra Leone": [8.4606, -11.7799],
  Liberia: [6.4281, -9.4295],
  Rwanda: [-1.9403, 29.8739],
  Burundi: [-3.3731, 29.9189],
  Madagascar: [-18.7669, 46.8691],
  Malawi: [-13.2543, 34.3015],
  "South Sudan": [6.877, 31.307],
  "Central African Republic": [6.6111, 20.9394],
  Gabon: [-0.8037, 11.6094],
  Togo: [8.6195, 0.8248],
  "Burkina Faso": [12.3641, -1.5197],
  "Côte d'Ivoire": [7.54, -5.5471],
};

interface ReliefWebReport {
  id: number;
  fields: {
    title: string;
    date: { original: string };
    country: Array<{ name: string; iso3?: string }>;
    source: Array<{ name: string }>;
    url_alias?: string;
    status?: string;
  };
}

export async function fetchOutbreaksFromReliefWeb(options?: {
  limit?: number;
  page?: number;
  disease?: string;
}): Promise<{ outbreaks: Outbreak[]; total: number }> {
  const limit = options?.limit ?? 20;
  const offset = ((options?.page ?? 1) - 1) * limit;

  // Query para buscar disease outbreaks em África
  const body = {
    query: {
      value: options?.disease
        ? `${options.disease} outbreak africa`
        : "disease outbreak africa cholera malaria ebola",
      operator: "OR",
    },
    filter: {
      conditions: [
        {
          field: "primary_country.region.name",
          value: [
            "Africa",
            "Eastern Africa",
            "Western Africa",
            "Central Africa",
            "Southern Africa",
            "Northern Africa",
          ],
          operator: "OR",
        },
      ],
    },
    fields: {
      include: [
        "title",
        "date.original",
        "country",
        "source",
        "url_alias",
        "status",
      ],
    },
    sort: ["date.original:desc"],
    limit,
    offset,
  };

  const res = await fetch(`${RELIEFWEB_API}/reports?appname=${APP_NAME}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    next: { revalidate: 3600 }, // ISR: cache por 1 hora
  });

  if (!res.ok) {
    throw new Error(`ReliefWeb API deu pau: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const reports: ReliefWebReport[] = json.data ?? [];
  const total: number = json.totalCount ?? 0;

  const outbreaks: Outbreak[] = reports.map((report) => {
    const f = report.fields;
    const countryName = f.country?.[0]?.name ?? "Unknown";
    const coords = COUNTRY_COORDS[countryName];

    return {
      id: String(report.id),
      title: f.title,
      disease: extractDisease(f.title),
      country: countryName,
      countryCode: f.country?.[0]?.iso3 ?? "",
      region: "Africa", // pode melhorar com lookup
      date: f.date?.original ?? new Date().toISOString(),
      status: "active", // ReliefWeb não tem status direto; pode filtrar por keywords
      severity: getSeverity(f.title),
      source: f.source?.[0]?.name ?? "ReliefWeb",
      url: f.url_alias ?? `https://reliefweb.int/report/${report.id}`,
      lat: coords?.[0],
      lng: coords?.[1],
    };
  });

  return { outbreaks, total };
}
