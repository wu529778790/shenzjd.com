import { Octokit } from "@octokit/rest";
import { auth } from "@/auth";

export interface FileContent {
  content: string;
  sha?: string;
}

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

export async function getFile(path: string): Promise<FileContent> {
  try {
    const octokit = await getOctokit();
    const session = await auth();
    const owner =
      session?.user?.name || process.env.GITHUB_OWNER || "wu529778790";
    const repo = process.env.GITHUB_REPO || "shenzjd.com";

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
    const octokit = await getOctokit();
    await octokit.repos.createOrUpdateFileContents({
      owner: session.user.name || process.env.GITHUB_OWNER || "wu529778790",
      repo: process.env.GITHUB_REPO || "shenzjd.com",
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
    const octokit = await getOctokit();
    await octokit.repos.createOrUpdateFileContents({
      owner: session.user.name || process.env.GITHUB_OWNER || "wu529778790",
      repo: process.env.GITHUB_REPO || "shenzjd.com",
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
    const octokit = await getOctokit();
    await octokit.repos.deleteFile({
      owner: session.user.name || process.env.GITHUB_OWNER || "wu529778790",
      repo: process.env.GITHUB_REPO || "shenzjd.com",
      path,
      message: `Delete ${path}`,
      sha,
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}
