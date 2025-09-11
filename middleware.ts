// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = (req as any).nextauth?.token as any | undefined;
        const path = req.nextUrl.pathname;

        // Not signed in, but trying to access protected areas
        if (!token && (path.startsWith("/dashboard") || path.startsWith("/admin"))) {
            return NextResponse.redirect(new URL("/unauthorized", req.url));
        }

        // Admin-only routes
        if (path.startsWith("/admin")) {
            const isAdmin = token?.role === "admin" || (token?.login || "").toLowerCase() === "gram012";
            if (!isAdmin) {
                return NextResponse.redirect(new URL("/unauthorized", req.url));
            }
        }

        // General dashboard routes (optionally require active)
        if (path.startsWith("/dashboard")) {
            const isAdmin = token?.role === "admin";
            const isActive = token?.is_active === true;
            if (!isAdmin && !isActive) {
                // If you have this page, keep it; otherwise you can also send to /unauthorized
                return NextResponse.redirect(new URL("/access-pending", req.url));
            }
        }

        return NextResponse.next();
    },
    {
        // Always decode the JWT so we can branch above
        callbacks: { authorized: () => true },
    }
);

export const config = {
    matcher: ["/dashboard/:path*", "/admin/:path*"],
};
