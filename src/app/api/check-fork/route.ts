import { auth } from "@/lib/auth";
import { getOctokit } from "@/lib/github";
import { NextResponse } from "next/server";

const ORIGINAL_OWNER = "wu529778790";
const ORIGINAL_REPO = "nav.shenzjd.com";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      console.log("User not authenticated");
      return NextResponse.json({ isForked: false }, { status: 200 });
    }

    const octokit = await getOctokit();
    const login = session.user.login;
    console.log("Checking fork status for user:", login);

    try {
      // 获取原始仓库的所有fork
      console.log(
        "Fetching forks of repository:",
        ORIGINAL_OWNER,
        ORIGINAL_REPO
      );
      const { data: forks } = await octokit.repos.listForks({
        owner: ORIGINAL_OWNER,
        repo: ORIGINAL_REPO,
        per_page: 100,
      });
      console.log("Found", forks.length, "forks");

      // 检查用户是否在fork列表中
      const isForked = forks.some((fork) => {
        const isFork = fork.owner.login === login;
        if (isFork) {
          console.log("Found user's fork:", fork.name);
        }
        return isFork;
      });

      console.log("Is forked:", isForked);
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
