"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Plus, Minus, ShoppingBag, ArrowRight, Truck } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";

export default function CartDrawer() {
    const { items, subtotal, isOpen, closeCart, updateQuantity, removeItem, isLoading } =
        useCart();

    const formatPrice = (price: number) =>
        `KSh ${price.toLocaleString("en-KE")}`;

    const freeShippingThreshold = 5000;
    const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
    const amountToFreeShipping = Math.max(freeShippingThreshold - subtotal, 0);

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
            <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
                <SheetHeader className="p-6 border-b border-border/50 shadow-sm">
                    <SheetTitle className="flex items-center gap-2 text-lg">
                        <ShoppingBag className="w-5 h-5 text-primary" />
                        Your Cart
                        {items.length > 0 && (
                            <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                {items.length} {items.length === 1 ? "item" : "items"}
                            </span>
                        )}
                    </SheetTitle>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-6 bg-mk-gray/30 dark:bg-muted/10">
                        <div className="w-24 h-24 bg-white dark:bg-card shadow-sm border border-border/50 rounded-full flex items-center justify-center mb-2 animate-float">
                            <ShoppingBag className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                        <div>
                            <p className="font-bold text-xl text-foreground mb-1">Your cart is empty</p>
                            <p className="text-muted-foreground text-sm max-w-[250px]">
                                Add some premium accessories to your cart to get started.
                            </p>
                        </div>
                        <Link href="/shop" className={buttonVariants({ variant: "default", size: "lg", className: "mt-4 rounded-xl" })} onClick={closeCart}>
                            Continue Shopping
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Free Shipping Progress */}
                        <div className="bg-primary/5 py-4 px-6 border-b border-primary/10">
                            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-primary">
                                <Truck className="w-4 h-4" />
                                {amountToFreeShipping > 0 
                                    ? `You're ${formatPrice(amountToFreeShipping)} away from free delivery!` 
                                    : "You've unlocked free delivery!"}
                            </div>
                            <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary transition-all duration-500 ease-out" 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 hide-scrollbar bg-background">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex gap-4 border-b border-border/30 pb-6 last:border-0 last:pb-0 animate-fade-in group"
                                >
                                    {/* Product Image */}
                                    <div className="w-20 h-20 bg-mk-gray dark:bg-muted rounded-xl overflow-hidden flex-shrink-0 relative border border-border/50 shadow-sm transition-transform group-hover:scale-105">
                                        {!item.product.imageUrl.includes("placeholder") ? (
                                            <Image 
                                                src={item.product.imageUrl} 
                                                alt={item.product.name} 
                                                fill 
                                                sizes="80px"
                                                className="object-cover" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                                <ShoppingBag className="w-6 h-6 text-muted-foreground/30" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0 flex flex-col">
                                        <div className="flex justify-between items-start gap-2">
                                            <Link
                                                href={`/shop/${item.product.slug}`}
                                                className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
                                                onClick={closeCart}
                                            >
                                                {item.product.name}
                                            </Link>
                                            <button
                                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors flex-shrink-0"
                                                onClick={() => removeItem(item.id)}
                                                disabled={isLoading}
                                                aria-label="Remove item"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        {item.variant && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Variant: <span className="font-medium text-foreground">{item.variant.name}</span>
                                            </p>
                                        )}
                                        
                                        <div className="mt-auto flex items-center justify-between pt-3">
                                            <p className="font-semibold text-primary">
                                                {formatPrice(
                                                    item.variant?.priceOverride ?? item.priceAtTimeAdded
                                                )}
                                            </p>
                                            
                                            {/* Quantity controls */}
                                            <div className="flex items-center gap-1 border border-border/60 rounded-lg p-0.5 bg-background shadow-sm">
                                                <button
                                                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors disabled:opacity-50"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    disabled={isLoading || item.quantity <= 1}
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-6 text-center text-xs font-semibold">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors disabled:opacity-50"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    disabled={isLoading}
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Cart Footer */}
                        <div className="p-6 border-t border-border/50 bg-background/95 backdrop-blur-sm z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pt-5">
                            <div className="space-y-3 mb-5">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Delivery</span>
                                    <span className={amountToFreeShipping > 0 ? "text-muted-foreground text-xs" : "text-emerald-500 font-medium"}>
                                        {amountToFreeShipping > 0 ? "Calculated at checkout" : "Free Delivery"}
                                    </span>
                                </div>
                                <div className="h-px bg-border/50 my-2"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-base font-bold">Estimated Total</span>
                                    <span className="text-xl font-bold text-primary">
                                        {formatPrice(subtotal)}
                                    </span>
                                </div>
                            </div>
                            <div className="grid gap-3">
                                <Link href="/checkout" className={buttonVariants({ size: "lg", className: "w-full h-14 rounded-xl shadow-md text-base" })} onClick={closeCart}>
                                    Secure Checkout
                                </Link>
                                <Link href="/cart" className={buttonVariants({ variant: "outline", size: "lg", className: "w-full h-12 rounded-xl text-sm" })} onClick={closeCart}>
                                    View Full Cart
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
