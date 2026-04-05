import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  // Sanitize: only allow hex characters
  if (!/^[0-9a-f]+$/.test(userId)) {
    return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
  }

  const root = process.cwd();
  const candidates = [
    path.join(root, "portfolios", `${userId}-portfolio.json`),
    path.join(root, ".zeroclaw", "agents", "portfolio-builder-deepseek", "workspace", `${userId}-portfolio.json`),
  ];

  const noCacheHeaders = { "Cache-Control": "no-store, max-age=0" };

  for (const filePath of candidates) {
    try {
      const raw = await readFile(filePath, "utf-8");
      const portfolio = JSON.parse(raw);
      return NextResponse.json(portfolio, { headers: noCacheHeaders });
    } catch {
      // Try next candidate
    }
  }

  return NextResponse.json({ error: "not_found" }, { status: 404, headers: noCacheHeaders });
}
