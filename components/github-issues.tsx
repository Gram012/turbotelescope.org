"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";

type GitHubIssue = {
  id: number;
  number: number; // 👈 needed to close by issue number
  title: string;
  user: { login: string };
  created_at: string;
  html_url: string;
};

type GitHubIssuesProps = {
  owner: string; // kept for display text
  repo: string; // kept for display text
  limit?: number;
};

export function GitHubIssues({ owner, repo, limit = 100 }: GitHubIssuesProps) {
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIssues() {
      try {
        // Server route is hardcoded to the repo & filters to the signed-in user
        const res = await fetch(`/api/github-issues`, {
          credentials: "include",
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            `${res.status} ${res.statusText}: ${body?.error || "Failed"} ${
              body?.details || ""
            }`
          );
        }

        const data: GitHubIssue[] = await res.json();
        setIssues(data.slice(0, limit));
      } catch (err: any) {
        setError(err.message || "Unknown error");
      }
    }

    fetchIssues();
  }, [limit]);

  const closeIssue = async (issueNumber: number) => {
    // Optimistic UI: remove first, revert on failure
    const prev = issues;
    setIssues((cur) => cur.filter((i) => i.number !== issueNumber));

    try {
      const res = await fetch(`/api/github-issues/close`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueNumber }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to close issue");
      }
    } catch (e: any) {
      // revert on error + surface message
      setIssues(prev);
      setError(e.message || "Failed to close issue");
    }
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your GitHub Issues</CardTitle>
            <CardDescription>
              From {owner}/{repo}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a
              href={`https://github.com/${owner}/${repo}/issues`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View All
            </a>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {error ? (
          <p className="text-red-600 text-sm">{error}</p>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => (
              <IssueRow
                key={issue.id}
                issue={issue as GitHubIssue}
                onClose={(n) =>
                  setIssues((prev) => prev.filter((i) => i.number !== n))
                }
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function IssueRow({
  issue,
  onClose,
}: {
  issue: GitHubIssue;
  onClose: (issueNumber: number) => Promise<void> | void;
}) {
  const [loading, setLoading] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);

  const handleClose = async () => {
    setRowError(null);
    setLoading(true);
    try {
      await onClose(issue.number);
    } catch (e: any) {
      setRowError(e.message || "Failed to close issue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
      <div>
        <p className="text-sm font-medium text-slate-900 truncate max-w-xs">
          <a href={issue.html_url} target="_blank" rel="noopener noreferrer">
            {issue.title}
          </a>
        </p>
        <p className="text-xs text-slate-500">
          Opened by {issue.user.login} on{" "}
          {new Date(issue.created_at).toLocaleDateString()}
        </p>
        {rowError && <p className="text-xs text-red-600 mt-1">{rowError}</p>}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleClose}
        disabled={loading}
        title="Close issue"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}
