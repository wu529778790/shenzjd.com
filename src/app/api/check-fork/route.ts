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

      // 直接检查用户是否fork了这个仓库
      try {
        const { data: userRepo } = await octokit.repos.get({
          owner: login,
          repo: ORIGINAL_REPO,
        });
        console.log("User repository found:", userRepo.name);
        console.log("Is fork:", userRepo.fork);
        console.log("Fork parent:", userRepo.parent?.full_name);

        const isForked =
          userRepo.fork && userRepo.parent?.id === originalRepo.id;
        console.log("Is forked from original:", isForked);

        return NextResponse.json({ isForked });
      } catch (error: unknown) {
        if (
          error &&
          typeof error === "object" &&
          "status" in error &&
          error.status === 404
        ) {
          console.log("User has not forked the repository");
          return NextResponse.json({ isForked: false });
        }
        throw error;
      }
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
