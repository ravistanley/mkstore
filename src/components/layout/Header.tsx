"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, Search, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";

const navLinks = [
    { href: "/shop", label: "Shop" },
    {
        label: "Categories",
        children: [
            { href: "/category/laptop-sleeves", label: "Laptop Sleeves" },
            { href: "/category/macbook-covers", label: "MacBook Covers" },
            { href: "/category/phone-cases", label: "Phone Cases" },
            { href: "/category/phone-charms", label: "Phone Charms" },
            { href: "/category/screen-protectors", label: "Screen Protectors" },
            { href: "/category/desk-accessories", label: "Desk Accessories" },
            { href: "/category/cable-organizers", label: "Cable Organizers" },
        ],
    },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
];

export default function Header() {
    const { itemCount, openCart } = useCart();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">Mk</span>
                        </div>
                        <span className="font-semibold text-lg tracking-tight text-foreground">
                            MkStore
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) =>
                            link.children ? (
                                <div
                                    key={link.label}
                                    className="relative"
                                    onMouseEnter={() => setDropdownOpen(true)}
                                    onMouseLeave={() => setDropdownOpen(false)}
                                >
                                    <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                        {link.label}
                                        <ChevronDown className="w-3.5 h-3.5" />
                                    </button>
                                    {dropdownOpen && (
                                        <div className="absolute top-full left-0 pt-2 animate-scale-in">
                                            <div className="bg-white rounded-xl shadow-lg border border-border/50 py-2 min-w-[200px]">
                                                {link.children.map((child) => (
                                                    <Link
                                                        key={child.href}
                                                        href={child.href}
                                                        className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                                                    >
                                                        {child.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    key={link.href}
                                    href={link.href!}
                                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {link.label}
                                </Link>
                            )
                        )}
                    </nav>

                    {/* Right actions */}
                    <div className="flex items-center gap-3">
                        <Link href="/shop">
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                                <Search className="w-5 h-5" />
                            </Button>
                        </Link>

                        <button
                            onClick={openCart}
                            className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {itemCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                                    {itemCount}
                                </span>
                            )}
                        </button>

                        {/* Mobile menu toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            {mobileOpen && (
                <div className="md:hidden border-t border-border/50 bg-white animate-fade-in">
                    <div className="px-4 py-4 space-y-1">
                        {navLinks.map((link) =>
                            link.children ? (
                                <div key={link.label} className="space-y-1">
                                    <span className="block px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        {link.label}
                                    </span>
                                    {link.children.map((child) => (
                                        <Link
                                            key={child.href}
                                            href={child.href}
                                            className="block px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            {child.label}
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <Link
                                    key={link.href}
                                    href={link.href!}
                                    className="block px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            )
                        )}
                        <Link
                            href="/track-order"
                            className="block px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                            onClick={() => setMobileOpen(false)}
                        >
                            Track Order
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
