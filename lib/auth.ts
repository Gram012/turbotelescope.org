import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { upsertUserFromGitHubProfile, getUserByLogin } from "@/lib/user";

// Hardcoded super admin(s) – you can add more later if you want.
const SUPER_ADMINS = new Set(["Gram012"]);

export const authOptions: NextAuthOptions = {
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            // If you want user-scoped GitHub API later:
            // authorization: { params: { scope: "read:user repo" } },
        }),
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async signIn({ profile }) {
            const gh = profile as any;
            const login: string | undefined = gh?.login;
            const gid: number | string | undefined = gh?.id;
            if (!login) return false;

            // ✅ Always allow super admin(s)
            if (SUPER_ADMINS.has(login)) {
                // Best-effort: ensure you exist in DB as admin & active
                try {
                    await upsertUserFromGitHubProfile({
                        github_id: gid ?? 0,
                        github_login: login,
                        name: gh?.name ?? null,
                        email: gh?.email ?? null,
                        avatar_url: gh?.avatar_url ?? null,
                    });
                    // You can also promote/activate via an admin API or SQL (see below)
                } catch {
                    // swallow DB errors so you can still sign in
                }
                return true;
            }

            // Everyone else: upsert and gate by is_active
            if (gid) {
                const dbu = await upsertUserFromGitHubProfile({
                    github_id: gid,
                    github_login: login,
                    name: gh?.name ?? null,
                    email: gh?.email ?? null,
                    avatar_url: gh?.avatar_url ?? null,
                });
                return dbu.is_active;
            }

            // Rare fallback if no GitHub id
            const existing = await getUserByLogin(login);
            return existing?.is_active ?? false;
        },

        async jwt({ token, account, profile }) {
            if (account?.access_token) token.accessToken = account.access_token;
            if ((profile as any)?.login) token.login = (profile as any).login;

            // ✅ Force super admin privileges in the token
            if (token.login && SUPER_ADMINS.has(token.login as string)) {
                token.role = "admin";
                token.isActive = true;
                return token;
            }

            // Pull role/active for everyone else from DB
            if (token.login) {
                try {
                    const u = await getUserByLogin(token.login as string);
                    if (u) {
                        token.role = u.role;
                        token.isActive = u.is_active;
                    }
                } catch {
                    // if DB hiccups, leave prior token values
                }
            }
            return token;
        },

        async session({ session, token }) {
            (session as any).accessToken = token.accessToken as string | undefined;
            if (session.user) {
                (session.user as any).login = token.login as string | undefined;
                (session.user as any).role = (token.role as "admin" | "user") ?? (SUPER_ADMINS.has((token.login as string) || "") ? "admin" : "user");
                (session.user as any).isActive = token.isActive ?? SUPER_ADMINS.has((token.login as string) || "");
            }
            return session;
        },
    },
};
