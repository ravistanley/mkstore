"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Smartphone, MapPin, Receipt, Clock } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

function ConfirmationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const orderId = searchParams.get("orderId");
    const isMpesa = searchParams.get("mpesa") === "true";

    useEffect(() => {
        setMounted(true);
        if (!orderId) {
            router.push("/");
        }
    }, [orderId, router]);

    if (!mounted || !orderId) return null;

    return (
        <div className="max-w-2xl mx-auto w-full bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-border/50 text-center relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-[#4ade80]/10 rounded-full blur-3xl -z-10" />

            <div className="w-20 h-20 bg-[#4ade80]/10 text-[#4ade80] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-mk-dark mb-4">
                Order Confirmed!
            </h1>

            <p className="text-lg text-muted-foreground mb-8">
                Thank you for shopping at MkStore. <br />
                {isMpesa
                    ? "Please check your phone for the M-Pesa prompt to complete payment if you haven't already."
                    : "Your order has been received and is being processed."
                }
            </p>

            <div className="bg-mk-gray p-6 rounded-2xl mb-8 grid sm:grid-cols-2 gap-4 text-left border border-border/50">
                <div className="flex items-start gap-3">
                    <Receipt className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                            Order Details
                        </p>
                        <p className="font-medium text-sm">We've saved your order information securely.</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                            Next Steps
                        </p>
                        <p className="font-medium text-sm">You can track your order status at any time.</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/track-order" className={buttonVariants({ size: "lg", className: "h-14 px-8 rounded-xl" })}>
                    Track Order Status
                </Link>
                <Link href="/shop" className={buttonVariants({ variant: "outline", size: "lg", className: "h-14 px-8 rounded-xl" })}>
                    Continue Shopping
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
            </div>
        </div>
    );
}

export default function OrderConfirmationPage() {
    return (
        <div className="bg-mk-gray min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<div className="animate-pulse w-full max-w-2xl h-[500px] bg-white rounded-3xl" />}>
                <ConfirmationContent />
            </Suspense>
        </div>
    );
}
