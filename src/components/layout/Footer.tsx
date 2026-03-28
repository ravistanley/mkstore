import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

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
        <footer className="bg-mk-dark text-white/70">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">Mk</span>
                            </div>
                            <span className="font-semibold text-lg text-white">MkStore</span>
                        </div>
                        <p className="text-sm leading-relaxed">
                            Premium tech accessories for the modern Kenyan. Quality products,
                            fast delivery, trusted service.
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-primary" />
                                <span>+254 700 000 000</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-primary" />
                                <span>hello@mkstore.co.ke</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span>Nairobi, Kenya</span>
                            </div>
                        </div>
                    </div>

                    {/* Shop */}
                    <div>
                        <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">
                            Shop
                        </h4>
                        <ul className="space-y-2.5">
                            {footerLinks.shop.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">
                            Company
                        </h4>
                        <ul className="space-y-2.5">
                            {footerLinks.company.map((link) => (
                                <li key={link.href + link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">
                            Support
                        </h4>
                        <ul className="space-y-2.5">
                            {footerLinks.support.map((link) => (
                                <li key={link.href + link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-white/40">
                        © {new Date().getFullYear()} MkStore. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-xs text-white/40">
                        <span>M-Pesa Accepted</span>
                        <span>•</span>
                        <span>Fast Delivery Across Kenya</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
