"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, CreditCard } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

export default function Hero() {
    return (
        <section className="relative overflow-hidden bg-mk-gray pt-16 md:pt-24 lg:pt-32 pb-16">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-mk-purple/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                    {/* Text Content */}
                    <div className="max-w-2xl animate-slide-in-right">
                        <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wide mb-6">
                            New Collection 2024
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-mk-dark mb-6 leading-tight">
                            Elevate Your <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-mk-purple-light">
                                Tech Aesthetic
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg">
                            Premium accessories designed for the modern professional. Protect your devices with style, crafted for the Kenyan lifestyle.
                        </p>

                        <div className="flex flex-wrap items-center gap-4">
                            <Link href="/shop" className={buttonVariants({ size: "lg", className: "h-14 px-8 text-base rounded-xl gap-2" })}>
                                Shop Now
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link href="/category/macbook-covers" className={buttonVariants({ variant: "outline", size: "lg", className: "h-14 px-8 text-base rounded-xl" })}>
                                View Mac Accessories
                            </Link>
                        </div>

                        {/* Trust Badges */}
                        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-border/50 pt-8">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Truck className="w-5 h-5 text-primary" />
                                <span>Fast Delivery in Kenya</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                                <span>Premium Quality</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <CreditCard className="w-5 h-5 text-primary" />
                                <span>Secure M-Pesa</span>
                            </div>
                        </div>
                    </div>

                    {/* Hero Image */}
                    <div className="relative aspect-square lg:aspect-[4/3] rounded-3xl overflow-hidden bg-white/50 border border-white/20 shadow-2xl animate-fade-in shadow-mk-purple/10">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-3/4 h-3/4 relative animate-scale-in" style={{ animationDelay: "0.2s" }}>
                                {/* Placeholder for actual hero image */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-mk-gray to-white rounded-2xl shadow-lg border border-border/50 flex flex-col items-center justify-center p-8 text-center rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                                    <div className="w-24 h-24 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-4xl">💻</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-mk-dark mb-2">Premium Tech Setup</h3>
                                    <p className="text-muted-foreground">Minimalist desk accessories and premium device protection.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
