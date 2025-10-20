import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import {
    getUserByLogin,
    getUserByGitHubId,
    upsertUserFromGitHubProfile,
} from "@/lib/user";
import { SUPER_ADMINS } from "@/lib/authz";

export const authOptions: NextAuthOptions = {
    session: { strategy: "jwt" },
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

            if (SUPER_ADMINS.has(login)) {
                await upsertUserFromGitHubProfile({
                    github_id: gh?.id,
                    github_login: login,
                    name: gh?.name ?? null,
                    email: gh?.email ?? null,
                    avatar_url: gh?.avatar_url ?? null,
                });
                return true;
            }

            const dbUser = await getUserByLogin(login);
            if (!dbUser || !dbUser.is_active) return false;

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
                const login = (profile as any)?.login?.toLowerCase();
                if (login) token.login = login;
                if ((account as any).access_token) {
                    (token as any).accessToken = (account as any).access_token;
                }
            }

            if (!token.login && token.sub) {
                const ghId = Number(token.sub);
                if (!Number.isNaN(ghId)) {
                    const dbUser = await getUserByGitHubId(ghId);
                    if (dbUser?.github_login) token.login = dbUser.github_login.toLowerCase();
                }
            }

            const login = (token as any)?.login as string | undefined;
            if (login) {
                if (SUPER_ADMINS.has(login)) {
                    (token as any).role = "admin";
                    (token as any).is_active = true;
                } else {
                    const dbUser = await getUserByLogin(login);
                    (token as any).role = (dbUser?.role as "admin" | "user") ?? "user";
                    (token as any).is_active = dbUser?.is_active ?? false;
                }
            }

            return token;
        },

        async session({ session, token }) {
            (session.user as any).login = ((token as any)?.login || "").toLowerCase();
            (session.user as any).role = ((token as any)?.role || "user") as "admin" | "user";
            (session as any).is_active = (token as any)?.is_active ?? false;
            (session as any).accessToken = (token as any)?.accessToken;
            return session;
        },
    },
};
