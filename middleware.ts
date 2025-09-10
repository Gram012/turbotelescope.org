// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
    callbacks: {
        authorized: ({ token, req }) => {
            const path = req.nextUrl.pathname;

            // not signed in → block dashboard/admin
            if (!token && (path.startsWith("/dashboard") || path.startsWith("/admin"))) {
                return false;
            }

            // admin-only routes
            if (path.startsWith("/admin")) {
                const role = (token as any)?.role;
                const login = ((token as any)?.login || "").toLowerCase();
                return role === "admin" || login === "gram012";
            }

            return true;
        },
    },
});

export const config = {
    matcher: ["/dashboard/:path*", "/admin/:path*"],
};
