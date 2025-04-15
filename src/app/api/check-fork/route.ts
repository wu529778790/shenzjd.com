import { auth } from "@/lib/auth";
import { getOctokit } from "@/lib/github";
import { NextResponse } from "next/server";
import type { RestEndpointMethodTypes } from "@octokit/rest";

const ORIGINAL_OWNER = "wu529778790";
const ORIGINAL_REPO = "nav.shenzjd.com";

type Repository =
  RestEndpointMethodTypes["repos"]["listForUser"]["response"]["data"][0] & {
    parent?: {
      id: number;
    };
  };

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
      // 获取原始仓库信息
      console.log(
        "Fetching original repository:",
        ORIGINAL_OWNER,
        ORIGINAL_REPO
      );
      const { data: originalRepo } = await octokit.repos.get({
        owner: ORIGINAL_OWNER,
        repo: ORIGINAL_REPO,
      });
      console.log("Original repository ID:", originalRepo.id);

      // 获取用户的所有仓库
      console.log("Fetching user repositories");
      const { data: repos } = await octokit.repos.listForUser({
        username: login,
        sort: "updated",
        direction: "desc",
      });
      console.log("Found", repos.length, "repositories");

      // 检查是否有fork自原始仓库的仓库
      const isForked = repos.some((repo: Repository) => {
        const isFork = repo.fork && repo.parent?.id === originalRepo.id;
        if (isFork) {
          console.log("Found fork:", repo.name);
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
