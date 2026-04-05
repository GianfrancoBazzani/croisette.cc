import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  if (!/^[a-f0-9]+$/.test(userId)) {
    return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "portfolios", `${userId}-portfolio.json`);

  try {
    const data = await readFile(filePath, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }
}
