import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect admin routes (except login)
    if (
        pathname.startsWith("/mk-admin-portal") &&
        !pathname.startsWith("/mk-admin-portal/login")
    ) {
        const sessionToken = request.cookies.get("mk_admin_session")?.value;

        if (!sessionToken) {
            const loginUrl = new URL("/mk-admin-portal/login", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/mk-admin-portal/:path*"],
};
