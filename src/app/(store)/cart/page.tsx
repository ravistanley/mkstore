"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, ShieldCheck, Truck } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

export default function CartPage() {
    const { items, subtotal, updateQuantity, removeItem, isLoading } = useCart();

    const formatPrice = (price: number) => `KSh ${price.toLocaleString("en-KE")}`;

    const freeShippingThreshold = 5000;
    const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
    const amountToFreeShipping = Math.max(freeShippingThreshold - subtotal, 0);

    if (items.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-mk-gray dark:bg-background">
                <div className="w-32 h-32 bg-white dark:bg-card rounded-full flex items-center justify-center mb-8 shadow-sm border border-border/50 animate-float">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground/40" />
                </div>
                <h1 className="text-3xl font-bold text-mk-dark dark:text-foreground mb-3">Your cart is empty</h1>
                <p className="text-muted-foreground mb-8 text-center max-w-md text-lg">
                    Looks like you haven't added anything to your cart yet. Discover our premium accessories.
                </p>
                <Link href="/shop" className={buttonVariants({ size: "lg", className: "h-14 px-8 rounded-xl text-base shadow-md" })}>
                    Start Shopping
                    <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-mk-gray dark:bg-background min-h-screen py-12 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-8 animate-fade-in">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-mk-dark dark:text-foreground">
                            Shopping Cart
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            {items.length} {items.length === 1 ? "item" : "items"} in your cart
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Cart Items */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Free Shipping Banner */}
                        <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-4 sm:p-6 mb-6 animate-slide-in-right">
                            <div className="flex items-center gap-3 mb-3 text-sm sm:text-base font-semibold text-primary">
                                <div className="p-2 bg-primary/10 rounded-full">
                                    <Truck className="w-5 h-5" />
                                </div>
                                {amountToFreeShipping > 0 
                                    ? <span>You're <strong className="text-lg">{formatPrice(amountToFreeShipping)}</strong> away from free delivery!</span>
                                    : "Congratulations! You've unlocked free delivery."}
                            </div>
                            <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary transition-all duration-1000 ease-out relative overflow-hidden" 
                                    style={{ width: `${progress}%` }}
                                >
                                    <div className="absolute top-0 right-0 bottom-0 left-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0JyBoZWlnaHQ9JzQnPjxyZWN0IHdpZHRoPSc0JyBoZWlnaHQ9JzQnIGZpbGw9JyNmZmYnIGZpbGwtb3BhY2l0eSc9JzAuMicvPjwvc3ZnPg==')] opacity-50"></div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {items.map((item, i) => (
                                <div
                                    key={item.id}
                                    className="bg-white dark:bg-card p-4 sm:p-6 rounded-2xl border border-border/50 shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center animate-fade-in group hover:border-primary/30 transition-colors"
                                    style={{ animationDelay: `${i * 0.1}s` }}
                                >
                                    {/* Image */}
                                    <Link href={`/shop/${item.product.slug}`} className="w-24 h-24 sm:w-32 sm:h-32 bg-mk-gray dark:bg-muted rounded-xl flex-shrink-0 relative overflow-hidden border border-border/50 block group-hover:scale-[1.02] transition-transform">
                                        {!item.product.imageUrl.includes("placeholder") ? (
                                            <Image 
                                                src={item.product.imageUrl} 
                                                alt={item.product.name} 
                                                fill 
                                                sizes="(max-width: 640px) 96px, 128px"
                                                className="object-cover" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                                <ShoppingBag className="w-8 h-8 text-muted-foreground/30" />
                                            </div>
                                        )}
                                    </Link>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0 w-full flex flex-col h-full">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <Link
                                                    href={`/shop/${item.product.slug}`}
                                                    className="text-lg font-bold text-mk-dark dark:text-foreground hover:text-primary transition-colors block mb-1 leading-tight"
                                                >
                                                    {item.product.name}
                                                </Link>
                                                {item.variant && (
                                                    <p className="text-sm font-medium text-muted-foreground bg-muted inline-block px-2 py-0.5 rounded-md mt-1">
                                                        {item.variant.name}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-primary">
                                                    {formatPrice(item.variant?.priceOverride ?? item.priceAtTimeAdded)}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">each</p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-between mt-auto pt-4 sm:pt-6">
                                            <div className="flex items-center border border-border/80 rounded-xl bg-background shadow-sm hover:border-border transition-colors p-0.5">
                                                <button
                                                    className="p-2 sm:p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    disabled={isLoading || item.quantity <= 1}
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-12 text-center text-sm font-semibold">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    className="p-2 sm:p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    disabled={isLoading}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <button
                                                className="text-sm flex items-center justify-center gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-3 py-2 rounded-xl transition-all font-medium border border-transparent hover:border-destructive/20"
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
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-4">
                        <div className="bg-white dark:bg-card p-6 rounded-3xl border border-border/50 shadow-xl dark:shadow-none sticky top-24 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                            <h2 className="text-2xl font-bold text-mk-dark dark:text-foreground mb-6">Summary</h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal ({items.length} items)</span>
                                    <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Estimated Delivery</span>
                                    <span className={amountToFreeShipping > 0 ? "text-foreground font-medium" : "text-emerald-500 font-bold"}>
                                        {amountToFreeShipping > 0 ? "Calculated next" : "FREE"}
                                    </span>
                                </div>
                                
                                <div className="pt-6 border-t border-border mt-6">
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-lg font-bold text-mk-dark dark:text-foreground">Total</span>
                                            <span className="text-xs text-muted-foreground">Including VAT</span>
                                        </div>
                                        <span className="text-3xl font-black text-primary tracking-tight">{formatPrice(subtotal)}</span>
                                    </div>
                                </div>
                            </div>

                            <Link href="/checkout" className={buttonVariants({ size: "lg", className: "w-full h-16 text-lg rounded-2xl mb-6 gap-2 shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-1" })}>
                                Proceed to Checkout
                                <ArrowRight className="w-5 h-5 ml-1" />
                            </Link>

                            <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-2xl border border-border/50">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-mk-dark dark:text-foreground">Secure Checkout</p>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Your payment information is encrypted and processed securely by M-Pesa.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
