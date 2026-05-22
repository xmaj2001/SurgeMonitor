"use server";

import { Outbreak } from "@/lib/types";
import { fetchOutbreaksFromReliefWeb } from "@/lib/reliefweb";

// Server Action para buscar com filtros (usado em forms/search)
export async function getOutbreaks(formData: FormData): Promise<{
  outbreaks: Outbreak[];
  total: number;
  error?: string;
}> {
  try {
    const disease = formData.get("disease") as string | null;
    const page = Number(formData.get("page") ?? "1");

    const result = await fetchOutbreaksFromReliefWeb({
      disease: disease ?? undefined,
      page,
      limit: 20,
    });

    return result;
  } catch (err) {
    return {
      outbreaks: [],
      total: 0,
      error: err instanceof Error ? err.message : "Deu pau no servidor",
    };
  }
}

// Action para buscar um surto específico
export async function getOutbreakById(id: string): Promise<Outbreak | null> {
  const { outbreaks } = await fetchOutbreaksFromReliefWeb({ limit: 50 });
  return outbreaks.find((o) => o.id === id) ?? null;
}
