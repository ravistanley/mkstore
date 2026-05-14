"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function Newsletter() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus("loading");
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("Newsletter subscription:", email);
        setStatus("success");
        setEmail("");

        setTimeout(() => {
            setStatus("idle");
        }, 5000);
    };

    return (
        <section className="py-20 bg-[#1A1814] text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40 mb-4">
                    Stay connected
                </p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                    Stay in the loop.
                </h2>
                <p className="text-white/50 mb-10 max-w-md mx-auto text-base leading-relaxed">
                    New drops, exclusive deals, and care tips — straight to you. No spam, ever.
                </p>

                <div className="max-w-md mx-auto relative h-14">
                    <form
                        onSubmit={handleSubmit}
                        className={`flex gap-2 absolute inset-0 transition-all duration-400 ${status === "success" ? "opacity-0 pointer-events-none" : "opacity-100"}`}
                    >
                        <input
                            type="email"
                            placeholder="Your email address"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={status === "loading"}
                            className="flex-1 px-4 py-3 rounded-lg bg-white/8 border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/60 transition-all disabled:opacity-50 text-sm"
                        />
                        <button
                            type="submit"
                            disabled={status === "loading" || !email}
                            className="px-5 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[110px] text-sm"
                        >
                            {status === "loading" ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Subscribe"
                            )}
                        </button>
                    </form>

                    <div className={`absolute inset-0 flex items-center justify-center text-emerald-400 transition-all duration-400 ${status === "success" ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="font-medium text-sm">You&apos;re subscribed — thanks!</span>
                        </div>
                    </div>
                </div>

                <p className="text-[11px] text-white/25 mt-6">
                    By subscribing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </section>
    );
}
