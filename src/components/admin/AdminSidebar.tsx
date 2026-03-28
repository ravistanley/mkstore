"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    Tags,
    ShoppingCart,
    Settings,
    LogOut,
    Menu
} from "lucide-react";

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const links = [
        { href: "/mk-admin-portal", label: "Dashboard", icon: LayoutDashboard },
        { href: "/mk-admin-portal/orders", label: "Orders", icon: ShoppingCart },
        { href: "/mk-admin-portal/products", label: "Products", icon: Package },
        { href: "/mk-admin-portal/categories", label: "Categories", icon: Tags },
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
                        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${isActive
                                        ? "bg-primary text-white"
                                        : "text-white/70 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                <link.icon className="w-5 h-5" />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Footer / Settings */}
            <div className="p-4 border-t border-white/10 space-y-2">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-white/70 hover:bg-destructive hover:text-white w-full text-left font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>

        </aside>
    );
}
