/**
 * Converte um código ISO 3166-1 alpha-2 (ex: "NG") para o emoji da bandeira (🇳🇬).
 * Funciona mapeando cada letra para o Regional Indicator Symbol correspondente.
 */
export function countryCodeToFlag(code: string): string {
  if (!code || code.length !== 2) return "🌍";
  const upper = code.toUpperCase();
  const offset = 0x1f1e6 - 65; // 'A' = 65, Regional Indicator 'A' = 0x1F1E6
  return String.fromCodePoint(
    upper.charCodeAt(0) + offset,
    upper.charCodeAt(1) + offset,
  );
}
