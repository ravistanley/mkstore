"use client";

import { useState } from "react";
import { Search, Package, CheckCircle2, ChevronRight, XCircle, CreditCard, Clock, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type OrderDetails = {
    orderNumber: string;
    fullName: string;
    orderStatus: string;
    paymentStatus: string;
    paymentMethod: string;
    deliveryMethod: string;
    deliveryLocation: string;
    subtotal: number;
    deliveryFee: number;
    total: number;
    createdAt: string;
    items: Array<{
        productName: string;
        variantName: string | null;
        quantity: number;
        price: number;
    }>;
};

export default function TrackOrderPage() {
    const [orderNumber, setOrderNumber] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [order, setOrder] = useState<OrderDetails | null>(null);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        setError(null);

        try {
            const res = await fetch("/api/orders/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderNumber, phoneNumber }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to find order");
            }

            setOrder(data.order);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setOrder(null);
        } finally {
            setIsSearching(false);
        }
    };

    const formatPrice = (price: number) => `KSh ${price.toLocaleString("en-KE")}`;

    const renderStatusTracker = (status: string) => {
        const statuses = ["pending", "processing", "shipped", "delivered"];
        if (status === "cancelled") {
            return (
                <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-4 rounded-xl">
                    <XCircle className="w-6 h-6" />
                    <span className="font-semibold">Order Cancelled</span>
                </div>
            );
        }

        const currentIndex = statuses.indexOf(status);

        return (
            <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 z-0 rounded-full" />
                <div
                    className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 rounded-full transition-all duration-500"
                    style={{ width: `${(Math.max(0, currentIndex) / (statuses.length - 1)) * 100}%` }}
                />

                <div className="relative z-10 flex justify-between">
                    {statuses.map((s, i) => {
                        const isCompleted = currentIndex >= i;
                        const isCurrent = currentIndex === i;

                        let Icon = Clock;
                        if (s === "processing") Icon = Package;
                        if (s === "shipped") Icon = Truck;
                        if (s === "delivered") Icon = CheckCircle2;

                        return (
                            <div key={s} className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isCompleted ? "bg-primary text-primary-foreground shadow-md" : "bg-white dark:bg-muted border-2 border-muted text-muted-foreground"
                                    }`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className={`text-xs font-semibold uppercase tracking-wider ${isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                                    }`}>
                                    {s}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-mk-gray dark:bg-background min-h-[80vh] py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-mk-dark dark:text-foreground mb-4">
                        Track Your Order
                    </h1>
                    <p className="text-muted-foreground">
                        Enter your order number and phone number below to check the current status of your delivery.
                    </p>
                </div>

                {/* Tracking Form */}
                <div className="bg-white dark:bg-card p-6 md:p-8 rounded-3xl shadow-sm border border-border/50 max-w-xl mx-auto mb-12 transition-colors">
                    <form onSubmit={handleTrack} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="orderNumber">Order Number</Label>
                            <Input
                                id="orderNumber"
                                placeholder="MK-XXXX-XXXX"
                                className="h-14 bg-muted/50 rounded-xl"
                                value={orderNumber}
                                onChange={(e) => setOrderNumber(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone Number used for order</Label>
                            <Input
                                id="phoneNumber"
                                placeholder="e.g. 07xx xxx xxx"
                                className="h-14 bg-muted/50 rounded-xl"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <p className="text-destructive text-sm font-medium bg-destructive/10 p-3 rounded-lg">
                                {error}
                            </p>
                        )}

                        <Button type="submit" size="lg" className="w-full h-14 rounded-xl text-base shadow-lg" disabled={isSearching}>
                            {isSearching ? "Searching..." : "Track Order"}
                            {!isSearching && <Search className="w-5 h-5 ml-2" />}
                        </Button>
                    </form>
                </div>

                {/* Order Results */}
                {order && (
                    <div className="bg-white dark:bg-card rounded-3xl shadow-lg border border-border/50 overflow-hidden animate-fade-in transition-colors">
                        {/* Header */}
                        <div className="bg-mk-dark dark:bg-muted text-white p-6 md:p-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div>
                                <p className="text-white/60 text-sm font-medium mb-1 uppercase tracking-wider">Order Reference</p>
                                <h2 className="text-2xl font-bold">{order.orderNumber}</h2>
                            </div>
                            <div className="text-left sm:text-right">
                                <p className="text-white/60 text-sm font-medium mb-1 uppercase tracking-wider">Placed On</p>
                                <p className="font-medium">{new Date(order.createdAt).toLocaleDateString("en-KE", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>

                        <div className="p-6 md:p-8">
                            {/* Progress Tracker */}
                            <div className="mb-12">
                                <h3 className="text-lg font-bold text-mk-dark dark:text-foreground mb-8">Delivery Status</h3>
                                {renderStatusTracker(order.orderStatus)}
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 mb-8">
                                {/* Details */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-mk-dark dark:text-foreground mb-4 border-b pb-2">Delivery Details</h3>
                                        <div className="space-y-3 text-sm">
                                            <p><span className="text-muted-foreground mr-2">Recipient:</span> <span className="font-medium text-foreground">{order.fullName}</span></p>
                                            <p><span className="text-muted-foreground mr-2">Method:</span> <span className="capitalize font-medium text-foreground">{order.deliveryMethod}</span></p>
                                            <p><span className="text-muted-foreground mr-2">Location:</span> <span className="font-medium text-foreground">{order.deliveryLocation}</span></p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-mk-dark dark:text-foreground mb-4 border-b pb-2">Payment Info</h3>
                                        <div className="space-y-3 text-sm flex items-center gap-4">
                                            <div className="p-3 bg-muted rounded-xl">
                                                <CreditCard className="w-6 h-6 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="capitalize font-medium text-foreground">{order.paymentMethod.replace('_', ' ')}</p>
                                                <p className={`text-xs font-semibold uppercase mt-1 ${order.paymentStatus === 'completed' ? 'text-[#4ade80]' :
                                                    order.paymentStatus === 'failed' ? 'text-destructive' : 'text-amber-500'
                                                    }`}>
                                                    {order.paymentStatus}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Items */}
                                <div>
                                    <h3 className="text-lg font-bold text-mk-dark dark:text-foreground mb-4 border-b pb-2">Order Items</h3>
                                    <div className="space-y-4 mb-6">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm items-center">
                                                <div className="flex-1 pr-4">
                                                    <p className="font-medium text-foreground">{item.productName}</p>
                                                    {(item.variantName || item.quantity > 1) && (
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            {item.variantName && <span>{item.variantName}</span>}
                                                            {item.variantName && item.quantity > 1 && <span> • </span>}
                                                            {item.quantity > 1 && <span>Qty: {item.quantity}</span>}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="font-medium text-foreground">{formatPrice(item.price * item.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-mk-gray dark:bg-muted/50 p-4 rounded-xl space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span className="font-medium text-foreground">{formatPrice(order.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Delivery Method</span>
                                            <span className="font-medium text-foreground">{formatPrice(order.deliveryFee)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t mt-2 border-border/50">
                                            <span className="font-bold text-foreground">Total</span>
                                            <span className="text-lg font-bold text-primary">{formatPrice(order.total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
