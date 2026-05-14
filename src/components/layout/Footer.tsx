"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Instagram, Twitter, MessageCircle } from "lucide-react";

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
    return (
        <footer className="bg-[#1A1814] text-white/60 border-t border-white/8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">

                    {/* Brand */}
                    <div className="space-y-5 lg:col-span-4">
                        <Link href="/" className="inline-flex items-center gap-2.5 group">
                            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                                <span className="text-white font-bold text-xs">Mk</span>
                            </div>
                            <span className="font-bold text-lg text-white tracking-tight">MkStore</span>
                        </Link>
                        <p className="text-sm leading-relaxed text-white/45 max-w-xs">
                            Premium tech accessories for the modern professional. Quality products,
                            fast delivery, trusted service across Kenya.
                        </p>
                        <div className="flex items-center gap-3 pt-1">
                            <a href="#" className="w-8 h-8 rounded-lg bg-white/6 hover:bg-white/12 flex items-center justify-center transition-colors">
                                <Instagram className="w-3.5 h-3.5" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-lg bg-white/6 hover:bg-white/12 flex items-center justify-center transition-colors">
                                <Twitter className="w-3.5 h-3.5" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-lg bg-white/6 hover:bg-white/12 flex items-center justify-center transition-colors">
                                <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>

                    {/* Shop */}
                    <div className="lg:col-span-2">
                        <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-5">Shop</h4>
                        <ul className="space-y-3">
                            {footerLinks.shop.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-white/45 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="lg:col-span-2">
                        <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-5">Company</h4>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.href + link.label}>
                                    <Link href={link.href} className="text-sm text-white/45 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="lg:col-span-4 space-y-4">
                        <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-5">Get in touch</h4>
                        <div className="space-y-3 text-sm text-white/45">
                            <a href="tel:+254700000000" className="flex items-center gap-3 hover:text-white transition-colors">
                                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>+254 700 000 000</span>
                            </a>
                            <a href="mailto:hello@mkstore.co.ke" className="flex items-center gap-3 hover:text-white transition-colors">
                                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>hello@mkstore.co.ke</span>
                            </a>
                            <div className="flex items-center gap-3">
                                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>Nairobi, Kenya</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-14 pt-8 border-t border-white/8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-white/30">
                        © {new Date().getFullYear()} MkStore. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-xs text-white/40 font-medium">M-Pesa accepted</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
