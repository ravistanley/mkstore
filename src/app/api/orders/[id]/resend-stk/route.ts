import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { initiateSTKPush, normalizePhoneNumber } from "@/lib/mpesa";

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const id = params.id;

        if (!id) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        // Parse optional phone number from request body
        let reqPhoneNumber: string | undefined;
        try {
            const body = await request.json();
            reqPhoneNumber = body.phoneNumber;
        } catch {
            // Body might be empty, which is fine
        }

        // Fetch the order
        const [order] = await db
            .select()
            .from(orders)
            .where(eq(orders.id, id))
            .limit(1);

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Prevent resending if order is already paid
        if (order.paymentStatus === "success") {
            return NextResponse.json(
                { error: "This order has already been paid successfully." },
                { status: 400 }
            );
        }

        // Prevent resending if order is not an M-Pesa order
        if (order.paymentMethod !== "mpesa") {
            return NextResponse.json(
                { error: "Payment method for this order is not M-Pesa." },
                { status: 400 }
            );
        }

        // Determine phone number to use
        const targetPhoneNumber = reqPhoneNumber || order.phoneNumber;
        if (!targetPhoneNumber) {
            return NextResponse.json(
                { error: "Phone number is required." },
                { status: 400 }
            );
        }

        // Normalize phone number
        const normalizedPhone = normalizePhoneNumber(targetPhoneNumber);

        // Initiate STK Push
        const mpesaResult = await initiateSTKPush(
            normalizedPhone,
            Number(order.total),
            order.orderNumber
        );

        if (!mpesaResult.success) {
            return NextResponse.json(
                { error: mpesaResult.error || "Failed to initiate STK push." },
                { status: 400 }
            );
        }

        // Update order in database with the new checkoutRequestId, normalized phone, and reset statuses to pending
        await db
            .update(orders)
            .set({
                checkoutRequestId: mpesaResult.checkoutRequestId,
                phoneNumber: targetPhoneNumber, // Save the phone number they confirmed/entered
                paymentStatus: "pending",
                orderStatus: "pending",
            })
            .where(eq(orders.id, order.id));

        return NextResponse.json({
            success: true,
            checkoutRequestId: mpesaResult.checkoutRequestId,
            phoneNumber: targetPhoneNumber,
        });
    } catch (error) {
        console.error("Resend STK push error:", error);
        return NextResponse.json(
            { error: "Internal server error. Please try again." },
            { status: 500 }
        );
    }
}
