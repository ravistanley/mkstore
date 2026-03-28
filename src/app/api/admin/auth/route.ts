import { NextRequest, NextResponse } from "next/server";
import {
    validateAdminCredentials,
    createAdminSession,
    destroyAdminSession,
    checkRateLimit,
    recordLoginAttempt,
} from "@/lib/auth";
import { adminLoginSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = adminLoginSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 400 }
            );
        }

        const { email, password } = parsed.data;

        // Check rate limit
        const rateLimit = checkRateLimit(email);
        if (!rateLimit.allowed) {
            const retryAfter = rateLimit.lockedUntil
                ? Math.ceil((rateLimit.lockedUntil - Date.now()) / 1000 / 60)
                : 15;
            return NextResponse.json(
                {
                    error: `Too many login attempts. Try again in ${retryAfter} minutes.`,
                },
                { status: 429 }
            );
        }

        const valid = await validateAdminCredentials(email, password);

        if (!valid) {
            recordLoginAttempt(email, false);
            return NextResponse.json(
                {
                    error: "Invalid credentials",
                    remainingAttempts: rateLimit.remainingAttempts - 1,
                },
                { status: 401 }
            );
        }

        recordLoginAttempt(email, true);
        await createAdminSession(email);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Admin auth error:", error);
        return NextResponse.json(
            { error: "Authentication failed" },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    try {
        await destroyAdminSession();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Admin logout error:", error);
        return NextResponse.json(
            { error: "Logout failed" },
            { status: 500 }
        );
    }
}
