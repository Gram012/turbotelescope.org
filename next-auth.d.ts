import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        accessToken?: string;
        user: {
            name?: string;
            email?: string;
            image?: string;
            login?: string;
            role?: "admin" | "user";
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        login?: string;
        role?: "admin" | "user";
    }
}
