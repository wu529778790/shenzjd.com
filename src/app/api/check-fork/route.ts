import { auth } from "@/lib/auth";
import { getOctokit } from "@/lib/github";
import { NextResponse } from "next/server";

const ORIGINAL_REPO = "nav.shenzjd.com";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ isForked: false }, { status: 200 });
    }

    const octokit = await getOctokit();
    const login = session.user.login;

    try {
      const { data: repos } = await octokit.repos.listForUser({
        username: login,
        sort: "updated",
        direction: "desc",
      });

      const isForked = repos.some(
        (repo) =>
          repo.fork && repo.name === ORIGINAL_REPO && repo.owner.login === login
      );

      return NextResponse.json({ isForked });
    } catch (error) {
      console.error("Error checking fork status:", error);
      return NextResponse.json({ isForked: false });
    }
  } catch (error) {
    console.error("Check fork error:", error);
    return NextResponse.json(
      { error: "Failed to check fork status" },
      { status: 500 }
    );
  }
}
