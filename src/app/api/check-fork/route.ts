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
      return NextResponse.json({ isForked: false }, { status: 200 });
    }

    const octokit = await getOctokit();
    const login = session.user.login;

    try {
      // 获取原始仓库信息
      const { data: originalRepo } = await octokit.repos.get({
        owner: ORIGINAL_OWNER,
        repo: ORIGINAL_REPO,
      });

      // 获取用户的所有仓库
      const { data: repos } = await octokit.repos.listForUser({
        username: login,
        sort: "updated",
        direction: "desc",
      });

      // 检查是否有fork自原始仓库的仓库
      const isForked = repos.some(
        (repo: Repository) => repo.fork && repo.parent?.id === originalRepo.id
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
