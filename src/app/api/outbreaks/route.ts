import { NextRequest, NextResponse } from "next/server";
import { fetchOutbreaksFromReliefWeb } from "@/lib/reliefweb";

export const revalidate = 3600; // ISR global

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "20");
    const disease = searchParams.get("disease") ?? undefined;

    const { outbreaks, total } = await fetchOutbreaksFromReliefWeb({
      page,
      limit,
      disease,
    });

    return NextResponse.json(
      {
        data: outbreaks,
        total,
        page,
        limit,
        cachedAt: new Date().toISOString(),
      },
      {
        headers: {
          // Cache público por 1h, stale-while-revalidate por 30min
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Pau desconhecido";
    console.error("[/api/outbreaks] Deu pau:", message);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Webhook para revalidação on-demand (ex: chamado pelo ReliefWeb se tiver webhook)
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("x-revalidate-secret");
  if (authHeader !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Não autorizado, wy" }, { status: 401 });
  }

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/api/outbreaks");
  revalidatePath("/");

  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
