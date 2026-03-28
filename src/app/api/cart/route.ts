import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, productVariants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
    getOrCreateCartId,
    getCartId,
    getCartWithItems,
    addItemToCart,
    updateCartItemQuantity,
    removeCartItem,
} from "@/lib/cart";
import { addToCartSchema, updateCartItemSchema } from "@/lib/validators";

// GET /api/cart — Get cart items
export async function GET() {
    try {
        const cartId = await getCartId();

        if (!cartId) {
            return NextResponse.json({ items: [], itemCount: 0 });
        }

        const items = await getCartWithItems(cartId);
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

        return NextResponse.json({ items, itemCount });
    } catch (error) {
        console.error("Cart GET error:", error);
        return NextResponse.json({ items: [], itemCount: 0 });
    }
}

// POST /api/cart — Add item to cart
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = addToCartSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { productId, variantId, quantity } = parsed.data;

        // Validate product exists
        const [product] = await db
            .select({ id: products.id, price: products.price, active: products.active })
            .from(products)
            .where(eq(products.id, productId))
            .limit(1);

        if (!product || !product.active) {
            return NextResponse.json(
                { error: "Product not found or inactive" },
                { status: 404 }
            );
        }

        let price = Number(product.price);

        // Validate variant if provided
        if (variantId) {
            const [variant] = await db
                .select()
                .from(productVariants)
                .where(eq(productVariants.id, variantId))
                .limit(1);

            if (!variant) {
                return NextResponse.json(
                    { error: "Variant not found" },
                    { status: 404 }
                );
            }

            if (variant.stockQuantity < quantity) {
                return NextResponse.json(
                    { error: "Insufficient stock" },
                    { status: 400 }
                );
            }

            if (variant.priceOverride) {
                price = Number(variant.priceOverride);
            }
        }

        const cartId = await getOrCreateCartId();
        await addItemToCart(cartId, productId, variantId || null, quantity, price);

        const items = await getCartWithItems(cartId);

        return NextResponse.json({ success: true, items });
    } catch (error) {
        console.error("Cart POST error:", error);
        return NextResponse.json(
            { error: "Failed to add to cart" },
            { status: 500 }
        );
    }
}

// PATCH /api/cart — Update item quantity
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = updateCartItemSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        await updateCartItemQuantity(parsed.data.itemId, parsed.data.quantity);

        const cartId = await getCartId();
        const items = cartId ? await getCartWithItems(cartId) : [];

        return NextResponse.json({ success: true, items });
    } catch (error) {
        console.error("Cart PATCH error:", error);
        return NextResponse.json(
            { error: "Failed to update cart" },
            { status: 500 }
        );
    }
}

// DELETE /api/cart?itemId=xxx — Remove item from cart
export async function DELETE(request: NextRequest) {
    try {
        const itemId = request.nextUrl.searchParams.get("itemId");

        if (!itemId) {
            return NextResponse.json(
                { error: "Item ID required" },
                { status: 400 }
            );
        }

        await removeCartItem(itemId);

        const cartId = await getCartId();
        const items = cartId ? await getCartWithItems(cartId) : [];

        return NextResponse.json({ success: true, items });
    } catch (error) {
        console.error("Cart DELETE error:", error);
        return NextResponse.json(
            { error: "Failed to remove from cart" },
            { status: 500 }
        );
    }
}
