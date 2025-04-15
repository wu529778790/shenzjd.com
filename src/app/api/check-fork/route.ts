import { auth } from "@/lib/auth";
import { getOctokit } from "@/lib/github";
import { NextResponse } from "next/server";

const ORIGINAL_REPO = "shenzjd.com";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ isForked: false }, { status: 200 });
    }

    const octokit = await getOctokit();
    const login = session.user.login;

    try {
      // 检查是否已经 fork
      await octokit.repos.get({
        owner: login,
        repo: ORIGINAL_REPO,
      });
      return NextResponse.json({ isForked: true });
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        error.status === 404
      ) {
        return NextResponse.json({ isForked: false });
      }
      throw error;
    }
  } catch (error) {
    console.error("Check fork error:", error);
    return NextResponse.json(
      { error: "Failed to check fork status" },
      { status: 500 }
    );
  }
}
