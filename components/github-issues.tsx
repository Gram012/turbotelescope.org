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
import { MoreHorizontal } from "lucide-react";

type GitHubIssue = {
  id: number;
  title: string;
  user: {
    login: string;
  };
  created_at: string;
  html_url: string;
};

type GitHubIssuesProps = {
  owner: string;
  repo: string;
  limit?: number;
};

export function GitHubIssues({ owner, repo, limit = 100 }: GitHubIssuesProps) {
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIssues() {
      try {
        const res = await fetch(
          `/api/github-issues?owner=${owner}&repo=${repo}`,
          { credentials: "include" }
        );

        if (!res.ok) throw new Error("Failed to fetch issues");
        const data = await res.json();
        setIssues(data.slice(0, limit));
      } catch (err: any) {
        setError(err.message || "Unknown error");
      }
    }

    fetchIssues();
  }, [owner, repo, limit]);

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
          <Button variant="outline" size="sm">
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
              <div
                key={issue.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900 truncate max-w-xs">
                    <a
                      href={issue.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {issue.title}
                    </a>
                  </p>
                  <p className="text-xs text-slate-500">
                    Opened by {issue.user.login} on{" "}
                    {new Date(issue.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
