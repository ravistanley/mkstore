"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Loader2, Eye, Truck, Package, CheckCircle2, AlertCircle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Order = {
    id: string;
    orderNumber: string;
    fullName: string;
    total: number;
    paymentStatus: string;
    orderStatus: string;
    createdAt: string;
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const url = statusFilter === "all"
                ? "/api/admin/orders"
                : `/api/admin/orders?status=${statusFilter}`;

            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredOrders = orders.filter(o =>
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.fullName.toLowerCase().includes(search.toLowerCase())
    );

    const formatPrice = (p: number) => `KSh ${p.toLocaleString('en-KE')}`;

    const getStatusBadge = (status: string, type: 'payment' | 'order') => {
        if (type === 'payment') {
            switch (status) {
                case 'completed': return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#4ade80]/10 text-[#4ade80]">Paid</span>;
                case 'pending': return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600">Pending</span>;
                case 'failed': return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-destructive/10 text-destructive">Failed</span>;
                default: return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground">{status}</span>;
            }
        } else {
            switch (status) {
                case 'delivered': return <span className="px-2 py-0.5 flex items-center gap-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#4ade80]/10 text-[#4ade80]"><CheckCircle2 className="w-3 h-3" /> Delivered</span>;
                case 'shipped': return <span className="px-2 py-0.5 flex items-center gap-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500"><Truck className="w-3 h-3" /> Shipped</span>;
                case 'processing': return <span className="px-2 py-0.5 flex items-center gap-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600"><Package className="w-3 h-3" /> Processing</span>;
                case 'cancelled': return <span className="px-2 py-0.5 flex items-center gap-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-destructive/10 text-destructive"><AlertCircle className="w-3 h-3" /> Cancelled</span>;
                default: return <span className="px-2 py-0.5 flex items-center gap-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground">{status}</span>;
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-mk-dark">Orders</h1>
                    <p className="text-muted-foreground mt-1">Manage and fulfill customer orders.</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/50 flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by order number or customer..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-10 bg-muted/50 border-0"
                    />
                </div>
                <div className="flex gap-2 text-sm">
                    <select
                        className="h-10 px-3 rounded-xl bg-muted/50 border-0 focus:ring-1 focus:ring-primary"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-border/50 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 flex justify-center text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                        No orders found matching your criteria.
                    </div>
                ) : (
                    <div className="divide-y divide-border/50 overflow-x-auto">
                        <div className="min-w-[800px]">
                            <div className="grid grid-cols-12 gap-4 p-4 text-sm font-semibold text-muted-foreground bg-muted/30">
                                <div className="col-span-2">Order #</div>
                                <div className="col-span-2">Date</div>
                                <div className="col-span-3">Customer</div>
                                <div className="col-span-2">Total</div>
                                <div className="col-span-1 border-l pl-4">Payment</div>
                                <div className="col-span-1">Status</div>
                                <div className="col-span-1 text-right">Action</div>
                            </div>

                            {filteredOrders.map((order) => (
                                <div key={order.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/10 transition-colors">
                                    <div className="col-span-2 font-semibold text-sm text-primary">{order.orderNumber}</div>
                                    <div className="col-span-2 text-sm text-muted-foreground">
                                        {new Date(order.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                    <div className="col-span-3 text-sm font-medium pr-4 truncate">{order.fullName}</div>
                                    <div className="col-span-2 font-semibold text-sm">{formatPrice(order.total)}</div>

                                    <div className="col-span-1 border-l pl-4 flex items-center">
                                        {getStatusBadge(order.paymentStatus, 'payment')}
                                    </div>
                                    <div className="col-span-1 flex items-center">
                                        {getStatusBadge(order.orderStatus, 'order')}
                                    </div>

                                    <div className="col-span-1 flex justify-end">
                                        <Link href={`/mk-admin-portal/orders/${order.id}`} className={buttonVariants({ variant: "ghost", size: "icon" })}>
                                            <Eye className="w-4 h-4 text-muted-foreground hover:text-mk-dark transition-colors" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
