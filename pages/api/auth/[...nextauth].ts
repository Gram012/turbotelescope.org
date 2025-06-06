import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

function getAllowedUsers(): string[] {
    return process.env.ALLOWED_USERS?.split(",").map((u) => u.trim()) ?? [];
}

export default NextAuth({
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ profile }) {
            const githubProfile = profile as { login?: string };
            if (!githubProfile?.login) {
                console.warn("[NextAuth] signIn denied: missing GitHub login in profile.");
                return false;
            }

            const login = githubProfile.login.toLowerCase();
            const allowedUsers = getAllowedUsers().map((u) => u.toLowerCase());

            const allowed = allowedUsers.includes(login);
            console.log(`[NextAuth] signIn attempt by "${login}" — ${allowed ? "ALLOWED" : "DENIED"}`);

            return allowed;
        },

        async jwt({ token, account, profile }) {
            if (account && profile) {
                token.accessToken = account.access_token;
                token.login = (profile as any).login;
                console.log(`[NextAuth] jwt: login="${token.login}" assigned access token.`);
            }

            const allowedUsers = getAllowedUsers().map((u) => u.toLowerCase());
            const login = typeof token.login === "string" ? token.login.toLowerCase() : "";

            token.role = allowedUsers.includes(login) ? "admin" : "user";
            console.log(`[NextAuth] jwt: login="${login}" assigned role="${token.role}"`);

            return token;
        },

        async session({ session, token }) {
            session.accessToken = token.accessToken as string;
            session.user.login = token.login as string;
            session.user.role = token.role as "admin" | "user";

            console.log(
                `[NextAuth] session: ${session.user.login} (${session.user.role}) session initialized.`
            );

            return session;
        },
    },
});
