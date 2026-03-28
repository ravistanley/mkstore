import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
    orders,
    orderItems,
    cartItems,
    products,
    productVariants,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getCartId, getCartWithItems, clearCart } from "@/lib/cart";
import { checkoutSchema } from "@/lib/validators";
import { initiateSTKPush } from "@/lib/mpesa";

function generateOrderNumber(): string {
    const prefix = "MK";
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = checkoutSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const cartId = await getCartId();
        if (!cartId) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        const items = await getCartWithItems(cartId);
        if (items.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        // Validate stock for all items
        for (const item of items) {
            if (item.variant) {
                if (item.variant.stockQuantity < item.quantity) {
                    return NextResponse.json(
                        {
                            error: `Insufficient stock for ${item.product.name} (${item.variant.name}). Only ${item.variant.stockQuantity} available.`,
                        },
                        { status: 400 }
                    );
                }
            }
        }

        // Calculate totals
        const subtotal = items.reduce(
            (sum, item) =>
                sum +
                (item.variant?.priceOverride ?? item.priceAtTimeAdded) * item.quantity,
            0
        );

        const deliveryFee = parsed.data.deliveryMethod === "delivery" ? 300 : 0;
        const total = subtotal + deliveryFee;

        const orderNumber = generateOrderNumber();

        // Create order
        const [order] = await db
            .insert(orders)
            .values({
                orderNumber,
                fullName: parsed.data.fullName,
                phoneNumber: parsed.data.phoneNumber,
                email: parsed.data.email || null,
                deliveryLocation: parsed.data.deliveryLocation,
                deliveryNotes: parsed.data.deliveryNotes || null,
                deliveryMethod: parsed.data.deliveryMethod,
                paymentMethod: parsed.data.paymentMethod,
                paymentStatus: "pending",
                orderStatus: "pending",
                subtotal: subtotal.toFixed(2),
                deliveryFee: deliveryFee.toFixed(2),
                total: total.toFixed(2),
            })
            .returning();

        // Create order items
        const orderItemsData = items.map((item) => ({
            orderId: order.id,
            productId: item.productId,
            variantId: item.variantId,
            productName: item.product.name,
            variantName: item.variant?.name || null,
            quantity: item.quantity,
            price: (item.variant?.priceOverride ?? item.priceAtTimeAdded).toFixed(2),
        }));

        await db.insert(orderItems).values(orderItemsData);

        // Reduce stock for variant items
        for (const item of items) {
            if (item.variantId) {
                await db
                    .update(productVariants)
                    .set({
                        stockQuantity: (item.variant?.stockQuantity || 0) - item.quantity,
                    })
                    .where(eq(productVariants.id, item.variantId));
            }
        }

        // Clear cart
        await clearCart(cartId);

        // Initiate M-Pesa payment if selected
        let mpesaResult = null;
        if (parsed.data.paymentMethod === "mpesa") {
            try {
                mpesaResult = await initiateSTKPush(
                    parsed.data.phoneNumber,
                    total,
                    orderNumber
                );
            } catch (error) {
                console.error("M-Pesa STK push error:", error);
                // Order is still created, payment can be retried
            }
        }

        return NextResponse.json({
            success: true,
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                total,
                paymentMethod: parsed.data.paymentMethod,
            },
            mpesa: mpesaResult,
        });
    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json(
            { error: "Checkout failed. Please try again." },
            { status: 500 }
        );
    }
}
