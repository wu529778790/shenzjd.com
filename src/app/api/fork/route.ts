export const runtime = "edge";
import { auth } from "@/lib/auth";
import { ensureForked } from "@/lib/github";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureForked();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Fork error:", error);
    return NextResponse.json(
      { error: "Failed to fork repository" },
      { status: 500 }
    );
  }
}
