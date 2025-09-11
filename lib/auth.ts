// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { getUserByLogin, upsertUserFromGitHubProfile } from "@/lib/user";
import { SUPER_ADMINS } from "@/lib/authz";

export const authOptions: NextAuthOptions = {
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    callbacks: {
        // 1) Only allow if SUPER_ADMIN or user exists in DB and is_active
        async signIn({ profile }) {
            const gh = profile as any;
            const login = (gh?.login || "").toLowerCase();
            if (!login) return false;

            if (SUPER_ADMINS.has(login)) {
                // keep super-admin bypass (bootstrap)
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
            if (!dbUser || !dbUser.is_active) {
                // Not invited/activated
                return false;
            }

            // Update profile info and last_login_at
            await upsertUserFromGitHubProfile({
                github_id: gh?.id,
                github_login: login,
                name: gh?.name ?? null,
                email: gh?.email ?? null,
                avatar_url: gh?.avatar_url ?? null,
            });
            return true;
        },

        // 2) Put role/is_active into the JWT (so middleware can use it)
        async jwt({ token }) {
            const login = ((token as any)?.login || (token as any)?.name || "").toLowerCase();
            (token as any).login = login;

            // SUPER_ADMIN takes priority
            if (SUPER_ADMINS.has(login)) {
                (token as any).role = "admin";
                (token as any).is_active = true;
                return token;
            }

            // Pull latest from DB (so role changes apply next request)
            if (login) {
                const dbUser = await getUserByLogin(login);
                (token as any).role = (dbUser?.role as "admin" | "user") ?? "user";
                (token as any).is_active = dbUser?.is_active ?? false;
            }
            return token;
        },

        // 3) Expose on session
        async session({ session, token }) {
            (session.user as any).login = (token as any).login as string;
            (session.user as any).role = (token as any).role as "admin" | "user";
            (session as any).is_active = (token as any).is_active as boolean;
            return session;
        },
    },
};
