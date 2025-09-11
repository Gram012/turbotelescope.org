import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = (req as any).nextauth?.token as any | undefined;
        const path = req.nextUrl.pathname;

        // Require sign-in for dashboard/admin
        if (!token && (path.startsWith("/dashboard") || path.startsWith("/admin"))) {
            return NextResponse.redirect(new URL("/unauthorized", req.url));
        }

        // Admin-only routes
        if (path.startsWith("/admin")) {
            const login = (token?.login || "").toLowerCase();
            const isAdmin = token?.role === "admin" || login === "gram012";
            if (!isAdmin) {
                return NextResponse.redirect(new URL("/unauthorized", req.url));
            }
        }

        // No is_active gating here; signIn() already restricts who can log in
        return NextResponse.next();
    },
    {
        // Always decode the JWT so we can inspect token fields above
        callbacks: { authorized: () => true },
    }
);

export const config = {
    matcher: ["/dashboard/:path*", "/admin/:path*"],
};
