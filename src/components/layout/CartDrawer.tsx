"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
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

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
            <SheetContent className="w-full sm:max-w-md flex flex-col">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2 text-lg">
                        <ShoppingBag className="w-5 h-5" />
                        Your Cart
                        {items.length > 0 && (
                            <span className="text-sm font-normal text-muted-foreground">
                                ({items.length} {items.length === 1 ? "item" : "items"})
                            </span>
                        )}
                    </SheetTitle>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Your cart is empty</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Add some items to get started
                            </p>
                        </div>
                        <Link href="/shop" className={buttonVariants({ variant: "default" })} onClick={closeCart}>
                            Continue Shopping
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-4 hide-scrollbar">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex gap-4 py-4 border-b border-border/50 last:border-0 animate-fade-in"
                                >
                                    {/* Product Image */}
                                    <div className="w-20 h-20 bg-mk-gray rounded-xl overflow-hidden flex-shrink-0">
                                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                            {item.product.name.slice(0, 2)}
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/shop/${item.product.slug}`}
                                            className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
                                            onClick={closeCart}
                                        >
                                            {item.product.name}
                                        </Link>
                                        {item.variant && (
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {item.variant.name}
                                            </p>
                                        )}
                                        <p className="text-sm font-semibold mt-1">
                                            {formatPrice(
                                                item.variant?.priceOverride ?? item.priceAtTimeAdded
                                            )}
                                        </p>

                                        {/* Quantity controls */}
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-1 border border-border rounded-lg">
                                                <button
                                                    className="p-1.5 hover:bg-muted rounded-l-lg transition-colors disabled:opacity-50"
                                                    onClick={() =>
                                                        updateQuantity(item.id, item.quantity - 1)
                                                    }
                                                    disabled={isLoading}
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-medium">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    className="p-1.5 hover:bg-muted rounded-r-lg transition-colors disabled:opacity-50"
                                                    onClick={() =>
                                                        updateQuantity(item.id, item.quantity + 1)
                                                    }
                                                    disabled={isLoading}
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <button
                                                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                                                onClick={() => removeItem(item.id)}
                                                disabled={isLoading}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Cart Footer */}
                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Subtotal</span>
                                <span className="text-lg font-semibold">
                                    {formatPrice(subtotal)}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Delivery fees calculated at checkout
                            </p>
                            <div className="grid gap-2">
                                <Link href="/checkout" className={buttonVariants({ size: "lg", className: "w-full" })} onClick={closeCart}>
                                    Checkout
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                                <Link href="/cart" className={buttonVariants({ variant: "outline", size: "lg", className: "w-full" })} onClick={closeCart}>
                                    View Cart
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
