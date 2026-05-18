import { NextRequest, NextResponse } from "next/server";
import { processMpesaCallback } from "@/lib/mpesa";
import { db } from "@/lib/db";
import { orders, payments, orderItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const result = processMpesaCallback(body);

        if (result.success && result.mpesaReceipt && result.checkoutRequestId) {
            // Find the order by matching the secure checkoutRequestId
            const [order] = await db
                .select()
                .from(orders)
                .where(eq(orders.checkoutRequestId, result.checkoutRequestId))
                .limit(1);

            if (order) {
                // Idempotency Check: Has this transaction already been processed?
                const [existingPayment] = await db
                    .select()
                    .from(payments)
                    .where(eq(payments.transactionId, result.mpesaReceipt))
                    .limit(1);

                if (!existingPayment) {
                    // Atomic transaction: Insert payment log and update order
                    await db.transaction(async (tx) => {
                        await tx.insert(payments).values({
                            orderId: order.id,
                            transactionId: result.mpesaReceipt!,
                            provider: "MPESA",
                            checkoutRequestId: result.checkoutRequestId!,
                            amount: result.amount?.toString() || "0",
                            status: "success",
                            rawWebhookData: body,
                        });

                        await tx
                            .update(orders)
                            .set({
                                paymentStatus: "success",
                                orderStatus: "paid",
                                mpesaReceipt: result.mpesaReceipt,
                            })
                            .where(eq(orders.id, order.id));
                    });

                    // Send order confirmation email after successful payment
                    if (order.email) {
                        const savedItems = await db
                            .select()
                            .from(orderItems)
                            .where(eq(orderItems.orderId, order.id));

                        sendOrderConfirmationEmail({
                            orderNumber: order.orderNumber,
                            fullName: order.fullName,
                            email: order.email,
                            paymentMethod: "mpesa",
                            deliveryMethod: order.deliveryMethod,
                            deliveryLocation: order.deliveryLocation,
                            deliveryNotes: order.deliveryNotes,
                            subtotal: Number(order.subtotal),
                            deliveryFee: Number(order.deliveryFee),
                            total: Number(order.total),
                            mpesaReceipt: result.mpesaReceipt,
                            items: savedItems.map((i) => ({
                                productName: i.productName,
                                variantName: i.variantName,
                                quantity: i.quantity,
                                price: Number(i.price),
                            })),
                        }).catch(console.error);
                    }
                } else {
                    console.log(`[M-Pesa Webhook] Duplicate transaction ID ${result.mpesaReceipt} ignored.`);
                }
            } else {
                console.error(`[M-Pesa Webhook] Order not found for CheckoutRequestID: ${result.checkoutRequestId}`);
            }
        } else if (!result.success && result.checkoutRequestId) {
            // Handle failed payment securely
            const [order] = await db
                .select()
                .from(orders)
                .where(eq(orders.checkoutRequestId, result.checkoutRequestId))
                .limit(1);

            if (order) {
                await db.transaction(async (tx) => {
                    await tx.insert(payments).values({
                        orderId: order.id,
                        provider: "MPESA",
                        checkoutRequestId: result.checkoutRequestId!,
                        amount: "0",
                        status: "failed",
                        rawWebhookData: body,
                    });

                    await tx
                        .update(orders)
                        .set({
                            paymentStatus: "failed",
                            orderStatus: "failed",
                        })
                        .where(eq(orders.id, order.id));
                });
            }
        }

        // Always respond with success to M-Pesa to prevent retries of invalid payloads
        return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    } catch (error) {
        console.error("M-Pesa callback error:", error);
        return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }
}
