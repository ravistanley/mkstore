"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { Minus, Plus, ShoppingBag, Check } from "lucide-react";

interface VariantSelectorProps {
    productId: string;
    price: number;
    variants: Array<{
        id: string;
        name: string;
        sku: string | null;
        priceOverride: string | null;
        stockQuantity: number;
    }>;
}

export default function VariantSelector({
    productId,
    price,
    variants,
}: VariantSelectorProps) {
    const { addItem, isLoading } = useCart();
    const [selectedVariant, setSelectedVariant] = useState(
        variants.length > 0 ? variants[0] : null
    );
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);

    const currentPrice = selectedVariant?.priceOverride
        ? Number(selectedVariant.priceOverride)
        : price;

    const isInStock = selectedVariant
        ? selectedVariant.stockQuantity > 0
        : true;

    const formatPrice = (p: number) => `KSh ${p.toLocaleString("en-KE")}`;

    const handleAddToCart = async () => {
        await addItem(productId, selectedVariant?.id || null, quantity);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Variants */}
            {variants.length > 0 && (
                <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">
                        Select Variant
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {variants.map((variant) => (
                            <button
                                key={variant.id}
                                onClick={() => setSelectedVariant(variant)}
                                disabled={variant.stockQuantity === 0}
                                className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${selectedVariant?.id === variant.id
                                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                                        : variant.stockQuantity === 0
                                            ? "border-border bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                                            : "border-border hover:border-primary/50 text-foreground"
                                    }`}
                            >
                                <span className="block">{variant.name}</span>
                                {variant.stockQuantity === 0 && (
                                    <span className="text-xs text-destructive">Out of stock</span>
                                )}
                                {variant.stockQuantity > 0 && variant.stockQuantity <= 5 && (
                                    <span className="text-xs text-amber-600">
                                        Only {variant.stockQuantity} left
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Price Display */}
            <div>
                <span className="text-2xl font-bold text-foreground">
                    {formatPrice(currentPrice)}
                </span>
            </div>

            {/* Quantity */}
            <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                    Quantity
                </label>
                <div className="flex items-center gap-3">
                    <div className="flex items-center border border-border rounded-xl overflow-hidden">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="p-3 hover:bg-muted transition-colors"
                            disabled={quantity <= 1}
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-medium">{quantity}</span>
                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="p-3 hover:bg-muted transition-colors"
                            disabled={
                                selectedVariant
                                    ? quantity >= selectedVariant.stockQuantity
                                    : false
                            }
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    {selectedVariant && selectedVariant.stockQuantity > 0 && (
                        <span className="text-sm text-muted-foreground">
                            {selectedVariant.stockQuantity} in stock
                        </span>
                    )}
                </div>
            </div>

            {/* Add to Cart */}
            <Button
                size="lg"
                className="w-full h-14 text-base font-semibold rounded-xl gap-2"
                disabled={!isInStock || isLoading}
                onClick={handleAddToCart}
            >
                {added ? (
                    <>
                        <Check className="w-5 h-5" />
                        Added to Cart!
                    </>
                ) : isLoading ? (
                    "Adding..."
                ) : (
                    <>
                        <ShoppingBag className="w-5 h-5" />
                        Add to Cart — {formatPrice(currentPrice * quantity)}
                    </>
                )}
            </Button>
        </div>
    );
}
