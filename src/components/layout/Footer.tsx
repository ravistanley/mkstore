"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Instagram, Twitter, MessageCircle, ArrowUp } from "lucide-react";

const footerLinks = {
    shop: [
        { href: "/category/laptop-sleeves", label: "Laptop Sleeves" },
        { href: "/category/macbook-covers", label: "MacBook Covers" },
        { href: "/category/phone-cases", label: "Phone Cases" },
        { href: "/category/desk-accessories", label: "Desk Accessories" },
    ],
    company: [
        { href: "/about", label: "About Us" },
        { href: "/contact", label: "Contact" },
        { href: "/track-order", label: "Track Order" },
    ],
    support: [
        { href: "/contact", label: "Help Center" },
        { href: "/contact", label: "Shipping Info" },
        { href: "/contact", label: "Returns" },
    ],
};

export default function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-mk-dark text-white/70 relative">
            {/* Scroll to top button */}
            <button 
                onClick={scrollToTop}
                className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-primary hover:bg-primary/90 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:-translate-y-1"
                aria-label="Scroll to top"
            >
                <ArrowUp className="w-5 h-5" />
            </button>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
                    {/* Brand */}
                    <div className="space-y-6 lg:col-span-4">
                        <div className="flex items-center gap-2 group cursor-pointer" onClick={scrollToTop}>
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                                <span className="text-white font-bold text-sm">Mk</span>
                            </div>
                            <span className="font-semibold text-xl text-white group-hover:text-primary transition-colors">MkStore</span>
                        </div>
                        <p className="text-sm leading-relaxed text-white/60 max-w-sm">
                            Premium tech accessories for the modern professional. Quality products,
                            fast delivery, trusted service across Kenya.
                        </p>
                        
                        {/* Social Links Placeholder */}
                        <div className="flex items-center gap-4 pt-2">
                            <a href="#" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center transition-colors text-white">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center transition-colors text-white">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center transition-colors text-white">
                                <MessageCircle className="w-4 h-4" /> {/* WhatsApp */}
                            </a>
                        </div>
                    </div>

                    {/* Shop */}
                    <div className="lg:col-span-2">
                        <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-5">
                            Shop
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.shop.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-white/60 hover:text-primary transition-colors inline-block"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="lg:col-span-2">
                        <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-5">
                            Company
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.href + link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-white/60 hover:text-primary transition-colors inline-block"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="lg:col-span-4 space-y-4">
                        <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-5">
                            Get In Touch
                        </h4>
                        <div className="space-y-4 text-sm text-white/60">
                            <a href="tel:+254700000000" className="flex items-center gap-3 hover:text-white transition-colors group">
                                <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                                    <Phone className="w-4 h-4 text-primary" />
                                </div>
                                <span>+254 700 000 000</span>
                            </a>
                            <a href="mailto:hello@mkstore.co.ke" className="flex items-center gap-3 hover:text-white transition-colors group">
                                <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                                    <Mail className="w-4 h-4 text-primary" />
                                </div>
                                <span>hello@mkstore.co.ke</span>
                            </a>
                            <div className="flex items-center gap-3 group">
                                <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                                    <MapPin className="w-4 h-4 text-primary" />
                                </div>
                                <span>Nairobi, Kenya</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-white/40">
                        © {new Date().getFullYear()} MkStore. All rights reserved.
                    </p>
                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-slow"></div>
                        <span className="text-xs font-medium text-white/80">M-Pesa Accepted Here</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
