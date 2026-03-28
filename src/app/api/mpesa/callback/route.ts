import { NextRequest, NextResponse } from "next/server";
import { processMpesaCallback } from "@/lib/mpesa";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const result = processMpesaCallback(body);

        if (result.success && result.mpesaReceipt) {
            // Find the order by matching the account reference
            // The CheckoutRequestID should be stored with the order for proper matching
            // For now, update by receipt number
            await db
                .update(orders)
                .set({
                    paymentStatus: "completed",
                    orderStatus: "paid",
                    mpesaReceipt: result.mpesaReceipt,
                })
                .where(eq(orders.mpesaReceipt, result.mpesaReceipt));
        }

        // Always respond with success to M-Pesa
        return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    } catch (error) {
        console.error("M-Pesa callback error:", error);
        return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }
}
