export const dynamic = "force-dynamic";

import {
    TrendingUp,
    ShoppingCart,
    Package,
    Tags,
    ArrowUpRight,
    Receipt,
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { orders, products, categories } from "@/lib/db/schema";
import { sql, desc } from "drizzle-orm";

async function getDashboardStats() {
    try {
        const [ordersCount] = await db
            .select({ count: sql`count(*)`.mapWith(Number) })
            .from(orders);

        const [revenueObj] = await db
            .select({ total: sql`coalesce(sum(total), 0)`.mapWith(Number) })
            .from(orders)
            .where(sql`payment_status = 'success'`);

        const [productsCount] = await db
            .select({ count: sql`count(*)`.mapWith(Number) })
            .from(products);

        const [categoriesCount] = await db
            .select({ count: sql`count(*)`.mapWith(Number) })
            .from(categories);

        // Last 5 paid orders for the preview
        const recentPaidOrders = await db
            .select({
                id: orders.id,
                orderNumber: orders.orderNumber,
                fullName: orders.fullName,
                total: orders.total,
                paymentMethod: orders.paymentMethod,
                orderStatus: orders.orderStatus,
                mpesaReceipt: orders.mpesaReceipt,
                createdAt: orders.createdAt,
            })
            .from(orders)
            .where(sql`payment_status = 'success'`)
            .orderBy(desc(orders.createdAt))
            .limit(5);

        return {
            totalOrders: ordersCount.count || 0,
            totalRevenue: revenueObj.total || 0,
            activeProducts: productsCount.count || 0,
            totalCategories: categoriesCount.count || 0,
            recentPaidOrders,
        };
    } catch (error) {
        console.error("Failed to fetch admin stats:", error);
        return {
            totalOrders: 0,
            totalRevenue: 0,
            activeProducts: 0,
            totalCategories: 0,
            recentPaidOrders: [],
        };
    }
}

function fmt(n: number | string) {
    return `KSh ${Number(n).toLocaleString("en-KE", { minimumFractionDigits: 0 })}`;
}

const STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    payment_processing: "Processing",
    paid: "Paid",
    processing: "Processing",
    dispatched: "Dispatched",
    delivered: "Delivered",
    cancelled: "Cancelled",
    refunded: "Refunded",
    failed: "Failed",
};

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
    payment_processing: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    paid: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    processing: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
    dispatched: "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400",
    delivered: "bg-green-500/20 text-green-600 dark:text-green-400",
    cancelled: "bg-red-500/20 text-red-600 dark:text-red-400",
    refunded: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
    failed: "bg-red-500/20 text-red-600 dark:text-red-400",
};

export default async function AdminDashboardPage() {
    const stats = await getDashboardStats();

    const cards = [
        {
            title: "Total Revenue",
            value: fmt(stats.totalRevenue),
            icon: TrendingUp,
            color: "text-[#4ade80]",
            bg: "bg-[#4ade80]/10",
            link: "/mk-admin-portal/revenue",
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
            icon: Tags,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            link: "/mk-admin-portal/categories",
        },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                <p className="text-muted-foreground mt-2">Overview of your store&apos;s performance.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <div
                        key={i}
                        className="bg-card p-6 rounded-2xl shadow-sm border border-border flex flex-col gap-4"
                    >
                        <div className="flex justify-between items-start">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg}`}>
                                <card.icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                            <Link
                                href={card.link}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm font-medium">{card.title}</p>
                            <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Revenue Preview */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                {/* Card header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#4ade80]/10 rounded-xl flex items-center justify-center">
                            <Receipt className="w-4 h-4 text-[#4ade80]" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-foreground text-sm">Recent Revenue</h2>
                            <p className="text-xs text-muted-foreground">Last 5 paid orders</p>
                        </div>
                    </div>
                    <Link
                        href="/mk-admin-portal/revenue"
                        className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                        Full Revenue Report <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {stats.recentPaidOrders.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <TrendingUp className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-foreground text-sm">No paid orders yet</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Revenue will appear here once customers complete payments.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/40">
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">M-Pesa Receipt</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {stats.recentPaidOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/mk-admin-portal/orders/${order.id}`}
                                                className="font-mono font-semibold text-primary hover:underline text-xs"
                                            >
                                                #{order.orderNumber}
                                            </Link>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {new Date(order.createdAt).toLocaleDateString("en-KE", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4 font-medium text-foreground">{order.fullName}</td>
                                        <td className="px-4 py-4 capitalize text-foreground">{order.paymentMethod}</td>
                                        <td className="px-4 py-4">
                                            {order.mpesaReceipt ? (
                                                <span className="font-mono text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-md">
                                                    {order.mpesaReceipt}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.orderStatus] ?? "bg-muted text-muted-foreground"}`}>
                                                {STATUS_LABELS[order.orderStatus] ?? order.orderStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-foreground">
                                            {fmt(order.total)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer CTA */}
                {stats.recentPaidOrders.length > 0 && (
                    <div className="px-6 py-3 border-t border-border bg-muted/20 flex justify-end">
                        <Link
                            href="/mk-admin-portal/revenue"
                            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                        >
                            View all paid orders & full breakdown <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
