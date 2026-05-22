export type DiseaseSeverity = "critical" | "high" | "medium" | "low";

export interface Outbreak {
  id: string;
  title: string;
  disease: string;
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2
  region: string; // e.g. "Eastern Africa"
  date: string; // ISO date string
  status: "active" | "resolved" | "monitoring";
  severity: DiseaseSeverity;
  casesReported?: number;
  deathsReported?: number;
  source: string;
  url: string;
  lat?: number;
  lng?: number;
}

export interface OutbreakApiResponse {
  data: Outbreak[];
  total: number;
  page: number;
  limit: number;
  cachedAt: string;
}
