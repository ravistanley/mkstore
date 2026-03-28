"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

export default function CartPage() {
    const { items, subtotal, updateQuantity, removeItem, isLoading } = useCart();

    const formatPrice = (price: number) => `KSh ${price.toLocaleString("en-KE")}`;

    if (items.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-mk-gray">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-border/50">
                    <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                </div>
                <h1 className="text-3xl font-bold text-mk-dark mb-2">Your cart is empty</h1>
                <p className="text-muted-foreground mb-8 text-center max-w-md">
                    Looks like you haven't added anything to your cart yet. Discover our premium accessories.
                </p>
                <Link href="/shop" className={buttonVariants({ size: "lg", className: "h-14 px-8 rounded-xl text-base" })}>
                    Start Shopping
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-mk-gray min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-mk-dark mb-8">
                    Shopping Cart
                </h1>

                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Cart Items */}
                    <div className="lg:col-span-8 space-y-4">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white p-4 sm:p-6 rounded-2xl border border-border/50 shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center"
                            >
                                {/* Image */}
                                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-mk-gray rounded-xl flex-shrink-0 flex items-center justify-center">
                                    <span className="text-xs text-muted-foreground">IMAGE</span>
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0 w-full">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <Link
                                                href={`/shop/${item.product.slug}`}
                                                className="text-lg font-semibold text-mk-dark hover:text-primary transition-colors block mb-1"
                                            >
                                                {item.product.name}
                                            </Link>
                                            {item.variant && (
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {item.variant.name}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold">
                                                {formatPrice(item.variant?.priceOverride ?? item.priceAtTimeAdded)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between mt-4 sm:mt-6">
                                        <div className="flex items-center border border-border rounded-lg bg-white">
                                            <button
                                                className="p-2 hover:bg-muted rounded-l-lg transition-colors disabled:opacity-50"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                disabled={isLoading}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-10 text-center text-sm font-medium">
                                                {item.quantity}
                                            </span>
                                            <button
                                                className="p-2 hover:bg-muted rounded-r-lg transition-colors disabled:opacity-50"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                disabled={isLoading}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <button
                                            className="text-sm flex items-center gap-1.5 text-muted-foreground hover:text-destructive transition-colors"
                                            onClick={() => removeItem(item.id)}
                                            disabled={isLoading}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="hidden sm:inline">Remove</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-4">
                        <div className="bg-white p-6 rounded-2xl border border-border/50 shadow-sm sticky top-24">
                            <h2 className="text-xl font-bold text-mk-dark mb-6">Order Summary</h2>

                            <div className="space-y-4 text-sm mb-6">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                                    <span className="font-medium text-mk-dark">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between pb-4 border-b border-border">
                                    <span className="text-muted-foreground">Delivery</span>
                                    <span className="text-mk-dark text-right">Calculated at checkout</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-base font-bold text-mk-dark">Total</span>
                                    <span className="text-2xl font-bold text-primary">{formatPrice(subtotal)}</span>
                                </div>
                            </div>

                            <Link href="/checkout" className={buttonVariants({ size: "lg", className: "w-full h-14 text-base rounded-xl mb-4 gap-2" })}>
                                Proceed to Checkout
                                <ArrowRight className="w-4 h-4" />
                            </Link>

                            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                                <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-mk-dark">Secure Checkout</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Your payment information is encrypted and secure.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
