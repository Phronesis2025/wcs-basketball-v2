"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { useScrollLock } from "@/hooks/useScrollLock";

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

interface CommitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  viewMode: "month" | "day";
  userId?: string | null;
}

export default function CommitsModal({
  isOpen,
  onClose,
  date,
  viewMode,
  userId,
}: CommitsModalProps) {
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen && date) {
      fetchCommits();
    } else {
      setCommits([]);
      setError(null);
    }
  }, [isOpen, date, viewMode, userId]);

  const fetchCommits = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      if (userId) headers["x-user-id"] = userId;

      const response = await fetch(
        `/api/admin/commits/by-date?date=${date}&viewMode=${viewMode}`,
        { headers }
      );

      if (!response.ok) {
        const { extractApiErrorMessage } = await import("@/lib/errorHandler");
        const errorMessage = await extractApiErrorMessage(response);
        throw new Error(errorMessage);
      }

      const { extractApiResponseData } = await import("@/lib/errorHandler");
      const result = await extractApiResponseData<{
        commits: GitHubCommit[];
        count: number;
      }>(response);

      setCommits(result.commits || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load commits");
      setCommits([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatDate = () => {
    try {
      if (viewMode === "month") {
        const dateObj = parseISO(`${date}-01`);
        return format(dateObj, "MMMM yyyy");
      } else {
        const dateObj = parseISO(date);
        return format(dateObj, "MMMM d, yyyy");
      }
    } catch {
      return date;
    }
  };

  const formatCommitDate = (dateStr: string) => {
    try {
      const dateObj = parseISO(dateStr);
      return format(dateObj, "MMM d, yyyy 'at' h:mm a");
    } catch {
      return dateStr;
    }
  };

  const getCommitMessage = (message: string) => {
    // Split by newline to get the first line (subject)
    const lines = message.split("\n");
    return {
      subject: lines[0],
      body: lines.slice(1).filter((line) => line.trim()).join("\n"),
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-2 sm:p-4 z-50 overflow-y-auto pt-20 sm:pt-20">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[calc(100vh-5rem)] sm:max-h-[calc(100vh-5rem)] flex flex-col mx-1 sm:mx-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg z-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 font-inter">
              Development Updates
            </h2>
            <p className="text-sm text-gray-500 font-inter mt-1">{formatDate()}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-400 text-sm font-inter">Loading commits...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-semibold mb-2 font-inter">Error Loading Commits</p>
              <p className="text-red-600 text-sm font-inter">{error}</p>
            </div>
          ) : commits.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 font-inter">No commits found for this period</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-4">
                <p className="text-sm text-gray-500 font-inter">
                  {commits.length} commit{commits.length !== 1 ? "s" : ""} found
                </p>
              </div>
              {commits.map((commit) => {
                const { subject, body } = getCommitMessage(commit.commit.message);
                return (
                  <div
                    key={commit.sha}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 font-inter mb-1">
                          {subject}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 font-inter">
                          <span>{formatCommitDate(commit.commit.author.date)}</span>
                          {commit.author && (
                            <span className="flex items-center gap-1">
                              <span>by</span>
                              {commit.author.avatar_url && (
                                <img
                                  src={commit.author.avatar_url}
                                  alt={commit.author.login}
                                  className="w-4 h-4 rounded-full"
                                />
                              )}
                              <span>{commit.author.login || commit.commit.author.name}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <a
                        href={commit.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 ml-2"
                        title="View on GitHub"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                    {body && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-sm text-gray-700 font-inter whitespace-pre-wrap">
                          {body}
                        </p>
                      </div>
                    )}
                    <div className="mt-2">
                      <span className="text-xs text-gray-400 font-mono font-inter">
                        {commit.sha.substring(0, 7)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

