import { NextRequest, NextResponse } from "next/server";
import { getUserRole } from "@/lib/actions";
import { devLog, devError } from "@/lib/security";
import { parseISO, startOfMonth, endOfMonth, startOfDay, endOfDay, format } from "date-fns";
import { execSync } from "child_process";
import { ValidationError, AuthenticationError, AuthorizationError, ApiError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
  html_url: string;
}

/**
 * Get repository owner and name from environment variables or git remote
 */
async function getRepoInfo(): Promise<{ owner: string; repo: string } | null> {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;

  if (owner && repo) {
    return { owner, repo };
  }

  if (process.env.NODE_ENV === "development") {
    try {
      const remoteUrl = execSync("git config --get remote.origin.url", {
        encoding: "utf-8",
      }).trim();

      const match = remoteUrl.match(
        /(?:github\.com[/:]|git@github\.com:)([^/]+)\/([^/]+?)(?:\.git)?$/
      );
      if (match) {
        return { owner: match[1], repo: match[2].replace(".git", "") };
      }
    } catch (error) {
      devError("Failed to detect git remote:", error);
    }
  }

  return null;
}

/**
 * Fetch commits from GitHub API for a specific date range
 */
async function fetchCommitsByDateRange(
  owner: string,
  repo: string,
  startDate: Date,
  endDate: Date
): Promise<GitHubCommit[]> {
  const token = process.env.GITHUB_TOKEN;
  const sinceISO = startDate.toISOString();
  const untilISO = endDate.toISOString();

  const url = `https://api.github.com/repos/${owner}/${repo}/commits?since=${sinceISO}&until=${untilISO}&per_page=100`;

  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  if (token) {
    headers.Authorization = `token ${token}`;
  }

  const allCommits: GitHubCommit[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= 10) {
    const pageUrl = `${url}&page=${page}`;
    devLog(`Fetching commits page ${page} for ${owner}/${repo} from ${sinceISO} to ${untilISO}`);

    try {
      const response = await fetch(pageUrl, { headers });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Repository ${owner}/${repo} not found`);
        }
        if (response.status === 403) {
          const rateLimitRemaining = response.headers.get("x-ratelimit-remaining");
          if (rateLimitRemaining === "0") {
            throw new Error(
              "GitHub API rate limit exceeded. Please add GITHUB_TOKEN environment variable."
            );
          }
          throw new Error("GitHub API access forbidden. Check your token permissions.");
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const commits: GitHubCommit[] = await response.json();

      if (commits.length === 0) {
        hasMore = false;
      } else {
        allCommits.push(...commits);
        page++;
      }
    } catch (error) {
      devError("Error fetching commits from GitHub:", error);
      throw error;
    }
  }

  return allCommits;
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      throw new AuthenticationError("Authentication required");
    }

    const userData = await getUserRole(userId);
    if (!userData || userData.role !== "admin") {
      throw new AuthorizationError("Admin access required");
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    const viewMode = (searchParams.get("viewMode") || "month") as "month" | "day";

    if (!dateStr) {
      throw new ValidationError("Date parameter is required");
    }

    const repoInfo = await getRepoInfo();
    if (!repoInfo) {
      throw new ValidationError(
        "Repository information not found. Please set GITHUB_OWNER and GITHUB_REPO environment variables."
      );
    }

    let startDate: Date;
    let endDate: Date;

    try {
      if (viewMode === "month") {
        // dateStr is "yyyy-MM"
        startDate = startOfMonth(parseISO(`${dateStr}-01`));
        endDate = endOfMonth(parseISO(`${dateStr}-01`));
      } else {
        // dateStr is "yyyy-MM-dd"
        startDate = startOfDay(parseISO(dateStr));
        endDate = endOfDay(parseISO(dateStr));
      }
    } catch (error) {
      throw new ValidationError("Invalid date format");
    }

    devLog(`Fetching commits for ${repoInfo.owner}/${repoInfo.repo} from ${startDate.toISOString()} to ${endDate.toISOString()}`);

    const commits = await fetchCommitsByDateRange(
      repoInfo.owner,
      repoInfo.repo,
      startDate,
      endDate
    );

    // Sort by date (newest first)
    commits.sort((a, b) => {
      const dateA = new Date(a.commit.author.date).getTime();
      const dateB = new Date(b.commit.author.date).getTime();
      return dateB - dateA;
    });

    return formatSuccessResponse({
      commits,
      count: commits.length,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

