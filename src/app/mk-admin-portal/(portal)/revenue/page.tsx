export const dynamic = "force-dynamic";

import {
    Smartphone,
    Truck,
    MapPin,
    Receipt,
    TrendingUp,
    ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { sql, desc } from "drizzle-orm";

async function getRevenueData() {
    try {
        // Grand total
        const [revenueObj] = await db
            .select({ total: sql`coalesce(sum(total), 0)`.mapWith(Number) })
            .from(orders)
            .where(sql`payment_status = 'success'`);

        const [countObj] = await db
            .select({ count: sql`count(*)`.mapWith(Number) })
            .from(orders)
            .where(sql`payment_status = 'success'`);

        // By payment method
        const revenueByPayment = await db
            .select({
                method: orders.paymentMethod,
                total: sql`coalesce(sum(total), 0)`.mapWith(Number),
                count: sql`count(*)`.mapWith(Number),
            })
            .from(orders)
            .where(sql`payment_status = 'success'`)
            .groupBy(orders.paymentMethod)
            .orderBy(desc(sql`sum(total)`));

        // By delivery method
        const revenueByDelivery = await db
            .select({
                method: orders.deliveryMethod,
                total: sql`coalesce(sum(total), 0)`.mapWith(Number),
                count: sql`count(*)`.mapWith(Number),
            })
            .from(orders)
            .where(sql`payment_status = 'success'`)
            .groupBy(orders.deliveryMethod)
            .orderBy(desc(sql`sum(total)`));

        // By order status
        const revenueByStatus = await db
            .select({
                status: orders.orderStatus,
                total: sql`coalesce(sum(total), 0)`.mapWith(Number),
                count: sql`count(*)`.mapWith(Number),
            })
            .from(orders)
            .where(sql`payment_status = 'success'`)
            .groupBy(orders.orderStatus)
            .orderBy(desc(sql`sum(total)`));

        // All paid orders (full list)
        const allPaidOrders = await db
            .select({
                id: orders.id,
                orderNumber: orders.orderNumber,
                fullName: orders.fullName,
                email: orders.email,
                phoneNumber: orders.phoneNumber,
                total: orders.total,
                subtotal: orders.subtotal,
                deliveryFee: orders.deliveryFee,
                paymentMethod: orders.paymentMethod,
                deliveryMethod: orders.deliveryMethod,
                orderStatus: orders.orderStatus,
                mpesaReceipt: orders.mpesaReceipt,
                deliveryLocation: orders.deliveryLocation,
                createdAt: orders.createdAt,
            })
            .from(orders)
            .where(sql`payment_status = 'success'`)
            .orderBy(desc(orders.createdAt));

        return {
            totalRevenue: revenueObj.total || 0,
            totalPaidOrders: countObj.count || 0,
            revenueByPayment,
            revenueByDelivery,
            revenueByStatus,
            allPaidOrders,
        };
    } catch (error) {
        console.error("Failed to fetch revenue data:", error);
        return {
            totalRevenue: 0,
            totalPaidOrders: 0,
            revenueByPayment: [],
            revenueByDelivery: [],
            revenueByStatus: [],
            allPaidOrders: [],
        };
    }
}

function fmt(n: number | string) {
    return `KSh ${Number(n).toLocaleString("en-KE", { minimumFractionDigits: 0 })}`;
}

function pct(part: number, total: number) {
    if (total === 0) return "0";
    return ((part / total) * 100).toFixed(1);
}

const STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    payment_processing: "Payment Processing",
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

interface BreakdownCardProps {
    title: string;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    barColor: string;
    rows: { label: string; total: number; count: number }[];
    grandTotal: number;
}

function BreakdownCard({
    title,
    icon: Icon,
    iconColor,
    iconBg,
    barColor,
    rows,
    grandTotal,
}: BreakdownCardProps) {
    return (
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3">
                <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
            </div>
            <div className="space-y-4">
                {rows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No data available.</p>
                ) : (
                    rows.map((row) => {
                        const percent = pct(row.total, grandTotal);
                        return (
                            <div key={row.label} className="space-y-1.5">
                                <div className="flex justify-between items-baseline text-sm">
                                    <span className="font-medium text-foreground capitalize">
                                        {row.label}
                                    </span>
                                    <span className="font-semibold text-foreground">{fmt(row.total)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${barColor} rounded-full transition-all duration-500`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground w-12 text-right font-medium">
                                        {percent}%
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {row.count} order{row.count !== 1 ? "s" : ""}
                                </p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default async function RevenuePage() {
    const data = await getRevenueData();

    const avgOrderValue =
        data.totalPaidOrders > 0 ? data.totalRevenue / data.totalPaidOrders : 0;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Revenue Report
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Full breakdown of all revenue from paid orders.
                    </p>
                </div>
                <Link
                    href="/mk-admin-portal/orders"
                    className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                    Manage Orders <ArrowUpRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Top KPI strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                    <div className="w-10 h-10 bg-[#4ade80]/10 rounded-xl flex items-center justify-center mb-3">
                        <TrendingUp className="w-5 h-5 text-[#4ade80]" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{fmt(data.totalRevenue)}</p>
                </div>
                <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-3">
                        <Receipt className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Paid Orders</p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                        {data.totalPaidOrders.toLocaleString()}
                    </p>
                </div>
                <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center mb-3">
                        <TrendingUp className="w-5 h-5 text-purple-500" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Avg. Order Value</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{fmt(avgOrderValue)}</p>
                </div>
            </div>

            {/* Breakdown cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <BreakdownCard
                    title="By Payment Method"
                    icon={Smartphone}
                    iconColor="text-green-500"
                    iconBg="bg-green-500/10"
                    barColor="bg-green-500"
                    grandTotal={data.totalRevenue}
                    rows={data.revenueByPayment.map((r) => ({
                        label: r.method,
                        total: r.total,
                        count: r.count,
                    }))}
                />
                <BreakdownCard
                    title="By Delivery Method"
                    icon={Truck}
                    iconColor="text-blue-500"
                    iconBg="bg-blue-500/10"
                    barColor="bg-blue-500"
                    grandTotal={data.totalRevenue}
                    rows={data.revenueByDelivery.map((r) => ({
                        label: r.method.replace(/_/g, " "),
                        total: r.total,
                        count: r.count,
                    }))}
                />
                <BreakdownCard
                    title="By Order Status"
                    icon={MapPin}
                    iconColor="text-purple-500"
                    iconBg="bg-purple-500/10"
                    barColor="bg-purple-500"
                    grandTotal={data.totalRevenue}
                    rows={data.revenueByStatus.map((r) => ({
                        label: STATUS_LABELS[r.status] ?? r.status,
                        total: r.total,
                        count: r.count,
                    }))}
                />
            </div>

            {/* Full paid orders table */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
                    <div className="w-9 h-9 bg-amber-500/10 rounded-xl flex items-center justify-center">
                        <Receipt className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">All Paid Orders</h3>
                        <p className="text-xs text-muted-foreground">
                            {data.totalPaidOrders} order{data.totalPaidOrders !== 1 ? "s" : ""} contributing to revenue
                        </p>
                    </div>
                </div>

                {data.allPaidOrders.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <TrendingUp className="w-7 h-7 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-foreground">No paid orders yet</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Revenue will appear here once customers complete payments.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/40">
                                    {[
                                        "Order",
                                        "Customer",
                                        "Payment",
                                        "M-Pesa Receipt",
                                        "Delivery",
                                        "Location",
                                        "Status",
                                        "Subtotal",
                                        "Delivery Fee",
                                        "Total",
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            className={`px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap ${h === "Total" || h === "Subtotal" || h === "Delivery Fee" ? "text-right" : "text-left"}`}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {data.allPaidOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-muted/30 transition-colors group"
                                    >
                                        <td className="px-4 py-4 whitespace-nowrap">
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
                                        <td className="px-4 py-4">
                                            <p className="font-medium text-foreground whitespace-nowrap">
                                                {order.fullName}
                                            </p>
                                            {order.email && (
                                                <p className="text-xs text-muted-foreground">{order.email}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground">{order.phoneNumber}</p>
                                        </td>
                                        <td className="px-4 py-4 capitalize text-foreground whitespace-nowrap">
                                            {order.paymentMethod}
                                        </td>
                                        <td className="px-4 py-4">
                                            {order.mpesaReceipt ? (
                                                <span className="font-mono text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-1 rounded-md whitespace-nowrap">
                                                    {order.mpesaReceipt}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 capitalize text-foreground text-xs whitespace-nowrap">
                                            {order.deliveryMethod.replace(/_/g, " ")}
                                        </td>
                                        <td className="px-4 py-4 text-xs text-muted-foreground max-w-[180px] truncate">
                                            {order.deliveryLocation}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_COLORS[order.orderStatus] ?? "bg-muted text-muted-foreground"}`}
                                            >
                                                {STATUS_LABELS[order.orderStatus] ?? order.orderStatus}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right text-foreground whitespace-nowrap">
                                            {fmt(order.subtotal)}
                                        </td>
                                        <td className="px-4 py-4 text-right text-muted-foreground whitespace-nowrap">
                                            {fmt(order.deliveryFee)}
                                        </td>
                                        <td className="px-4 py-4 text-right font-bold text-foreground whitespace-nowrap">
                                            {fmt(order.total)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-muted/50 border-t-2 border-border">
                                    <td colSpan={9} className="px-4 py-4 text-sm font-semibold text-foreground">
                                        Grand Total — {data.totalPaidOrders} paid order{data.totalPaidOrders !== 1 ? "s" : ""}
                                    </td>
                                    <td className="px-4 py-4 text-right text-base font-bold text-[#4ade80] whitespace-nowrap">
                                        {fmt(data.totalRevenue)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
