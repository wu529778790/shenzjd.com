import { Octokit } from "@octokit/rest";

if (!process.env.GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN is required");
}

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const OWNER = process.env.GITHUB_OWNER || "wu529778790";
const REPO = process.env.GITHUB_REPO || "shenzjd.com";

export interface FileContent {
  content: string;
  sha?: string;
}

export async function getFile(path: string): Promise<FileContent> {
  try {
    const response = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
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

export async function updateFile(
  path: string,
  content: string,
  sha?: string
): Promise<void> {
  try {
    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
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
  try {
    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
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
  try {
    await octokit.repos.deleteFile({
      owner: OWNER,
      repo: REPO,
      path,
      message: `Delete ${path}`,
      sha,
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}
