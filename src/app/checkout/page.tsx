"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { checkoutSchema } from "@/lib/validators";
import { z } from "zod";
import { Loader2, CreditCard, Wallet, MapPin, Phone, User, ReceiptText, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
    const router = useRouter();
    const { items, subtotal, isLoading: cartLoading, refreshCart } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<CheckoutFormValues>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            fullName: "",
            phoneNumber: "",
            email: "",
            deliveryLocation: "",
            deliveryNotes: "",
            deliveryMethod: "delivery",
            paymentMethod: "mpesa",
        },
    });

    const deliveryMethod = form.watch("deliveryMethod");
    const deliveryFee = deliveryMethod === "delivery" ? 300 : 0;
    const total = subtotal + deliveryFee;

    const formatPrice = (price: number) => `KSh ${price.toLocaleString("en-KE")}`;

    const onSubmit = async (data: CheckoutFormValues) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const responseData = await res.json();

            if (!res.ok) {
                throw new Error(responseData.error || "Checkout failed");
            }

            await refreshCart(); // Clear local cart

            // Redirect to confirmation
            router.push(`/order-confirmation?orderId=${responseData.order.id}&mpesa=${data.paymentMethod === 'mpesa'}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong during checkout.");
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (!cartLoading && items.length === 0) {
            router.push("/cart");
        }
    }, [items.length, cartLoading, router]);

    if (cartLoading) return null;

    if (items.length === 0) {
        return null;
    }

    return (
        <div className="bg-mk-gray dark:bg-background min-h-screen py-12 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-mk-dark dark:text-foreground mb-8">
                    Checkout
                </h1>

                <form onSubmit={form.handleSubmit(onSubmit)} className="grid lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* Main Form */}
                    <div className="lg:col-span-8 space-y-8">

                        {error && (
                            <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-sm font-medium border border-destructive/20">
                                {error}
                            </div>
                        )}

                        {/* Contact Info */}
                        <section className="bg-white dark:bg-card p-6 md:p-8 rounded-2xl border border-border/50 shadow-sm">
                            <h2 className="text-xl font-bold text-mk-dark dark:text-foreground mb-6 flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                Contact Information
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        placeholder="John Doe"
                                        className="h-12 bg-muted/50"
                                        {...form.register("fullName")}
                                    />
                                    {form.formState.errors.fullName && (
                                        <p className="text-destructive text-xs">{form.formState.errors.fullName.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">Phone Number (Safaricom M-Pesa)</Label>
                                    <Input
                                        id="phoneNumber"
                                        placeholder="07xx xxx xxx or 2547xx xxx xxx"
                                        className="h-12 bg-muted/50"
                                        {...form.register("phoneNumber")}
                                    />
                                    {form.formState.errors.phoneNumber && (
                                        <p className="text-destructive text-xs">{form.formState.errors.phoneNumber.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="email">Email Address (Optional)</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        className="h-12 bg-muted/50"
                                        {...form.register("email")}
                                    />
                                    {form.formState.errors.email && (
                                        <p className="text-destructive text-xs">{form.formState.errors.email.message}</p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Delivery Info */}
                        <section className="bg-white dark:bg-card p-6 md:p-8 rounded-2xl border border-border/50 shadow-sm">
                            <h2 className="text-xl font-bold text-mk-dark dark:text-foreground mb-6 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" />
                                Delivery Details
                            </h2>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <button
                                    type="button"
                                    onClick={() => form.setValue("deliveryMethod", "delivery")}
                                    className={`p-4 rounded-xl border text-center transition-all ${deliveryMethod === "delivery"
                                        ? "border-primary bg-primary/5 shadow-sm text-primary"
                                        : "border-border hover:border-primary/50 text-muted-foreground"
                                        }`}
                                >
                                    <Truck className="w-6 h-6 mx-auto mb-2" />
                                    <span className="font-semibold block">Home Delivery</span>
                                    <span className="text-xs mt-1">KSh 300</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => form.setValue("deliveryMethod", "pickup")}
                                    className={`p-4 rounded-xl border text-center transition-all ${deliveryMethod === "pickup"
                                        ? "border-primary bg-primary/5 shadow-sm text-primary"
                                        : "border-border hover:border-primary/50 text-muted-foreground"
                                        }`}
                                >
                                    <MapPin className="w-6 h-6 mx-auto mb-2" />
                                    <span className="font-semibold block">Pick Up Option</span>
                                    <span className="text-xs mt-1">Free</span>
                                </button>
                            </div>

                            {deliveryMethod === "delivery" && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="deliveryLocation">Specific Delivery Location</Label>
                                        <Input
                                            id="deliveryLocation"
                                            placeholder="e.g. TRM Mall, Thika Road or Moi Avenue, CBD"
                                            className="h-12 bg-muted/50"
                                            {...form.register("deliveryLocation")}
                                        />
                                        {form.formState.errors.deliveryLocation && (
                                            <p className="text-destructive text-xs">{form.formState.errors.deliveryLocation.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="deliveryNotes">Delivery Notes (Optional)</Label>
                                        <Textarea
                                            id="deliveryNotes"
                                            placeholder="Any specific instructions for the rider..."
                                            className="resize-none bg-muted/50"
                                            {...form.register("deliveryNotes")}
                                        />
                                    </div>
                                </div>
                            )}
                            {deliveryMethod === "pickup" && (
                                <div className="p-4 bg-muted/50 rounded-xl">
                                    <p className="text-sm font-medium text-mk-dark dark:text-foreground">Pickup Location:</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        MkStore HQ, Nairobi CBD.<br />
                                        We'll contact you when your order is ready for pickup.
                                    </p>
                                    {/* Need to set a dummy location to pass zod validation */}
                                    <input type="hidden" {...form.register("deliveryLocation")} value="Pickup at MkStore HQ" />
                                </div>
                            )}
                        </section>

                        {/* Payment Info */}
                        <section className="bg-white dark:bg-card p-6 md:p-8 rounded-2xl border border-border/50 shadow-sm">
                            <h2 className="text-xl font-bold text-mk-dark dark:text-foreground mb-6 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-primary" />
                                Payment Method
                            </h2>

                            <div className="space-y-4">
                                <button
                                    type="button"
                                    onClick={() => form.setValue("paymentMethod", "mpesa")}
                                    className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all ${form.watch("paymentMethod") === "mpesa"
                                        ? "border-[#4ade80] bg-[#4ade80]/5 shadow-sm"
                                        : "border-border hover:border-[#4ade80]/50"
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.watch("paymentMethod") === "mpesa" ? "border-[#4ade80]" : "border-muted-foreground"}`}>
                                        {form.watch("paymentMethod") === "mpesa" && <div className="w-2.5 h-2.5 bg-[#4ade80] rounded-full" />}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <span className="font-semibold block text-mk-dark dark:text-foreground">M-Pesa Express (STK Push)</span>
                                        <span className="text-xs text-muted-foreground">A prompt will be sent to your phone</span>
                                    </div>
                                    <div className="w-10 h-10 bg-[#4ade80]/20 text-[#4ade80] rounded-lg flex items-center justify-center font-bold">
                                        M
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => form.setValue("paymentMethod", "pay_on_delivery")}
                                    className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all ${form.watch("paymentMethod") === "pay_on_delivery"
                                        ? "border-primary bg-primary/5 shadow-sm"
                                        : "border-border hover:border-primary/50"
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.watch("paymentMethod") === "pay_on_delivery" ? "border-primary" : "border-muted-foreground"}`}>
                                        {form.watch("paymentMethod") === "pay_on_delivery" && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <span className="font-semibold block text-mk-dark dark:text-foreground">Pay on Delivery</span>
                                        <span className="text-xs text-muted-foreground">Pay with Cash/M-Pesa upon receiving your order</span>
                                    </div>
                                    <Wallet className="w-6 h-6 text-muted-foreground" />
                                </button>
                            </div>
                        </section>

                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="bg-white dark:bg-card p-6 md:p-8 rounded-2xl border border-border/50 shadow-sm sticky top-24">
                            <h2 className="text-xl font-bold text-mk-dark dark:text-foreground mb-6 flex items-center gap-2">
                                <ReceiptText className="w-5 h-5 text-primary" />
                                Order Summary
                            </h2>

                            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto hide-scrollbar pr-2">
                                {items.map(item => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium text-mk-dark dark:text-foreground truncate">{item.product.name}</p>
                                            <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                                        </div>
                                        <span className="font-semibold whitespace-nowrap">
                                            {formatPrice((item.variant?.priceOverride ?? item.priceAtTimeAdded) * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 text-sm mb-6 pt-4 border-t border-border">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Delivery Method</span>
                                    <span className="font-medium capitalize">{deliveryMethod.replace('_', ' ')}</span>
                                </div>
                                <div className="flex justify-between pb-4 border-b border-border">
                                    <span className="text-muted-foreground">Delivery Fee</span>
                                    <span className="font-medium">{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-base font-bold text-mk-dark dark:text-foreground">Total</span>
                                    <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                className={`w-full h-14 text-base rounded-xl gap-2 ${form.watch("paymentMethod") === "mpesa" ? "bg-[#4ade80] hover:bg-[#4ade80]/90 text-white" : ""}`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Confirm Order
                                        {form.watch("paymentMethod") === "mpesa" ? " & Pay via M-Pesa" : ""}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}
