import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import fs from "fs/promises";
import path from "path";

// Dynamic user allowlist
async function loadAllowedUsers(): Promise<string[]> {
    try {
        const filePath = path.resolve("config/allowed-users.json");
        const data = await fs.readFile(filePath, "utf8");
        return JSON.parse(data) as string[];
    } catch (err) {
        console.error("Failed to read allowed users list:", err);
        return [];
    }
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

            const allowedUsers = await loadAllowedUsers();
            return allowedUsers.includes(githubProfile.login);
        },

        async jwt({ token, account, profile }) {
            // Add access token and GitHub login info
            if (account && profile) {
                token.accessToken = account.access_token;
                token.login = (profile as any).login;
            }

            // Load role
            const allowedUsers = await loadAllowedUsers();
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
