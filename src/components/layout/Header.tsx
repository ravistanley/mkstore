"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingBag, Search, Menu, X, ChevronDown, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

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
    { href: "/track-order", label: "Track Order" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
];

export default function Header() {
    const { items, openCart } = useCart();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const isActive = (href?: string) => {
        if (!href) return false;
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <header className={`sticky top-0 z-50 bg-white/95 dark:bg-background/95 backdrop-blur-md transition-shadow duration-200 ${scrolled ? "shadow-sm border-b border-border" : "border-b border-transparent"}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo — clean wordmark */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xs">Mk</span>
                        </div>
                        <span className="font-bold text-base tracking-tight text-foreground group-hover:text-primary transition-colors">
                            MkStore
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-7">
                        {navLinks.map((link) =>
                            link.children ? (
                                <div
                                    key={link.label}
                                    className="relative"
                                    onMouseEnter={() => setDropdownOpen(true)}
                                    onMouseLeave={() => setDropdownOpen(false)}
                                >
                                    <button className={`flex items-center gap-1 text-sm font-medium transition-colors ${dropdownOpen ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                                        {link.label}
                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`} />
                                    </button>
                                    {dropdownOpen && (
                                        <div className="absolute top-full left-0 pt-2 animate-scale-in">
                                            <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-border py-1.5 min-w-[200px]">
                                                {link.children.map((child) => (
                                                    <Link
                                                        key={child.href}
                                                        href={child.href}
                                                        className={`block px-4 py-2.5 text-sm transition-colors ${isActive(child.href) ? "text-primary font-semibold bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}
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
                                    className={`relative text-sm font-medium transition-colors group ${isActive(link.href) ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    {link.label}
                                    <span className={`absolute -bottom-0.5 left-0 w-full h-px bg-foreground rounded-full transform origin-left transition-transform duration-200 ${isActive(link.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
                                </Link>
                            )
                        )}
                    </nav>

                    {/* Right actions */}
                    <div className="flex items-center gap-0.5">
                        <Link href="/shop" className="hidden sm:flex">
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-lg w-9 h-9">
                                <Search className="w-4 h-4" />
                            </Button>
                        </Link>

                        {mounted && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className="text-muted-foreground hover:text-foreground rounded-lg w-9 h-9 hidden sm:flex"
                            >
                                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </Button>
                        )}

                        <button
                            onClick={openCart}
                            className="relative p-2 text-muted-foreground hover:text-foreground transition-colors ml-1"
                        >
                            <ShoppingBag className="w-4.5 h-4.5" />
                            {items.length > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                                    {items.length}
                                </span>
                            )}
                        </button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden rounded-lg w-9 h-9 ml-1"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            <div className={`md:hidden absolute top-16 left-0 w-full bg-white/98 dark:bg-background/98 backdrop-blur-md border-b border-border shadow-md transition-all duration-200 ease-in-out origin-top ${mobileOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 pointer-events-none"}`}>
                <div className="px-4 py-4 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
                    {navLinks.map((link) =>
                        link.children ? (
                            <div key={link.label} className="pt-2 pb-1">
                                <span className="block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    {link.label}
                                </span>
                                {link.children.map((child) => (
                                    <Link
                                        key={child.href}
                                        href={child.href}
                                        className={`block px-3 py-2.5 text-sm rounded-lg transition-colors ${isActive(child.href) ? "text-primary bg-primary/6 font-medium" : "text-foreground hover:bg-muted"}`}
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
                                className={`block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive(link.href) ? "text-primary bg-primary/6" : "text-foreground hover:bg-muted"}`}
                                onClick={() => setMobileOpen(false)}
                            >
                                {link.label}
                            </Link>
                        )
                    )}

                    {mounted && (
                        <div className="flex items-center justify-between px-3 pt-4 pb-2 border-t border-border mt-2">
                            <span className="text-sm text-muted-foreground">Dark mode</span>
                            <button
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className="p-2 bg-muted rounded-lg text-foreground"
                            >
                                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
