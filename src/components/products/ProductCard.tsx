"use client";

import Link from "next/link";
import { ShoppingBag, Heart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import Image from "next/image";

interface ProductCardProps {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number | null;
    categoryName?: string | null;
    imageUrl?: string;
    variants?: Array<{ id: string; name: string }>;
}

export default function ProductCard({
    id,
    name,
    slug,
    price,
    compareAtPrice,
    categoryName,
    imageUrl,
    variants,
}: ProductCardProps) {
    const { addItem } = useCart();

    const formatPrice = (p: number) => `KSh ${p.toLocaleString("en-KE")}`;

    const hasDiscount = compareAtPrice && compareAtPrice > price;
    const discountPercent = hasDiscount
        ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
        : 0;

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!variants || variants.length === 0) {
            addItem(id, null, 1);
        } else {
            window.location.href = `/shop/${slug}`;
        }
    };

    return (
        <Link href={`/shop/${slug}`} className="group block h-full">
            <div className="card-hover h-full rounded-2xl overflow-hidden bg-white dark:bg-card border border-border/30 flex flex-col">
                {/* Image Container */}
                <div className="relative aspect-[4/5] sm:aspect-square bg-mk-gray dark:bg-muted overflow-hidden">
                    <div className="w-full h-full product-image-zoom relative">
                        {imageUrl && !imageUrl.includes("placeholder") ? (
                            <Image
                                src={imageUrl}
                                alt={name}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-mk-gray dark:bg-muted">
                                <div className="w-16 h-16 mx-auto mb-2 bg-white/50 dark:bg-black/20 rounded-xl flex items-center justify-center">
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                                <span className="text-xs">{name}</span>
                            </div>
                        )}
                        {/* Gradient overlay for better button visibility */}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Discount Badge */}
                    {hasDiscount && (
                        <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-sm z-10">
                            -{discountPercent}%
                        </span>
                    )}

                    {/* Quick Action Buttons */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 z-10">
                        <button className="w-8 h-8 bg-white dark:bg-card text-mk-dark dark:text-foreground rounded-full shadow-md flex items-center justify-center hover:text-destructive hover:scale-110 transition-all border border-border/20">
                            <Heart className="w-4 h-4 transition-colors" />
                        </button>
                    </div>

                    <button
                        onClick={handleQuickAdd}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] h-11 bg-white/95 dark:bg-black/95 backdrop-blur-sm rounded-xl shadow-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-primary hover:text-white font-medium text-sm z-10"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        {!variants || variants.length === 0 ? "Quick Add" : "Choose Options"}
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                    {categoryName && (
                        <p className="text-[11px] text-muted-foreground mb-1.5 uppercase tracking-widest font-semibold">
                            {categoryName}
                        </p>
                    )}
                    <h3 className="font-medium text-[15px] leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {name}
                    </h3>
                    <div className="mt-auto flex items-end gap-2">
                        <span className="font-bold text-base">{formatPrice(price)}</span>
                        {hasDiscount && (
                            <span className="text-xs text-muted-foreground line-through mb-0.5">
                                {formatPrice(compareAtPrice)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
