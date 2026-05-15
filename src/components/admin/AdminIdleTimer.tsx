"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";

const IDLE_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes of inactivity
const WARN_BEFORE_MS = 30 * 1000;       // show warning 30s before logout

const ACTIVITY_EVENTS = [
    "mousemove",
    "mousedown",
    "keydown",
    "touchstart",
    "scroll",
    "click",
];

export default function AdminIdleTimer() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [showWarning, setShowWarning] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(30);
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const clearTimers = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
    }, []);

    const logout = useCallback(async () => {
        clearTimers();
        setShowWarning(false);
        try {
            await fetch("/api/admin/auth", { method: "DELETE" });
        } catch {
            // best effort
        }
        router.replace("/mk-admin-portal/login?reason=idle");
    }, [router, clearTimers]);

    const resetTimer = useCallback(() => {
        clearTimers();
        setShowWarning(false);

        // Show warning 30s before logout
        warnTimerRef.current = setTimeout(() => {
            setShowWarning(true);
            setSecondsLeft(30);
            countdownRef.current = setInterval(() => {
                setSecondsLeft((s) => {
                    if (s <= 1) return 0;
                    return s - 1;
                });
            }, 1000);
        }, IDLE_TIMEOUT_MS - WARN_BEFORE_MS);

        // Actually log out after full timeout
        timerRef.current = setTimeout(logout, IDLE_TIMEOUT_MS);
    }, [clearTimers, logout]);

    useEffect(() => {
        setMounted(true);
        // Start the idle timer immediately
        resetTimer();

        // Attach activity listeners
        ACTIVITY_EVENTS.forEach((event) =>
            window.addEventListener(event, resetTimer, { passive: true })
        );

        return () => {
            clearTimers();
            ACTIVITY_EVENTS.forEach((event) =>
                window.removeEventListener(event, resetTimer)
            );
        };
    }, [resetTimer, clearTimers]);

    if (!mounted || !showWarning) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-card border border-border rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-foreground">Session Expiring Soon</h2>
                    <p className="text-muted-foreground text-sm mt-2">
                        You've been inactive for a while. For security, you'll be logged out in:
                    </p>
                </div>
                <div className="text-5xl font-bold text-amber-500 tabular-nums">
                    {secondsLeft}s
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                        onClick={logout}
                        className="h-11 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                    >
                        Log Out Now
                    </button>
                    <button
                        onClick={resetTimer}
                        className="h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Stay Logged In
                    </button>
                </div>
            </div>
        </div>
    );
}
