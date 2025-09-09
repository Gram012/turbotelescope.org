"use client";

import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2, RotateCcw } from "lucide-react";

type GitHubIssue = {
  id: number;
  number: number; // required to close
  title: string;
  user: { login: string };
  created_at: string;
  html_url: string;
};

type GitHubIssuesProps = {
  owner: string;
  repo: string;
  limit?: number;
};

// Represents a scheduled close the user can undo
type PendingClose = {
  key: string;
  issue: GitHubIssue;
  deadline: number; // epoch ms when it will fire
  duration: number; // ms total
  timeoutId: number; // window.setTimeout id
};

export function GitHubIssues({ owner, repo, limit = 100 }: GitHubIssuesProps) {
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingClose[]>([]);
  const [now, setNow] = useState<number>(Date.now()); // for progress bars
  const tickRef = useRef<number | null>(null);

  // Fetch issues (already filtered to signed-in user on the server)
  useEffect(() => {
    async function fetchIssues() {
      try {
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

  // Progress ticker for countdown bars
  useEffect(() => {
    function tick() {
      setNow(Date.now());
      tickRef.current = requestAnimationFrame(tick);
    }
    tickRef.current = requestAnimationFrame(tick);
    return () => {
      if (tickRef.current) cancelAnimationFrame(tickRef.current);
    };
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      pending.forEach((p) => clearTimeout(p.timeoutId));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Schedule a close with undo window
  const scheduleClose = (issue: GitHubIssue, delayMs = 10000) => {
    // Optimistically hide from list
    setIssues((prev) => prev.filter((i) => i.number !== issue.number));

    const deadline = Date.now() + delayMs;
    const key = `${issue.number}-${deadline}`;

    const timeoutId = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/github-issues/close`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ issueNumber: issue.number }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || "Failed to close issue");
        }
        // Success: drop the pending toast
        setPending((prev) => prev.filter((p) => p.key !== key));
      } catch (e: any) {
        // Failure: restore issue and surface error
        setIssues((prev) => [issue, ...prev]);
        setPending((prev) => prev.filter((p) => p.key !== key));
        setError(e.message || "Failed to close issue");
      }
    }, delayMs);

    setPending((prev) => [
      ...prev,
      { key, issue, deadline, duration: delayMs, timeoutId },
    ]);
  };

  // Undo a scheduled close
  const undoClose = (key: string) => {
    const entry = pending.find((p) => p.key === key);
    if (!entry) return;
    clearTimeout(entry.timeoutId);
    // Restore the issue to the list (at the top)
    setIssues((prev) => [entry.issue, ...prev]);
    setPending((prev) => prev.filter((p) => p.key !== key));
  };

  return (
    <>
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
                  issue={issue}
                  onClose={() => scheduleClose(issue)}
                />
              ))}
              {issues.length === 0 && pending.length === 0 && (
                <p className="text-sm text-slate-500">No open issues.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Corner toasts for UNDO */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        {pending.map((p) => {
          const remaining = Math.max(0, p.deadline - now);
          const pct =
            p.duration > 0
              ? 100 - Math.round((remaining / p.duration) * 100)
              : 100;

          return (
            <div
              key={p.key}
              className="w-80 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden"
              role="status"
              aria-live="polite"
            >
              <div className="p-3 flex items-start gap-3">
                <div className="mt-0.5">
                  <Check className="w-4 h-4 text-slate-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    Issue scheduled to close
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    #{p.issue.number} — {p.issue.title}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => undoClose(p.key)}
                  title="Undo"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              {/* Countdown bar */}
              <div className="h-1 bg-slate-100">
                <div
                  className="h-full bg-slate-800 transition-[width] duration-100 ease-linear"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function IssueRow({
  issue,
  onClose,
}: {
  issue: GitHubIssue;
  onClose: () => void | Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const handleClose = async () => {
    setLoading(true);
    try {
      await onClose();
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
