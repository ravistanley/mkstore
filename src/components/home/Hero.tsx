"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Truck, CreditCard } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative overflow-hidden bg-mk-dark h-[calc(100vh-4rem)] flex flex-col">
            {/* Full-bleed background image */}
            <div className="absolute inset-0">
                <Image
                    src="/hero-banner3.jpg"
                    alt="Premium Tech Accessories"
                    fill
                    sizes="100vw"
                    className="object-cover object-center"
                    priority
                />
                {/* Gradient overlay — left side dark for text, right side shows image */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex items-center max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-xl">
                    {/* Eyebrow — plain, no pill badge */}
                    <p className="text-white/60 text-sm font-medium uppercase tracking-[0.18em] mb-5">
                        Premium Tech Accessories · Kenya
                    </p>

                    {/* Headline — bold, no gradient */}
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-white mb-6">
                        Protect what<br />matters most.
                    </h1>

                    <p className="text-white/80 text-lg md:text-xl leading-relaxed font-light mb-10 max-w-md">
                        Sleeves, cases, and accessories crafted for the everyday professional, delivered across Kenya.
                    </p>

                    <div className="flex flex-wrap items-center gap-4">
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-2 bg-white text-mk-dark font-semibold px-7 py-3.5 rounded-full hover:bg-white/90 transition-colors text-sm group"
                        >
                            Shop Now
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <Link
                            href="/category/macbook-covers"
                            className="inline-flex items-center gap-2 bg-white/10 border border-white/25 text-white font-medium px-7 py-3.5 rounded-full hover:bg-white/20 transition-colors text-sm backdrop-blur-sm"
                        >
                            Mac Accessories
                        </Link>
                    </div>
                </div>
            </div>

            {/* Trust bar — anchored to the bottom of the hero */}
            <div className="relative z-10 border-t border-white/10 bg-black/30 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-wrap items-center gap-6 sm:gap-10">
                        <div className="flex items-center gap-2.5 text-white/70 text-sm">
                            <Truck className="w-4 h-4 text-white/50 flex-shrink-0" />
                            <span>Fast delivery in Kenya</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-white/70 text-sm">
                            <ShieldCheck className="w-4 h-4 text-white/50 flex-shrink-0" />
                            <span>Premium quality</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-white/70 text-sm">
                            <CreditCard className="w-4 h-4 text-white/50 flex-shrink-0" />
                            <span>M-Pesa accepted</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
