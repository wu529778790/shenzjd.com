import { config } from "@/config";
import { Category } from "@/types/category";

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_RAW_BASE = "https://raw.githubusercontent.com";

// 获取文件内容
export async function getGitHubFileContent(): Promise<Category[]> {
  const { owner, repo, branch, path } = config.github;
  const url = `${GITHUB_RAW_BASE}/${owner}/${repo}/${branch}/${path}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3.raw",
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GitHub API 错误 (${response.status}):`, errorText);
      console.error(`请求URL: ${url}`);

      if (response.status === 404) {
        throw new Error(`文件不存在: ${path}`);
      } else if (response.status === 401) {
        throw new Error("GitHub Token无效或已过期");
      } else if (response.status === 403) {
        throw new Error("GitHub Token权限不足");
      }

      throw new Error(
        `GitHub API请求失败: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching from GitHub:", error);
    return [];
  }
}

// 更新文件内容
export async function updateGitHubFile(
  categories: Category[]
): Promise<boolean> {
  if (!process.env.GITHUB_TOKEN) {
    console.error("GitHub token not found");
    return false;
  }

  const { owner, repo, branch, path } = config.github;

  try {
    // 1. 获取当前文件的 SHA
    const currentFileResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!currentFileResponse.ok) {
      console.error(
        "Failed to get current file info:",
        await currentFileResponse.text()
      );
      throw new Error(
        `Failed to get current file info: ${currentFileResponse.statusText}`
      );
    }

    const currentFile = await currentFileResponse.json();

    // 2. 更新文件
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          message: "Update sites.json",
          content: Buffer.from(JSON.stringify(categories, null, 2)).toString(
            "base64"
          ),
          sha: currentFile.sha,
          branch: branch,
        }),
      }
    );

    if (!response.ok) {
      console.error("Failed to update file:", await response.text());
      throw new Error(`Failed to update file: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Error updating GitHub file:", error);
    return false;
  }
}
