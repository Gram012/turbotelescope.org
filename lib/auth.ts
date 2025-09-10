// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { upsertUserFromGitHubProfile } from "@/lib/user";
import { SUPER_ADMINS } from "@/lib/authz";

const allowedUsers = ["Gram012", "mssgill", "patkel"]; // keep your allowlist

export const authOptions: NextAuthOptions = {
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    callbacks: {
        async signIn({ profile }) {
            const gh = profile as any;
            const login = (gh?.login || "").toLowerCase();
            if (!login) return false;

            // allowlist gate (keep if you still want this)
            const allowed = allowedUsers.map((u) => u.toLowerCase());
            if (!allowed.includes(login) && !SUPER_ADMINS.has(login)) return false;

            // upsert to DB
            await upsertUserFromGitHubProfile({
                github_id: gh?.id,
                github_login: login,
                name: gh?.name ?? null,
                email: gh?.email ?? null,
                avatar_url: gh?.avatar_url ?? null,
            });

            return true;
        },

        async jwt({ token, account, profile }) {
            if (account && profile) {
                token.login = (profile as any).login?.toLowerCase();
                token.accessToken = account.access_token;
                token.role = SUPER_ADMINS.has(token.login as string) ? "admin" : "user";
            }
            if (!token.role && token.login) {
                token.role = SUPER_ADMINS.has(token.login as string) ? "admin" : "user";
            }
            return token;
        },

        async session({ session, token }) {
            (session.user as any).login = token.login as string;
            (session.user as any).role = token.role as "admin" | "user";
            (session as any).accessToken = token.accessToken as string;
            return session;
        },
    },
};
