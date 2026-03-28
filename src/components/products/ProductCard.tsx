"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";

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
        // If no variants, add directly
        if (!variants || variants.length === 0) {
            addItem(id, null, 1);
        }
        // If variants exist, navigate to product page
    };

    return (
        <Link href={`/shop/${slug}`} className="group block">
            <div className="card-hover rounded-2xl overflow-hidden bg-white border border-border/30">
                {/* Image Container */}
                <div className="relative aspect-square bg-mk-gray overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center product-image-zoom">
                        <div className="text-center text-muted-foreground">
                            <div className="w-16 h-16 mx-auto mb-2 bg-white/50 rounded-xl flex items-center justify-center">
                                <ShoppingBag className="w-6 h-6" />
                            </div>
                            <span className="text-xs">{name}</span>
                        </div>
                    </div>

                    {/* Discount Badge */}
                    {hasDiscount && (
                        <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-full">
                            -{discountPercent}%
                        </span>
                    )}

                    {/* Quick Add Button */}
                    <button
                        onClick={handleQuickAdd}
                        className="absolute bottom-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-primary hover:text-white"
                    >
                        <ShoppingBag className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {categoryName && (
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                            {categoryName}
                        </p>
                    )}
                    <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {name}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                        <span className="font-semibold text-sm">{formatPrice(price)}</span>
                        {hasDiscount && (
                            <span className="text-xs text-muted-foreground line-through">
                                {formatPrice(compareAtPrice)}
                            </span>
                        )}
                    </div>
                    {variants && variants.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1.5">
                            {variants.length} variant{variants.length > 1 ? "s" : ""} available
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
}
