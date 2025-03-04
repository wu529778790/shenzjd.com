import { Octokit } from "@octokit/rest";
import { auth } from "@/lib/auth";

export interface FileContent {
  content: string;
  sha?: string;
}

const ORIGINAL_OWNER = "wu529778790";
const ORIGINAL_REPO = "shenzjd.com";

export async function getOctokit() {
  const session = await auth();
  // 如果用户已登录，使用 OAuth token
  if (session?.user) {
    return new Octokit({
      auth: session.accessToken,
    });
  }
  // 如果用户未登录，使用环境变量中的 token
  return new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });
}

// 确保用户已 fork 仓库
export async function ensureForked() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  const octokit = await getOctokit();
  const username = session.user.name;

  try {
    console.log(`Checking if repository is forked for user: ${username}`);
    // 检查是否已经 fork
    await octokit.repos.get({
      owner: username,
      repo: ORIGINAL_REPO,
    });
    console.log(`Repository already forked for user: ${username}`);
    return true;
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 404
    ) {
      console.log(`Forking repository for user: ${username}`);
      try {
        // 如果没有 fork，则创建 fork
        await octokit.repos.createFork({
          owner: ORIGINAL_OWNER,
          repo: ORIGINAL_REPO,
        });
        console.log(`Successfully forked repository for user: ${username}`);
        return true;
      } catch (forkError: unknown) {
        // 如果仓库正在 fork 中，等待一段时间后重试
        if (
          forkError &&
          typeof forkError === "object" &&
          "status" in forkError &&
          "message" in forkError &&
          forkError.status === 403 &&
          typeof forkError.message === "string" &&
          forkError.message.includes("already being forked")
        ) {
          console.log(`Repository is being forked, waiting...`);
          // 等待 2 秒后重试
          await new Promise((resolve) => setTimeout(resolve, 2000));
          // 重新检查是否已经 fork
          try {
            await octokit.repos.get({
              owner: username,
              repo: ORIGINAL_REPO,
            });
            console.log(`Repository successfully forked after waiting`);
            return true;
          } catch (retryError) {
            console.error(`Failed to verify fork after waiting:`, retryError);
          }
        }
        console.error(
          `Failed to fork repository for user ${username}:`,
          forkError
        );
        throw new Error("Failed to fork repository");
      }
    }
    console.error(`Error checking repository for user ${username}:`, error);
    throw error;
  }
}

export async function getFile(path: string): Promise<FileContent> {
  try {
    const octokit = await getOctokit();
    const session = await auth();

    // 如果用户已登录，使用其 fork 的仓库
    const owner = session?.user ? session.user.name : ORIGINAL_OWNER;
    const repo = ORIGINAL_REPO;

    const response = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    if ("content" in response.data) {
      return {
        content: Buffer.from(response.data.content, "base64").toString("utf-8"),
        sha: response.data.sha,
      };
    }

    throw new Error("File not found");
  } catch (error) {
    console.error("Error getting file:", error);
    throw error;
  }
}

// 需要认证的操作
export async function updateFile(
  path: string,
  content: string,
  sha?: string
): Promise<void> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  try {
    // 确保用户已 fork 仓库
    await ensureForked();

    const octokit = await getOctokit();
    await octokit.repos.createOrUpdateFileContents({
      owner: session.user.name,
      repo: ORIGINAL_REPO,
      path,
      message: `Update ${path}`,
      content: Buffer.from(content).toString("base64"),
      sha,
    });
  } catch (error) {
    console.error("Error updating file:", error);
    throw error;
  }
}

export async function createFile(path: string, content: string): Promise<void> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  try {
    // 确保用户已 fork 仓库
    await ensureForked();

    const octokit = await getOctokit();
    await octokit.repos.createOrUpdateFileContents({
      owner: session.user.name,
      repo: ORIGINAL_REPO,
      path,
      message: `Create ${path}`,
      content: Buffer.from(content).toString("base64"),
    });
  } catch (error) {
    console.error("Error creating file:", error);
    throw error;
  }
}

export async function deleteFile(path: string, sha: string): Promise<void> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  try {
    // 确保用户已 fork 仓库
    await ensureForked();

    const octokit = await getOctokit();
    await octokit.repos.deleteFile({
      owner: session.user.name,
      repo: ORIGINAL_REPO,
      path,
      message: `Delete ${path}`,
      sha,
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}
