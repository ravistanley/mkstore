"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    CheckCircle2, ArrowRight, Smartphone, Receipt,
    Clock, MapPin, CreditCard, Package, Mail
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface OrderDetails {
    paymentStatus: string;
    orderStatus: string;
    orderNumber: string;
    fullName: string;
    email: string;
    paymentMethod: string;
    deliveryMethod: string;
    deliveryLocation: string;
    mpesaReceipt?: string | null;
    subtotal: number;
    deliveryFee: number;
    total: number;
    createdAt: string;
    items: {
        productName: string;
        variantName?: string | null;
        quantity: number;
        price: number;
    }[];
}

function formatPrice(amount: number) {
    return `KSh ${amount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
}

function ConfirmationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [isPolling, setIsPolling] = useState(true);

    const orderId = searchParams.get("orderId");
    const isMpesa = searchParams.get("mpesa") === "true";

    useEffect(() => {
        setMounted(true);
        if (!orderId) router.push("/");
    }, [orderId, router]);

    // Fetch/poll order status
    useEffect(() => {
        if (!orderId || !isPolling) return;

        const fetchStatus = async () => {
            try {
                const res = await fetch(`/api/orders/${orderId}/status`);
                if (res.ok) {
                    const data: OrderDetails = await res.json();
                    setOrder(data);
                    // Stop polling once we get a terminal payment state
                    if (data.paymentStatus === "success" || data.paymentStatus === "failed") {
                        setIsPolling(false);
                    }
                    // For pay_on_delivery, stop polling immediately
                    if (!isMpesa) {
                        setIsPolling(false);
                    }
                }
            } catch (err) {
                console.error("Error fetching order status:", err);
            }
        };

        fetchStatus();
        if (isMpesa) {
            const interval = setInterval(fetchStatus, 3000);
            return () => clearInterval(interval);
        }
    }, [orderId, isMpesa, isPolling]);

    if (!mounted || !orderId) return null;

    const isPaymentPending = isMpesa && (!order || order.paymentStatus === "pending");
    const isPaymentFailed = order?.paymentStatus === "failed";
    const isSuccess = !isPaymentPending && !isPaymentFailed;

    return (
        <div className="max-w-2xl mx-auto w-full space-y-6">

            {/* Main status card */}
            <div className={`bg-white dark:bg-card rounded-3xl p-8 md:p-10 shadow-sm border text-center relative overflow-hidden transition-all duration-500 ${isSuccess ? "border-[#4ade80]/30" : isPaymentFailed ? "border-destructive/30" : "border-border/50"}`}>
                {/* Background glow */}
                <div className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-20 transition-colors duration-1000 ${isSuccess ? "bg-[#4ade80]" : isPaymentFailed ? "bg-destructive" : "bg-primary"}`} />

                {/* Icon */}
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-all duration-500 ${isSuccess ? "bg-[#4ade80]/10 text-[#4ade80]" : isPaymentFailed ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary animate-pulse"}`}>
                    {isSuccess
                        ? <CheckCircle2 className="w-10 h-10" />
                        : isPaymentFailed
                            ? <CreditCard className="w-10 h-10" />
                            : <Smartphone className="w-10 h-10" />}
                </div>

                {/* Heading */}
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-mk-dark dark:text-foreground mb-3">
                    {isSuccess
                        ? "Order Confirmed!"
                        : isPaymentFailed
                            ? "Payment Failed"
                            : "Awaiting Payment..."}
                </h1>

                {/* Sub message */}
                <p className="text-muted-foreground text-base leading-relaxed max-w-md mx-auto">
                    {isSuccess
                        ? `Thank you, ${order?.fullName?.split(" ")[0] || ""}! Your order has been received. A confirmation email has been sent to ${order?.email}.`
                        : isPaymentFailed
                            ? "The M-Pesa payment was cancelled or failed. Your order is saved — please contact us to retry payment."
                            : "Check your phone for the M-Pesa STK prompt and enter your PIN to complete payment."
                    }
                </p>

                {/* Email sent badge */}
                {isSuccess && order?.email && (
                    <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#4ade80]/10 text-[#16a34a] dark:text-[#4ade80] rounded-full text-sm font-medium">
                        <Mail className="w-4 h-4" />
                        Confirmation sent to {order.email}
                    </div>
                )}
            </div>

            {/* Order details card — show once we have data */}
            {order && (
                <div className="bg-white dark:bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden">

                    {/* Order number header */}
                    <div className="flex items-center justify-between px-6 py-4 bg-muted/40 border-b border-border/50">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Receipt className="w-4 h-4" />
                            Order Number
                        </div>
                        <span className="font-bold text-mk-dark dark:text-foreground tracking-wide">{order.orderNumber}</span>
                    </div>

                    {/* Items list */}
                    <div className="px-6 py-4 space-y-3 border-b border-border/50">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5" /> Items Ordered
                        </p>
                        {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-start text-sm">
                                <div>
                                    <p className="font-medium text-mk-dark dark:text-foreground">{item.productName}</p>
                                    {item.variantName && (
                                        <p className="text-xs text-muted-foreground mt-0.5">{item.variantName}</p>
                                    )}
                                </div>
                                <div className="text-right shrink-0 ml-4">
                                    <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div className="px-6 py-4 space-y-2 text-sm border-b border-border/50">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Subtotal</span>
                            <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Delivery Fee</span>
                            <span>{order.deliveryFee === 0 ? "Free" : formatPrice(order.deliveryFee)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base text-mk-dark dark:text-foreground pt-1 border-t border-border/50">
                            <span>Total</span>
                            <span className="text-[#16a34a] dark:text-[#4ade80]">{formatPrice(order.total)}</span>
                        </div>
                    </div>

                    {/* Delivery & Payment info */}
                    <div className="px-6 py-4 grid sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Delivery</p>
                                <p className="text-sm font-medium capitalize">{order.deliveryMethod === "delivery" ? "Home Delivery" : "Pickup"}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{order.deliveryLocation}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CreditCard className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Payment</p>
                                <p className="text-sm font-medium">{order.paymentMethod === "mpesa" ? "M-Pesa" : "Pay on Delivery"}</p>
                                {order.mpesaReceipt && (
                                    <p className="text-xs text-muted-foreground mt-0.5">Receipt: <span className="font-semibold text-mk-dark dark:text-foreground">{order.mpesaReceipt}</span></p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/track-order" className={buttonVariants({ size: "lg", className: "flex-1 h-13 rounded-xl" })}>
                    <Clock className="w-4 h-4 mr-2" />
                    Track Order
                </Link>
                <Link href="/shop" className={buttonVariants({ variant: "outline", size: "lg", className: "flex-1 h-13 rounded-xl" })}>
                    Continue Shopping
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
            </div>
        </div>
    );
}

export default function OrderConfirmationPage() {
    return (
        <div className="bg-mk-gray dark:bg-background min-h-[90vh] flex items-start justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-2xl">
                <Suspense fallback={
                    <div className="space-y-6">
                        <div className="animate-pulse w-full h-64 bg-white rounded-3xl" />
                        <div className="animate-pulse w-full h-80 bg-white rounded-3xl" />
                    </div>
                }>
                    <ConfirmationContent />
                </Suspense>
            </div>
        </div>
    );
}
