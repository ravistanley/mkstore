"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import Image from "next/image";
import { useState } from "react";

interface ProductCardProps {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number | null;
    categoryName?: string | null;
    imageUrl?: string;
    variants?: Array<{ id: string; name: string }>;
    priority?: boolean;
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
    priority,
}: ProductCardProps) {
    const { addItem } = useCart();

    const formatPrice = (p: number) => `KSh ${p.toLocaleString("en-KE")}`;

    const hasDiscount = compareAtPrice && compareAtPrice > price;
    const discountPercent = hasDiscount
        ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
        : 0;

    const [imgError, setImgError] = useState(false);
    const hasRealImage = imageUrl && !imageUrl.includes("placeholder") && !imgError;

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
            <div className="card-hover h-full rounded-xl overflow-hidden bg-white dark:bg-card border border-border flex flex-col">

                {/* Image Container */}
                <div className="relative aspect-square bg-mk-gray dark:bg-muted overflow-hidden">
                    {hasRealImage ? (
                        <div className="w-full h-full product-image-zoom relative">
                            <Image
                                src={imageUrl!}
                                alt={name}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                className="object-cover"
                                onError={() => setImgError(true)}
                                priority={priority}
                            />
                        </div>
                    ) : (
                        /* Clean, intentional placeholder — not broken-looking */
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#F0EDE8] dark:bg-muted p-6">
                            <div className="w-14 h-14 rounded-2xl bg-white/60 dark:bg-white/10 flex items-center justify-center mb-3 shadow-sm">
                                <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-center text-muted-foreground font-medium line-clamp-2 max-w-[120px] leading-relaxed">
                                {name}
                            </p>
                        </div>
                    )}

                    {/* Discount badge */}
                    {hasDiscount && (
                        <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-[11px] font-bold px-2 py-0.5 rounded-md z-10 tracking-wide">
                            -{discountPercent}%
                        </span>
                    )}

                    {/* Quick add — appears on hover at the bottom */}
                    <button
                        onClick={handleQuickAdd}
                        className="absolute bottom-0 inset-x-0 py-3 bg-mk-dark/95 dark:bg-black/95 text-white flex items-center justify-center gap-2 text-sm font-medium translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        {!variants || variants.length === 0 ? "Add to cart" : "Choose options"}
                    </button>
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1 gap-1">
                    {categoryName && (
                        <p className="text-[11px] text-[#6B7280] uppercase tracking-[0.14em] font-semibold">
                            {categoryName}
                        </p>
                    )}
                    <h3 className="font-medium text-[14px] leading-snug text-[#111827] group-hover:text-primary transition-colors line-clamp-2 flex-1">
                        {name}
                    </h3>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="font-bold text-base text-foreground">{formatPrice(price)}</span>
                        {hasDiscount && (
                            <span className="text-xs text-muted-foreground line-through">
                                {formatPrice(compareAtPrice)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
