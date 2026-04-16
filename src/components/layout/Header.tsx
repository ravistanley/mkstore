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
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isActive = (href?: string) => {
        if (!href) return false;
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    return (
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-background/80 backdrop-blur-xl border-b border-border/50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                            <span className="text-white font-bold text-sm">Mk</span>
                        </div>
                        <span className="font-semibold text-lg tracking-tight text-foreground group-hover:text-primary transition-colors">
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
                                    <button className={`flex items-center gap-1 text-sm font-medium transition-colors ${dropdownOpen ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                                        {link.label}
                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {dropdownOpen && (
                                        <div className="absolute top-full left-0 pt-2 animate-scale-in">
                                            <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-border/50 py-2 min-w-[200px]">
                                                {link.children.map((child) => (
                                                    <Link
                                                        key={child.href}
                                                        href={child.href}
                                                        className={`block px-4 py-2.5 text-sm transition-colors ${isActive(child.href) ? 'text-primary bg-primary/5 font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
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
                                    className={`relative text-sm font-medium transition-colors py-1 group ${isActive(link.href) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    {link.label}
                                    <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full transform origin-left transition-transform duration-300 ${isActive(link.href) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                                </Link>
                            )
                        )}
                    </nav>

                    {/* Right actions */}
                    <div className="flex items-center gap-1 sm:gap-3">
                        <Link href="/shop" className="hidden sm:flex">
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-full">
                                <Search className="w-5 h-5" />
                            </Button>
                        </Link>

                        {/* Theme Toggle */}
                        {mounted && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className="text-muted-foreground hover:text-foreground rounded-full hidden sm:flex"
                            >
                                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </Button>
                        )}

                        <button
                            onClick={openCart}
                            className="relative p-2 text-muted-foreground hover:text-foreground transition-colors hover:scale-105 transform"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {items.length > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                                    {items.length}
                                </span>
                            )}
                        </button>

                        {/* Mobile menu toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden rounded-full ml-1"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            <div className={`md:hidden absolute top-16 left-0 w-full bg-white/95 dark:bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg transition-all duration-300 ease-in-out origin-top ${mobileOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
                <div className="px-4 py-4 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
                    <div className="space-y-1">
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
                                            className={`block px-3 py-2.5 text-sm rounded-lg transition-colors ${isActive(child.href) ? 'text-primary bg-primary/10 font-medium' : 'text-foreground hover:bg-muted'}`}
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
                                    className={`block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive(link.href) ? 'text-primary bg-primary/10' : 'text-foreground hover:bg-muted'}`}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            )
                        )}
                    </div>
                    
                    {/* Mobile Footer Actions */}
                    {mounted && (
                        <div className="flex items-center justify-between px-3 pt-4 border-t border-border/50">
                            <span className="text-sm font-medium text-muted-foreground">Dark Mode</span>
                            <button
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className="p-2 bg-muted rounded-full text-foreground"
                            >
                                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
