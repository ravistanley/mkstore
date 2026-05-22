import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const id = params.id;

        if (!id) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        const [order] = await db
            .select()
            .from(orders)
            .where(eq(orders.id, id))
            .limit(1);

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const items = await db
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, id));

        return NextResponse.json({
            paymentStatus: order.paymentStatus,
            orderStatus: order.orderStatus,
            orderNumber: order.orderNumber,
            fullName: order.fullName,
            phoneNumber: order.phoneNumber,
            email: order.email,
            paymentMethod: order.paymentMethod,
            deliveryMethod: order.deliveryMethod,
            deliveryLocation: order.deliveryLocation,
            mpesaReceipt: order.mpesaReceipt,
            subtotal: Number(order.subtotal),
            deliveryFee: Number(order.deliveryFee),
            total: Number(order.total),
            createdAt: order.createdAt,
            items: items.map((i) => ({
                productName: i.productName,
                variantName: i.variantName,
                quantity: i.quantity,
                price: Number(i.price),
            })),
        });
    } catch (error) {
        console.error("Fetch order status error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
