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
  const login = session.user.login;

  try {
    console.log(`Checking if repository is forked for user: ${login}`);
    // 检查是否已经 fork
    await octokit.repos.get({
      owner: login,
      repo: ORIGINAL_REPO,
    });
    console.log(`Repository already forked for user: ${login}`);
    return true;
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 404
    ) {
      console.log(`Forking repository for user: ${login}`);
      try {
        // 如果没有 fork，则创建 fork
        await octokit.repos.createFork({
          owner: ORIGINAL_OWNER,
          repo: ORIGINAL_REPO,
        });
        console.log(`Successfully forked repository for user: ${login}`);

        // 等待一段时间，确保 fork 完成
        console.log(`Waiting for fork to complete...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // 再次检查是否已经 fork
        try {
          await octokit.repos.get({
            owner: login,
            repo: ORIGINAL_REPO,
          });
          console.log(`Repository successfully forked after waiting`);
          return true;
        } catch (retryError) {
          console.error(`Failed to verify fork after waiting:`, retryError);
          throw new Error("Failed to verify fork after waiting");
        }
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
          // 等待 5 秒后重试
          await new Promise((resolve) => setTimeout(resolve, 5000));
          // 重新检查是否已经 fork
          try {
            await octokit.repos.get({
              owner: login,
              repo: ORIGINAL_REPO,
            });
            console.log(`Repository successfully forked after waiting`);
            return true;
          } catch (retryError) {
            console.error(`Failed to verify fork after waiting:`, retryError);
            throw new Error("Failed to verify fork after waiting");
          }
        }
        console.error(
          `Failed to fork repository for user ${login}:`,
          forkError
        );
        throw new Error("Failed to fork repository");
      }
    }
    console.error(`Error checking repository for user ${login}:`, error);
    throw error;
  }
}

export async function getFile(path: string): Promise<FileContent> {
  try {
    const octokit = await getOctokit();
    const session = await auth();

    // 如果用户已登录，使用其 fork 的仓库
    const owner = session?.user ? session.user.login : ORIGINAL_OWNER;
    const repo = ORIGINAL_REPO;

    try {
      console.log(`Attempting to get file ${path} from ${owner}/${repo}`);
      const response = await octokit.repos.getContent({
        owner,
        repo,
        path,
      });

      if ("content" in response.data) {
        return {
          content: Buffer.from(response.data.content, "base64").toString(
            "utf-8"
          ),
          sha: response.data.sha,
        };
      }

      throw new Error("File not found");
    } catch (error) {
      // 如果从用户的 fork 仓库获取文件失败，尝试从原始仓库获取
      if (session?.user && owner !== ORIGINAL_OWNER) {
        console.log(
          `Failed to get file from user's fork, trying original repository`
        );
        try {
          console.log(
            `Attempting to get file ${path} from ${ORIGINAL_OWNER}/${ORIGINAL_REPO}`
          );
          const originalResponse = await octokit.repos.getContent({
            owner: ORIGINAL_OWNER,
            repo: ORIGINAL_REPO,
            path,
          });

          if ("content" in originalResponse.data) {
            return {
              content: Buffer.from(
                originalResponse.data.content,
                "base64"
              ).toString("utf-8"),
              sha: originalResponse.data.sha,
            };
          }
        } catch (originalError) {
          console.error(
            "Error getting file from original repository:",
            originalError
          );
        }
      }
      throw error;
    }
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

    // 检查文件是否存在
    let fileExists = false;
    let fileSha = sha;

    try {
      const file = await getFile(path);
      fileExists = true;
      fileSha = file.sha;
    } catch {
      console.log(
        `File ${path} does not exist in the repository, will create a new file`
      );
      fileExists = false;
    }

    if (fileExists && fileSha) {
      // 文件存在，更新文件
      await octokit.repos.createOrUpdateFileContents({
        owner: session.user.login,
        repo: ORIGINAL_REPO,
        path,
        message: `[skip ci] Update ${path}`,
        content: Buffer.from(content).toString("base64"),
        sha: fileSha,
      });
    } else {
      // 文件不存在，创建新文件
      await octokit.repos.createOrUpdateFileContents({
        owner: session.user.login,
        repo: ORIGINAL_REPO,
        path,
        message: `Create ${path}`,
        content: Buffer.from(content).toString("base64"),
      });
    }
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
      owner: session.user.login,
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

    // 检查文件是否存在
    let fileExists = false;
    let fileSha = sha;

    if (!fileSha) {
      try {
        const file = await getFile(path);
        fileExists = true;
        fileSha = file.sha || ""; // 确保 fileSha 不为 undefined
      } catch {
        console.log(
          `File ${path} does not exist in the repository, cannot delete`
        );
        return; // 如果文件不存在，直接返回
      }
    } else {
      fileExists = true;
    }

    if (fileExists && fileSha) {
      await octokit.repos.deleteFile({
        owner: session.user.login,
        repo: ORIGINAL_REPO,
        path,
        message: `Delete ${path}`,
        sha: fileSha,
      });
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}
