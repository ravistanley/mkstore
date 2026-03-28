export const dynamic = "force-dynamic";

import {
    TrendingUp,
    ShoppingCart,
    Package,
    CreditCard,
    ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { orders, products, categories } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

async function getDashboardStats() {
    try {
        const [ordersCount] = await db.select({ count: sql`count(*)`.mapWith(Number) }).from(orders);
        const [revenueObj] = await db.select({ total: sql`sum(total)`.mapWith(Number) }).from(orders).where(sql`payment_status = 'completed'`);
        const [productsCount] = await db.select({ count: sql`count(*)`.mapWith(Number) }).from(products);
        const [categoriesCount] = await db.select({ count: sql`count(*)`.mapWith(Number) }).from(categories);

        return {
            totalOrders: ordersCount.count || 0,
            totalRevenue: revenueObj.total || 0,
            activeProducts: productsCount.count || 0,
            totalCategories: categoriesCount.count || 0,
        };
    } catch (error) {
        console.error("Failed to fetch admin stats:", error);
        return {
            totalOrders: 0,
            totalRevenue: 0,
            activeProducts: 0,
            totalCategories: 0,
        };
    }
}

export default async function AdminDashboardPage() {
    const stats = await getDashboardStats();

    const cards = [
        {
            title: "Total Revenue",
            value: `KSh ${stats.totalRevenue.toLocaleString("en-KE")}`,
            icon: TrendingUp,
            color: "text-[#4ade80]",
            bg: "bg-[#4ade80]/10",
            link: "/mk-admin-portal/orders",
        },
        {
            title: "Total Orders",
            value: stats.totalOrders.toLocaleString(),
            icon: ShoppingCart,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            link: "/mk-admin-portal/orders",
        },
        {
            title: "Active Products",
            value: stats.activeProducts.toLocaleString(),
            icon: Package,
            color: "text-primary",
            bg: "bg-primary/10",
            link: "/mk-admin-portal/products",
        },
        {
            title: "Categories",
            value: stats.totalCategories.toLocaleString(),
            icon: CreditCard,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            link: "/mk-admin-portal/categories",
        },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-mk-dark">Dashboard</h1>
                <p className="text-muted-foreground mt-2">Overview of your store's performance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-border/50 flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg}`}>
                                <card.icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                            <Link href={card.link} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-mk-gray transition-colors text-muted-foreground hover:text-mk-dark">
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm font-medium">{card.title}</p>
                            <p className="text-2xl font-bold text-mk-dark mt-1">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
