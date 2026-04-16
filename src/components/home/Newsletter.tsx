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
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("Newsletter subscription:", email);
        
        setStatus("success");
        setEmail("");

        // Reset after 3 seconds
        setTimeout(() => {
            setStatus("idle");
        }, 5000);
    };

    return (
        <section className="py-20 bg-mk-dark text-white relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <h2 className="text-3xl font-bold tracking-tight mb-4">
                    Join the MkStore Community
                </h2>
                <p className="text-white/70 mb-8 max-w-xl mx-auto">
                    Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
                </p>

                <div className="max-w-md mx-auto relative h-16">
                    <form 
                        onSubmit={handleSubmit}
                        className={`flex flex-col sm:flex-row gap-3 absolute inset-0 transition-all duration-500 ${status === "success" ? "opacity-0 translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"}`}
                    >
                        <input
                            type="email"
                            placeholder="Enter your email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={status === "loading"}
                            className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={status === "loading" || !email}
                            className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
                        >
                            {status === "loading" ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Subscribe"
                            )}
                        </button>
                    </form>

                    {/* Success State */}
                    <div className={`absolute inset-0 flex items-center justify-center text-emerald-400 bg-white/5 border border-emerald-500/30 rounded-xl backdrop-blur-sm transition-all duration-500 ${status === "success" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-medium">Thanks for subscribing!</span>
                        </div>
                    </div>
                </div>

                <p className="text-xs text-white/40 mt-6">
                    By subscribing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </section>
    );
}
