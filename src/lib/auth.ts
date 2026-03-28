import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "./db";
import { adminUsers } from "./db/schema";
import { eq } from "drizzle-orm";

const SESSION_COOKIE_NAME = "mk_admin_session";
const SESSION_MAX_AGE = 10 * 60; // 10 minutes in seconds

// Rate limiting
const loginAttempts = new Map<
    string,
    { count: number; lastAttempt: number; lockedUntil: number }
>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function checkRateLimit(email: string): {
    allowed: boolean;
    remainingAttempts: number;
    lockedUntil?: number;
} {
    const now = Date.now();
    const attempts = loginAttempts.get(email);

    if (!attempts) {
        return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
    }

    if (attempts.lockedUntil > now) {
        return {
            allowed: false,
            remainingAttempts: 0,
            lockedUntil: attempts.lockedUntil,
        };
    }

    // Reset if lockout has expired
    if (attempts.lockedUntil && attempts.lockedUntil <= now) {
        loginAttempts.delete(email);
        return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
    }

    return {
        allowed: attempts.count < MAX_ATTEMPTS,
        remainingAttempts: MAX_ATTEMPTS - attempts.count,
    };
}

export function recordLoginAttempt(email: string, success: boolean) {
    if (success) {
        loginAttempts.delete(email);
        return;
    }

    const attempts = loginAttempts.get(email) || {
        count: 0,
        lastAttempt: 0,
        lockedUntil: 0,
    };

    attempts.count += 1;
    attempts.lastAttempt = Date.now();

    if (attempts.count >= MAX_ATTEMPTS) {
        attempts.lockedUntil = Date.now() + LOCKOUT_DURATION;
    }

    loginAttempts.set(email, attempts);
}

// Simple token-based session (no JWT dependency needed)
function generateSessionToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

// In-memory session store (in production, use Redis or DB)
const sessions = new Map<string, { email: string; expiresAt: number }>();

export async function createAdminSession(email: string): Promise<string> {
    const token = generateSessionToken();
    sessions.set(token, {
        email,
        expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE,
        path: "/",
    });

    return token;
}

export async function getAdminSession(): Promise<{
    email: string;
} | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return null;

    const session = sessions.get(token);
    if (!session) return null;

    if (session.expiresAt < Date.now()) {
        sessions.delete(token);
        return null;
    }

    // Extend session on activity
    session.expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
    sessions.set(token, session);

    return { email: session.email };
}

export async function destroyAdminSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
        sessions.delete(token);
    }

    cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function validateAdminCredentials(
    email: string,
    password: string
): Promise<boolean> {
    // Check env credentials first
    const envEmail = process.env.ADMIN_EMAIL;
    const envPassword = process.env.ADMIN_PASSWORD;

    if (envEmail && envPassword) {
        if (email === envEmail && password === envPassword) {
            return true;
        }
    }

    // Fallback to DB users
    try {
        const [user] = await db
            .select()
            .from(adminUsers)
            .where(eq(adminUsers.email, email))
            .limit(1);

        if (!user) return false;
        return verifyPassword(password, user.passwordHash);
    } catch {
        // DB might not be connected yet
        return false;
    }
}
