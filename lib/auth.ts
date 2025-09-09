import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { upsertUserFromGitHubProfile, getUserByLogin } from "@/lib/user";

const SUPER_ADMINS = new Set(["gram012"]); // 👈 lowercase

export const authOptions: NextAuthOptions = {
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async signIn({ profile }) {
            const gh = profile as any;
            const loginRaw: string | undefined = gh?.login;
            const login = loginRaw?.toLowerCase(); // 👈 normalize
            const gid = gh?.id;

            if (!login) return false;

            // Super admin: always allow (best-effort upsert)
            if (SUPER_ADMINS.has(login)) {
                try {
                    await upsertUserFromGitHubProfile({
                        github_id: gid ?? 0,
                        github_login: login,
                        name: gh?.name ?? null,
                        email: gh?.email ?? null,
                        avatar_url: gh?.avatar_url ?? null,
                    });
                } catch { }
                return true;
            }

            if (gid) {
                const u = await upsertUserFromGitHubProfile({
                    github_id: gid,
                    github_login: login,
                    name: gh?.name ?? null,
                    email: gh?.email ?? null,
                    avatar_url: gh?.avatar_url ?? null,
                });
                return u.is_active;
            }

            const existing = await getUserByLogin(login);
            return existing?.is_active ?? false;
        },

        async jwt({ token, account, profile }) {
            if (account?.access_token) token.accessToken = account.access_token;
            if ((profile as any)?.login) token.login = (profile as any).login.toLowerCase(); // 👈 normalize

            // Super admin: force admin/active on the JWT
            const login = typeof token.login === "string" ? token.login : undefined;
            if (login && SUPER_ADMINS.has(login)) {
                token.role = "admin";
                token.isActive = true;
                return token;
            }

            if (login) {
                try {
                    const u = await getUserByLogin(login);
                    if (u) {
                        token.role = u.role;
                        token.isActive = u.is_active;
                    }
                } catch { }
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                (session.user as any).login = token.login as string | undefined;
                const login = (token.login as string | undefined) ?? "";
                const isSuper = SUPER_ADMINS.has(login);
                (session.user as any).role = (token.role as "admin" | "user") ?? (isSuper ? "admin" : "user");
                (session.user as any).isActive = (token.isActive as boolean | undefined) ?? isSuper;
            }
            (session as any).accessToken = token.accessToken as string | undefined;
            return session;
        },
    },
};
