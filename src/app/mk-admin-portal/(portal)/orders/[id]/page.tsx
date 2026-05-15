"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CreditCard, Truck, User, MapPin, Calendar, Clock, Receipt, CheckCircle2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

type OrderItem = {
    id: string;
    productName: string;
    variantName: string | null;
    quantity: number;
    price: number;
};

type OrderDetail = {
    id: string;
    orderNumber: string;
    fullName: string;
    phoneNumber: string;
    email: string | null;
    deliveryLocation: string;
    deliveryNotes: string | null;
    deliveryMethod: string;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
    subtotal: number;
    total: number;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
    payments: any[];
    deliveryTracking: any[];
};

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, []);

    const fetchOrder = async () => {
        try {
            const resolvedParams = await params;
            // We'll reuse the client tracking endpoint or we can make an admin specific one
            // For now, let's create a dedicated admin fetch (assuming we have one or we'll make it)
            const res = await fetch(`/api/admin/orders?id=${resolvedParams.id}`);
            if (res.status === 401) {
                router.replace("/mk-admin-portal/login");
                return;
            }
            if (res.ok) {
                const data = await res.json();
                setOrder(data);
            } else {
                throw new Error("Order not found");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to load order");
            router.push("/mk-admin-portal/orders");
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (field: 'paymentStatus' | 'orderStatus', value: string) => {
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/admin/orders`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: order?.id, [field]: value }),
            });

            if (res.status === 401) {
                router.replace("/mk-admin-portal/login");
                return;
            }
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Update failed");
            }

            setOrder(prev => prev ? { ...prev, [field]: value } : null);
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : "Failed to update status");
        } finally {
            setIsUpdating(false);
        }
    };

    const formatPrice = (p: number) => `KSh ${p.toLocaleString('en-KE')}`;
    const formatDate = (d: string) => new Date(d).toLocaleString('en-KE', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    if (isLoading || !order) {
        return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Order {order.orderNumber}
                            </h1>
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${order.paymentStatus === 'success' ? 'bg-[#4ade80]/10 text-[#4ade80]' :
                                order.paymentStatus === 'failed' ? 'bg-destructive/10 text-destructive' :
                                    'bg-amber-500/10 text-amber-600'
                                }`}>
                                {order.paymentStatus.replace('_', ' ')}
                            </span>
                        </div>
                        <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4" /> {formatDate(order.createdAt)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Column */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Items */}
                    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/10">
                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary" /> Items
                            </h2>
                            <span className="text-sm font-medium text-muted-foreground">{order.items.length} items</span>
                        </div>
                        <div className="p-6 space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center py-2">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-[10px] text-muted-foreground">IMG</div>
                                        <div>
                                            <p className="font-medium text-sm text-foreground">{item.productName}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {item.variantName && <span className="mr-2">{item.variantName}</span>}
                                                <span>Qty: {item.quantity}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <span className="font-medium text-sm">{formatPrice(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 bg-muted/10 border-t border-border space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium">{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Delivery Method ({order.deliveryMethod})</span>
                                <span className="font-medium">{formatPrice(order.total - order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-base pt-2 border-t border-border mt-2 font-bold text-foreground">
                                <span>Total</span>
                                <span className="text-primary">{formatPrice(order.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Fulfillment Status Updates */}
                    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                        <div className="p-6 border-b border-border bg-muted/10">
                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <Truck className="w-5 h-5 text-primary" /> Fulfillment Status
                            </h2>
                        </div>
                        <div className="p-6 flex flex-col sm:flex-row gap-4 justify-between items-center relative">
                            {isUpdating && <div className="absolute inset-0 bg-card/50 z-10 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}

                            <div className="flex-1 w-full">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Order Status</label>
                                <select
                                    className={`w-full h-12 px-4 rounded-xl border-2 uppercase font-bold text-sm transition-colors ${order.orderStatus === 'delivered' ? 'border-[#4ade80] text-[#4ade80] bg-[#4ade80]/5' :
                                        order.orderStatus === 'cancelled' ? 'border-destructive text-destructive bg-destructive/5' :
                                            'border-amber-500 text-amber-600 bg-amber-500/5'
                                        }`}
                                    value={order.orderStatus}
                                    onChange={(e) => updateStatus('orderStatus', e.target.value)}
                                    disabled={isUpdating}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="dispatched">Dispatched</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div className="flex-1 w-full">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Payment Status</label>
                                <select
                                    className={`w-full h-12 px-4 rounded-xl border-2 uppercase font-bold text-sm transition-colors ${order.paymentStatus === 'success' ? 'border-[#4ade80] text-[#4ade80] bg-[#4ade80]/5' :
                                        order.paymentStatus === 'failed' ? 'border-destructive text-destructive bg-destructive/5' :
                                            'border-amber-500 text-amber-600 bg-amber-500/5'
                                        }`}
                                    value={order.paymentStatus}
                                    onChange={(e) => updateStatus('paymentStatus', e.target.value)}
                                    disabled={isUpdating}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="success">Success (Paid)</option>
                                    <option value="failed">Failed</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>

                        </div>
                    </div>

                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">

                    {/* Customer Info */}
                    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border space-y-4">
                        <h2 className="font-bold text-foreground flex items-center gap-2 mb-4">
                            <User className="w-4 h-4 text-primary" /> Customer
                        </h2>
                        <div className="text-sm space-y-3">
                            <p className="flex justify-between"><span className="text-muted-foreground">Name:</span> <span className="font-medium">{order.fullName}</span></p>
                            <p className="flex justify-between"><span className="text-muted-foreground">Phone:</span> <span className="font-medium text-primary">{order.phoneNumber}</span></p>
                            {order.email && <p className="flex justify-between"><span className="text-muted-foreground">Email:</span> <span className="font-medium">{order.email}</span></p>}
                        </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border space-y-4">
                        <h2 className="font-bold text-foreground flex items-center gap-2 mb-4">
                            <MapPin className="w-4 h-4 text-primary" /> Delivery Info
                        </h2>
                        <div className="text-sm space-y-3">
                            <p className="flex justify-between"><span className="text-muted-foreground">Method:</span> <span className="font-medium capitalize">{order.deliveryMethod}</span></p>
                            <div>
                                <span className="text-muted-foreground block mb-1">Destination:</span>
                                <p className="font-medium bg-muted/50 p-2 rounded-lg">{order.deliveryLocation}</p>
                            </div>
                            {order.deliveryNotes && (
                                <div>
                                    <span className="text-muted-foreground block mb-1">Notes:</span>
                                    <p className="italic bg-amber-500/10 text-amber-900 p-2 rounded-lg">{order.deliveryNotes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border space-y-4">
                        <h2 className="font-bold text-foreground flex items-center gap-2 mb-4">
                            <CreditCard className="w-4 h-4 text-primary" /> Payment
                        </h2>
                        <div className="text-sm space-y-3">
                            <p className="flex justify-between"><span className="text-muted-foreground">Method:</span> <span className="font-medium uppercase tracking-wide text-xs">{order.paymentMethod.replace('_', ' ')}</span></p>
                            <p className="flex justify-between items-center">
                                <span className="text-muted-foreground">Status:</span>
                                {order.paymentStatus === 'success' ? (
                                    <span className="flex items-center gap-1 text-[#4ade80] font-bold"><CheckCircle2 className="w-3 h-3" /> Paid</span>
                                ) : (
                                    <span className="flex items-center gap-1 text-amber-600 font-bold"><Clock className="w-3 h-3" /> {order.paymentStatus.replace('_', ' ')}</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Payment History */}
                    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border space-y-4">
                        <h2 className="font-bold text-foreground flex items-center gap-2 mb-4">
                            <Receipt className="w-4 h-4 text-primary" /> Payment History
                        </h2>
                        <div className="space-y-4">
                            {order.payments?.length > 0 ? order.payments.map((p, idx) => (
                                <div key={p.id} className="text-sm border-l-2 border-primary/20 pl-4 relative">
                                    <div className="absolute w-2 h-2 rounded-full bg-primary -left-[5px] top-1.5" />
                                    <div className="flex justify-between">
                                        <span className="font-semibold uppercase text-[10px] tracking-wider">{p.status}</span>
                                        <span className="text-xs text-muted-foreground">{formatDate(p.createdAt)}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">Provider: {p.provider}</div>
                                    {p.transactionId && <div className="text-xs text-muted-foreground">Txn ID: {p.transactionId}</div>}
                                </div>
                            )) : (
                                <div className="text-sm text-muted-foreground">No payment records found.</div>
                            )}
                        </div>
                    </div>

                    {/* Delivery Tracking */}
                    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border space-y-4">
                        <h2 className="font-bold text-foreground flex items-center gap-2 mb-4">
                            <Truck className="w-4 h-4 text-primary" /> Audit Trail
                        </h2>
                        <div className="space-y-4">
                            {order.deliveryTracking?.length > 0 ? order.deliveryTracking.map((t, idx) => (
                                <div key={t.id} className="text-sm border-l-2 border-primary/20 pl-4 relative">
                                    <div className="absolute w-2 h-2 rounded-full bg-primary -left-[5px] top-1.5" />
                                    <div className="flex justify-between">
                                        <span className="font-semibold uppercase tracking-wider text-[10px]">{t.status.replace('_', ' ')}</span>
                                        <span className="text-xs text-muted-foreground">{formatDate(t.createdAt)}</span>
                                    </div>
                                    {t.notes && <div className="text-xs mt-1 text-muted-foreground italic">"{t.notes}"</div>}
                                </div>
                            )) : (
                                <div className="text-sm text-muted-foreground">No tracking updates yet.</div>
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
