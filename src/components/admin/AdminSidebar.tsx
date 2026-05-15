"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    Tags,
    ShoppingCart,
    TrendingUp,
    LogOut,
    Sun,
    Moon
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const links = [
        { 
            href: "/mk-admin-portal", 
            label: "Dashboard", 
            icon: LayoutDashboard,
            activeBg: "bg-purple-500/20",
            activeText: "text-purple-400",
            hoverBg: "hover:bg-purple-500/10",
            hoverText: "hover:text-purple-300"
        },
        { 
            href: "/mk-admin-portal/revenue", 
            label: "Revenue", 
            icon: TrendingUp,
            activeBg: "bg-green-500/20",
            activeText: "text-green-400",
            hoverBg: "hover:bg-green-500/10",
            hoverText: "hover:text-green-300"
        },
        { 
            href: "/mk-admin-portal/orders", 
            label: "Orders", 
            icon: ShoppingCart,
            activeBg: "bg-blue-500/20",
            activeText: "text-blue-400",
            hoverBg: "hover:bg-blue-500/10",
            hoverText: "hover:text-blue-300"
        },
        { 
            href: "/mk-admin-portal/products", 
            label: "Products", 
            icon: Package,
            activeBg: "bg-emerald-500/20",
            activeText: "text-emerald-400",
            hoverBg: "hover:bg-emerald-500/10",
            hoverText: "hover:text-emerald-300"
        },
        { 
            href: "/mk-admin-portal/categories", 
            label: "Categories", 
            icon: Tags,
            activeBg: "bg-orange-500/20",
            activeText: "text-orange-400",
            hoverBg: "hover:bg-orange-500/10",
            hoverText: "hover:text-orange-300"
        },
    ];

    const handleLogout = async () => {
        try {
            await fetch("/api/admin/auth", { method: "DELETE" });
            router.push("/mk-admin-portal/login");
            router.refresh();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <aside className="fixed inset-y-0 left-0 w-64 bg-mk-dark text-white shadow-xl flex flex-col z-40 hidden lg:flex">

            {/* Brand */}
            <div className="h-20 flex items-center px-8 border-b border-white/10">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                        <span className="text-white font-bold text-sm">Mk</span>
                    </div>
                    <span className="font-semibold text-lg tracking-tight">Admin<span className="text-primary">Portal</span></span>
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-8 hide-scrollbar">
                <nav className="px-4 space-y-2">
                    {links.map((link) => {
                        const isActive = pathname === link.href || (link.href !== "/mk-admin-portal" && pathname.startsWith(`${link.href}/`));
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                                    isActive
                                        ? `${link.activeBg} ${link.activeText} shadow-sm`
                                        : `text-white/60 ${link.hoverBg} ${link.hoverText}`
                                }`}
                            >
                                <link.icon className={`w-5 h-5 transition-colors ${isActive ? "" : "opacity-70 group-hover:opacity-100"}`} />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Footer / Settings */}
            <div className="p-4 border-t border-white/10 space-y-2">
                {mounted && (
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-white/60 hover:bg-white/10 hover:text-white w-full text-left font-medium"
                    >
                        {theme === "dark" ? <Sun className="w-5 h-5 opacity-70" /> : <Moon className="w-5 h-5 opacity-70" />}
                        {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </button>
                )}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-white/60 hover:bg-destructive hover:text-white w-full text-left font-medium"
                >
                    <LogOut className="w-5 h-5 opacity-70" />
                    Sign Out
                </button>
            </div>

        </aside>
    );
}
