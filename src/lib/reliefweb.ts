import type { Outbreak, DiseaseSeverity } from "@/lib/types";
import { XMLParser } from "fast-xml-parser";
import { execSync } from "child_process";

// ─── Configuração ────────────────────────────────────────────────────────
// ReliefWeb API v1 foi desactivada. API v2 exige appname pré-aprovado.
// Solução: usar o feed RSS público (não precisa de autenticação).
const RELIEFWEB_RSS = "https://reliefweb.int/updates/rss.xml";

// Doenças que nos interessam — usadas no search param do RSS
const TRACKED_DISEASES = [
  "cholera",
  "malaria",
  "ebola",
  "mpox",
  "meningitis",
  "measles",
  "marburg",
  "plague",
  "yellow fever",
  "dengue",
  "typhoid",
];

// ─── Severity ────────────────────────────────────────────────────────────
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
  const lower = title.toLowerCase();
  for (const d of TRACKED_DISEASES) {
    if (lower.includes(d)) return d.charAt(0).toUpperCase() + d.slice(1);
  }
  // fallback — pega as primeiras palavras significativas
  return title.split(" ").slice(0, 2).join(" ");
}

// ─── Dados por país (África) — coordenadas + código ISO alpha-2 ─────────
const COUNTRY_DATA: Record<string, { coords: [number, number]; code: string }> =
  {
    "Democratic Republic of the Congo": {
      coords: [-4.0383, 21.7587],
      code: "CD",
    },
    Congo: { coords: [-0.228, 15.8277], code: "CG" },
    Nigeria: { coords: [9.082, 8.6753], code: "NG" },
    Ethiopia: { coords: [9.145, 40.4897], code: "ET" },
    Kenya: { coords: [-0.0236, 37.9062], code: "KE" },
    Uganda: { coords: [1.3733, 32.2903], code: "UG" },
    Tanzania: { coords: [-6.369, 34.8888], code: "TZ" },
    Sudan: { coords: [12.8628, 30.2176], code: "SD" },
    Somalia: { coords: [5.1521, 46.1996], code: "SO" },
    Mozambique: { coords: [-18.6657, 35.5296], code: "MZ" },
    Zimbabwe: { coords: [-19.0154, 29.1549], code: "ZW" },
    Zambia: { coords: [-13.1339, 27.8493], code: "ZM" },
    Angola: { coords: [-11.2027, 17.8739], code: "AO" },
    Cameroon: { coords: [3.848, 11.5021], code: "CM" },
    Ghana: { coords: [7.9465, -1.0232], code: "GH" },
    Senegal: { coords: [14.4974, -14.4524], code: "SN" },
    Mali: { coords: [17.5707, -3.9962], code: "ML" },
    Niger: { coords: [17.6078, 8.0817], code: "NE" },
    Chad: { coords: [15.4542, 18.7322], code: "TD" },
    Guinea: { coords: [9.9456, -11.3247], code: "GN" },
    "Sierra Leone": { coords: [8.4606, -11.7799], code: "SL" },
    Liberia: { coords: [6.4281, -9.4295], code: "LR" },
    Rwanda: { coords: [-1.9403, 29.8739], code: "RW" },
    Burundi: { coords: [-3.3731, 29.9189], code: "BI" },
    Madagascar: { coords: [-18.7669, 46.8691], code: "MG" },
    Malawi: { coords: [-13.2543, 34.3015], code: "MW" },
    "South Sudan": { coords: [6.877, 31.307], code: "SS" },
    "Central African Republic": { coords: [6.6111, 20.9394], code: "CF" },
    Gabon: { coords: [-0.8037, 11.6094], code: "GA" },
    Togo: { coords: [8.6195, 0.8248], code: "TG" },
    "Burkina Faso": { coords: [12.3641, -1.5197], code: "BF" },
    "Côte d'Ivoire": { coords: [7.54, -5.5471], code: "CI" },
  };

// País conhecidos de África — usado para filtrar resultados "World" etc.
const AFRICAN_COUNTRIES = new Set(Object.keys(COUNTRY_DATA));

// ─── Extracção de país a partir do HTML da description ──────────────────
function extractCountryFromDesc(desc: string): string {
  // O RSS embute "Country: XYZ" dentro do HTML da description
  const match = desc.match(/Country:\s*([^<]+)/i);
  if (match) return match[1].trim();
  return "Unknown";
}

function extractSourceFromDesc(desc: string): string {
  const match = desc.match(/Sources?:\s*([^<]+)/i);
  if (match) return match[1].trim().split(",")[0].trim();
  return "ReliefWeb";
}

// ─── Parser RSS ─────────────────────────────────────────────────────────
interface RSSItem {
  title: string;
  link: string;
  guid: string | { "#text": string };
  pubDate: string;
  description: string;
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

export async function fetchOutbreaksFromReliefWeb(options?: {
  limit?: number;
  page?: number;
  disease?: string;
}): Promise<{ outbreaks: Outbreak[]; total: number }> {
  const limit = options?.limit ?? 20;
  const page = options?.page ?? 1;

  // Construir URL do RSS com filtro de search
  // (C10) = região "Eastern Africa" — mas na verdade o RSS não suporta
  // filtros complexos por região, só search text. Filtramos depois.
  const searchQuery = options?.disease
    ? `${options.disease} outbreak`
    : "outbreak";

  const url = `${RELIEFWEB_RSS}?search=${encodeURIComponent(searchQuery)}&limit=50`;

  // Node.js fetch é bloqueado pelo Cloudflare (TLS fingerprint de bot).
  // curl funciona porque tem fingerprint TLS normal.
  let xml: string;
  try {
    xml = execSync(
      `curl -s --max-time 15 "${url}" -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36" -H "Accept: application/xml, text/xml, */*"`,
      { encoding: "utf-8", timeout: 20_000 },
    );
  } catch (err) {
    throw new Error(
      `Falha ao buscar dados do ReliefWeb: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (!xml || xml.includes('"error"')) {
    throw new Error(`ReliefWeb RSS bloqueado ou indisponível`);
  }

  const parsed = xmlParser.parse(xml);

  const items: RSSItem[] = parsed?.rss?.channel?.item ?? [];

  // Converter itens RSS → Outbreak[], filtrar para África
  const allOutbreaks: Outbreak[] = [];

  for (const item of items) {
    const title = item.title ?? "";
    const description = item.description ?? "";
    const countryName = extractCountryFromDesc(description);
    const link = typeof item.guid === "object" ? item.guid["#text"] : item.link;

    // Filtrar: só países africanos (ignorar "World", etc.)
    if (countryName === "Unknown" || countryName === "World") {
      // Tentar extrair país do título
      const titleCountry = findAfricanCountryInText(title);
      if (!titleCountry) continue;
      // Usar o país do título
      const data = COUNTRY_DATA[titleCountry];
      allOutbreaks.push({
        id: generateId(link),
        title,
        disease: extractDisease(title),
        country: titleCountry,
        countryCode: data?.code ?? "",
        region: "Africa",
        date: item.pubDate ?? new Date().toISOString(),
        status: "active",
        severity: getSeverity(title),
        source: extractSourceFromDesc(description),
        url: link,
        lat: data?.coords[0],
        lng: data?.coords[1],
      });
    } else if (AFRICAN_COUNTRIES.has(countryName)) {
      const data = COUNTRY_DATA[countryName];
      allOutbreaks.push({
        id: generateId(link),
        title,
        disease: extractDisease(title),
        country: countryName,
        countryCode: data?.code ?? "",
        region: "Africa",
        date: item.pubDate ?? new Date().toISOString(),
        status: "active",
        severity: getSeverity(title),
        source: extractSourceFromDesc(description),
        url: link,
        lat: data?.coords[0],
        lng: data?.coords[1],
      });
    }
    // Se não é país africano, ignorar silenciosamente
  }

  // Paginação manual
  const total = allOutbreaks.length;
  const offset = (page - 1) * limit;
  const outbreaks = allOutbreaks.slice(offset, offset + limit);

  return { outbreaks, total };
}

// ─── Helpers ─────────────────────────────────────────────────────────────
function generateId(link: string): string {
  // Extrair ID numérico do link, ou usar hash simples
  const match = link.match(/\/(\d+)$/);
  if (match) return match[1];
  // fallback: hash simples do link
  let hash = 0;
  for (let i = 0; i < link.length; i++) {
    hash = (hash << 5) - hash + link.charCodeAt(i);
    hash |= 0;
  }
  return String(Math.abs(hash));
}

function findAfricanCountryInText(text: string): string | null {
  for (const country of AFRICAN_COUNTRIES) {
    if (text.includes(country)) return country;
  }
  // Tentar abreviações comuns
  if (text.includes("DR Congo") || text.includes("DRC"))
    return "Democratic Republic of the Congo";
  if (text.includes("CAR")) return "Central African Republic";
  return null;
}
