import { withAuth, type NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const SUPER_ADMINS = new Set(["gram012"]); // 👈 lowercase

export default withAuth(
    function middleware(req: NextRequestWithAuth) {
        const { nextUrl } = req;
        const path = nextUrl.pathname;
        const token = req.nextauth.token as any;

        if (!token) return NextResponse.next(); // authorized() handles redirect to signIn

        const login = typeof token.login === "string" ? token.login.toLowerCase() : undefined; // 👈 normalize
        const role = token.role as "admin" | "user" | undefined;
        const isActive = token.isActive as boolean | undefined;
        const isAdmin = (login && SUPER_ADMINS.has(login)) || role === "admin";

        if (path.startsWith("/admin")) {
            if (!isAdmin) {
                const url = nextUrl.clone();
                url.pathname = "/dashboard";
                url.search = "";
                return NextResponse.redirect(url);
            }
            return NextResponse.next();
        }

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
            authorized: ({ token }) => !!token, // must be signed in
        },
        pages: { signIn: "/api/auth/signin" },
    }
);

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*"] };
