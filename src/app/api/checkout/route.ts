import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
    orders,
    orderItems,
    productVariants,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCartId, getCartWithItems, clearCart } from "@/lib/cart";
import { checkoutSchema } from "@/lib/validators";
import { initiateSTKPush } from "@/lib/mpesa";
import { sendOrderConfirmationEmail } from "@/lib/email";

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
                (item.variant?.priceOverride ?? item.product.price) * item.quantity,
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
                email: parsed.data.email,
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
            price: (item.variant?.priceOverride ?? item.product.price).toFixed(2),
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
                
                // Secure Webhook: Store the CheckoutRequestID to match with Daraja's callback
                if (mpesaResult.success && mpesaResult.checkoutRequestId) {
                    await db
                        .update(orders)
                        .set({ checkoutRequestId: mpesaResult.checkoutRequestId })
                        .where(eq(orders.id, order.id));
                }
            } catch (error) {
                console.error("M-Pesa STK push error:", error);
                // Order is still created, payment can be retried
            }
        }

        // Send confirmation email immediately for Pay on Delivery
        if (parsed.data.paymentMethod === "pay_on_delivery" && parsed.data.email) {
            const savedItems = await db
                .select()
                .from(orderItems)
                .where(eq(orderItems.orderId, order.id));

            sendOrderConfirmationEmail({
                orderNumber,
                fullName: parsed.data.fullName,
                email: parsed.data.email,
                paymentMethod: parsed.data.paymentMethod,
                deliveryMethod: parsed.data.deliveryMethod,
                deliveryLocation: parsed.data.deliveryLocation,
                deliveryNotes: parsed.data.deliveryNotes,
                subtotal,
                deliveryFee,
                total,
                items: savedItems.map((i) => ({
                    productName: i.productName,
                    variantName: i.variantName,
                    quantity: i.quantity,
                    price: Number(i.price),
                })),
            }).catch(console.error); // fire-and-forget, don't block response
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
