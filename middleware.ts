// middleware.ts
import { withAuth, type NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const SUPER_ADMINS = new Set(["Gram012"]);

export default withAuth(
    function middleware(req: NextRequestWithAuth) {
        const { nextUrl } = req;
        const path = nextUrl.pathname;

        // Token is available via req.nextauth.token thanks to withAuth
        const token = req.nextauth.token as
            | (Record<string, unknown> & { login?: string; role?: "admin" | "user"; isActive?: boolean })
            | null;

        // If there's no token, withAuth will redirect to signIn because authorized() returns false.
        if (!token) return NextResponse.next();

        const login = token.login;
        const role = token.role;
        const isActive = token.isActive;
        const isAdmin = (login && SUPER_ADMINS.has(login)) || role === "admin";

        // Admin area: admins only
        if (path.startsWith("/admin")) {
            if (!isAdmin) {
                const url = nextUrl.clone();
                url.pathname = "/dashboard";
                url.search = "";
                return NextResponse.redirect(url);
            }
            return NextResponse.next();
        }

        // User dashboard: active users OR super admin
        if (path.startsWith("/dashboard")) {
            if (isAdmin || isActive) return NextResponse.next();
            const url = nextUrl.clone();
            url.pathname = "/access-pending";
            url.search = "";
            return NextResponse.redirect(url);
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            // Only allow requests that have a session token;
            // fine-grained checks/redirects happen in the middleware function above.
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/api/auth/signin",
        },
    }
);

// Protect these routes
export const config = {
    matcher: ["/dashboard/:path*", "/admin/:path*"],
};
