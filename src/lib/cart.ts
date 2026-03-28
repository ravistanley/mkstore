import { cookies } from "next/headers";
import { db } from "./db";
import {
    carts,
    cartItems,
    products,
    productVariants,
    productImages,
} from "./db/schema";
import { eq, and } from "drizzle-orm";

const CART_COOKIE_NAME = "mk_cart_id";
const CART_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export async function getOrCreateCartId(): Promise<string> {
    const cookieStore = await cookies();
    const existingCartId = cookieStore.get(CART_COOKIE_NAME)?.value;

    if (existingCartId) {
        // Verify cart exists
        try {
            const [existing] = await db
                .select({ id: carts.id })
                .from(carts)
                .where(eq(carts.id, existingCartId))
                .limit(1);

            if (existing) return existing.id;
        } catch {
            // Cart not found, create new one
        }
    }

    // Create new cart
    const [newCart] = await db.insert(carts).values({}).returning({ id: carts.id });

    cookieStore.set(CART_COOKIE_NAME, newCart.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: CART_MAX_AGE,
        path: "/",
    });

    return newCart.id;
}

export async function getCartId(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(CART_COOKIE_NAME)?.value || null;
}

export async function getCartWithItems(cartId: string) {
    const items = await db
        .select({
            itemId: cartItems.id,
            cartId: cartItems.cartId,
            productId: cartItems.productId,
            variantId: cartItems.variantId,
            quantity: cartItems.quantity,
            priceAtTimeAdded: cartItems.priceAtTimeAdded,
            productName: products.name,
            productSlug: products.slug,
            productPrice: products.price,
            variantName: productVariants.name,
            variantPrice: productVariants.priceOverride,
            variantStock: productVariants.stockQuantity,
        })
        .from(cartItems)
        .innerJoin(products, eq(cartItems.productId, products.id))
        .leftJoin(productVariants, eq(cartItems.variantId, productVariants.id))
        .where(eq(cartItems.cartId, cartId));

    // Get images for each product
    const productIds = [...new Set(items.map((i) => i.productId))];
    const allImages = productIds.length
        ? await db
            .select()
            .from(productImages)
            .where(eq(productImages.position, 0))
        : [];

    const imageMap = new Map(allImages.map((img) => [img.productId, img.url]));

    return items.map((item) => ({
        id: item.itemId,
        cartId: item.cartId,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        priceAtTimeAdded: Number(item.priceAtTimeAdded),
        product: {
            name: item.productName,
            slug: item.productSlug,
            price: Number(item.productPrice),
            imageUrl: imageMap.get(item.productId) || "/placeholder.svg",
        },
        variant: item.variantId
            ? {
                name: item.variantName!,
                priceOverride: item.variantPrice ? Number(item.variantPrice) : null,
                stockQuantity: item.variantStock || 0,
            }
            : null,
    }));
}

export async function addItemToCart(
    cartId: string,
    productId: string,
    variantId: string | null,
    quantity: number,
    price: number
) {
    // Check if item already exists in cart
    const conditions = [
        eq(cartItems.cartId, cartId),
        eq(cartItems.productId, productId),
    ];

    if (variantId) {
        conditions.push(eq(cartItems.variantId, variantId));
    }

    const [existingItem] = await db
        .select()
        .from(cartItems)
        .where(and(...conditions))
        .limit(1);

    if (existingItem) {
        // Update quantity
        await db
            .update(cartItems)
            .set({ quantity: existingItem.quantity + quantity })
            .where(eq(cartItems.id, existingItem.id));
    } else {
        // Insert new item
        await db.insert(cartItems).values({
            cartId,
            productId,
            variantId,
            quantity,
            priceAtTimeAdded: price.toFixed(2),
        });
    }
}

export async function updateCartItemQuantity(
    itemId: string,
    quantity: number
) {
    if (quantity <= 0) {
        await db.delete(cartItems).where(eq(cartItems.id, itemId));
    } else {
        await db
            .update(cartItems)
            .set({ quantity })
            .where(eq(cartItems.id, itemId));
    }
}

export async function removeCartItem(itemId: string) {
    await db.delete(cartItems).where(eq(cartItems.id, itemId));
}

export async function clearCart(cartId: string) {
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
}

export async function getCartItemCount(cartId: string): Promise<number> {
    const items = await db
        .select({ quantity: cartItems.quantity })
        .from(cartItems)
        .where(eq(cartItems.cartId, cartId));

    return items.reduce((sum, item) => sum + item.quantity, 0);
}
