"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    ReactNode,
} from "react";

interface CartProduct {
    name: string;
    slug: string;
    price: number;
    imageUrl: string;
}

interface CartVariant {
    name: string;
    priceOverride: number | null;
    stockQuantity: number;
}

export interface CartItemData {
    id: string;
    cartId: string;
    productId: string;
    variantId: string | null;
    quantity: number;
    priceAtTimeAdded: number;
    product: CartProduct;
    variant: CartVariant | null;
}

interface CartContextType {
    items: CartItemData[];
    itemCount: number;
    subtotal: number;
    isOpen: boolean;
    isLoading: boolean;
    openCart: () => void;
    closeCart: () => void;
    addItem: (
        productId: string,
        variantId: string | null,
        quantity: number
    ) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number) => Promise<void>;
    removeItem: (itemId: string) => Promise<void>;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItemData[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce(
        (sum, item) =>
            sum +
            (item.variant?.priceOverride ?? item.priceAtTimeAdded) * item.quantity,
        0
    );

    const refreshCart = useCallback(async () => {
        try {
            const res = await fetch("/api/cart");
            if (res.ok) {
                const data = await res.json();
                setItems(data.items || []);
            }
        } catch (error) {
            console.error("Failed to fetch cart:", error);
        }
    }, []);

    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    const addItem = useCallback(
        async (
            productId: string,
            variantId: string | null,
            quantity: number
        ) => {
            setIsLoading(true);
            try {
                const res = await fetch("/api/cart", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId, variantId, quantity }),
                });

                if (res.ok) {
                    await refreshCart();
                    setIsOpen(true);
                }
            } catch (error) {
                console.error("Failed to add item:", error);
            } finally {
                setIsLoading(false);
            }
        },
        [refreshCart]
    );

    const updateQuantity = useCallback(
        async (itemId: string, quantity: number) => {
            setIsLoading(true);
            try {
                const res = await fetch("/api/cart", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ itemId, quantity }),
                });

                if (res.ok) {
                    await refreshCart();
                }
            } catch (error) {
                console.error("Failed to update quantity:", error);
            } finally {
                setIsLoading(false);
            }
        },
        [refreshCart]
    );

    const removeItem = useCallback(
        async (itemId: string) => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/cart?itemId=${itemId}`, {
                    method: "DELETE",
                });

                if (res.ok) {
                    await refreshCart();
                }
            } catch (error) {
                console.error("Failed to remove item:", error);
            } finally {
                setIsLoading(false);
            }
        },
        [refreshCart]
    );

    return (
        <CartContext.Provider
            value={{
                items,
                itemCount,
                subtotal,
                isOpen,
                isLoading,
                openCart: () => setIsOpen(true),
                closeCart: () => setIsOpen(false),
                addItem,
                updateQuantity,
                removeItem,
                refreshCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
