import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

// Parse comma-separated list of GitHub usernames
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
            if (!githubProfile?.login) return false;

            const allowedUsers = getAllowedUsers();
            return allowedUsers.includes(githubProfile.login);
        },

        async jwt({ token, account, profile }) {
            if (account && profile) {
                token.accessToken = account.access_token;
                token.login = (profile as any).login;
            }

            const allowedUsers = getAllowedUsers();
            if (typeof token.login === "string") {
                token.role = allowedUsers.includes(token.login) ? "admin" : "user";
            } else {
                token.role = "user";
            }

            return token;
        },

        async session({ session, token }) {
            session.accessToken = token.accessToken as string;
            session.user.login = token.login as string;
            session.user.role = token.role as "admin" | "user";
            return session;
        },
    },
});
