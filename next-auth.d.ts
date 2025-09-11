import "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            name?: string | null;
            email?: string | null;
            image?: string | null;
            login: string;
            role: "admin" | "user";
        };
        is_active?: boolean;
        accessToken?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        login?: string;
        role?: "admin" | "user";
        is_active?: boolean;
        accessToken?: string;
    }
}
