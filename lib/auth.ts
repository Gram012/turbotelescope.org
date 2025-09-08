// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

const allowedUsers = ["Gram012", "mssgill", "patkel"];

export const authOptions: NextAuthOptions = {
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,   // make sure these envs exist
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            // Optional: request scopes if you want *user-scoped* GitHub API calls
            // authorization: { params: { scope: "read:user repo" } },
        }),
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async signIn({ profile }) {
            const login = (profile as any)?.login;
            if (!login) return false;
            return allowedUsers.includes(login);
        },
        async jwt({ token, account, profile }) {
            if (account?.access_token) token.accessToken = account.access_token;
            if ((profile as any)?.login) token.login = (profile as any).login;
            token.role = allowedUsers.includes(token.login as string) ? "admin" : "user";
            return token;
        },
        async session({ session, token }) {
            (session as any).accessToken = token.accessToken as string | undefined;
            if (session.user) {
                (session.user as any).login = token.login as string | undefined;
                (session.user as any).role = token.role as "admin" | "user";
            }
            return session;
        },
    },
};
