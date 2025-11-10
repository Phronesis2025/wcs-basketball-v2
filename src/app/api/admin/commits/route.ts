import { NextRequest, NextResponse } from "next/server";
import { getUserRole } from "@/lib/actions";
import { devLog, devError } from "@/lib/security";
import { subMonths, format, parseISO } from "date-fns";

interface GitHubCommit {
  commit: {
    author: {
      date: string;
    };
  };
}

interface CommitData {
  date: string;
  count: number;
}

/**
 * Get repository owner and name from environment variables or git remote
 */
async function getRepoInfo(): Promise<{ owner: string; repo: string } | null> {
  // Try environment variables first
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;

  if (owner && repo) {
    return { owner, repo };
  }

  // Fallback: try to detect from git remote (only works in development)
  if (process.env.NODE_ENV === "development") {
    try {
      const { execSync } = require("child_process");
      const remoteUrl = execSync("git config --get remote.origin.url", {
        encoding: "utf-8",
      }).trim();

      // Parse GitHub URL (handles both https and ssh formats)
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
 * Fetch commits from GitHub API
 */
async function fetchCommitsFromGitHub(
  owner: string,
  repo: string,
  since: Date
): Promise<GitHubCommit[]> {
  const token = process.env.GITHUB_TOKEN;
  const sinceISO = since.toISOString();

  const url = `https://api.github.com/repos/${owner}/${repo}/commits?since=${sinceISO}&per_page=100`;

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
    // Limit to 10 pages (1000 commits max) to avoid excessive API calls
    const pageUrl = `${url}&page=${page}`;
    devLog(`Fetching commits page ${page} for ${owner}/${repo}`);

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

/**
 * Group commits by date (month or day)
 */
function groupCommitsByDate(
  commits: GitHubCommit[],
  groupBy: "month" | "day"
): CommitData[] {
  const grouped: Record<string, number> = {};

  commits.forEach((commit) => {
    const date = parseISO(commit.commit.author.date);
    const key =
      groupBy === "month"
        ? format(date, "yyyy-MM")
        : format(date, "yyyy-MM-dd");

    grouped[key] = (grouped[key] || 0) + 1;
  });

  // Convert to array and sort by date
  return Object.entries(grouped)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function GET(request: NextRequest) {
  try {
    // Get user ID from request headers (set by middleware or auth)
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const userData = await getUserRole(userId);
    if (!userData || userData.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const groupBy = (searchParams.get("groupBy") || "month") as "month" | "day";
    const monthsBack = parseInt(searchParams.get("monthsBack") || "6", 10);

    // Get repository info
    const repoInfo = await getRepoInfo();
    if (!repoInfo) {
      return NextResponse.json(
        {
          error:
            "Repository information not found. Please set GITHUB_OWNER and GITHUB_REPO environment variables.",
        },
        { status: 400 }
      );
    }

    devLog(`Fetching commits for ${repoInfo.owner}/${repoInfo.repo}`);

    // Calculate date range (default: last 6 months)
    const since = subMonths(new Date(), monthsBack);

    // Fetch commits from GitHub
    const commits = await fetchCommitsFromGitHub(
      repoInfo.owner,
      repoInfo.repo,
      since
    );

    // Group commits by date
    const groupedCommits = groupCommitsByDate(commits, groupBy);

    return NextResponse.json({
      success: true,
      data: groupedCommits,
      totalCommits: commits.length,
      repository: `${repoInfo.owner}/${repoInfo.repo}`,
    });
  } catch (error) {
    devError("Commits API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch commits",
        details:
          error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


