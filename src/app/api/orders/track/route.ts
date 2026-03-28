import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { trackOrderSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = trackOrderSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const [order] = await db
            .select()
            .from(orders)
            .where(
                and(
                    eq(orders.orderNumber, parsed.data.orderNumber),
                    eq(orders.phoneNumber, parsed.data.phoneNumber)
                )
            )
            .limit(1);

        if (!order) {
            return NextResponse.json(
                { error: "Order not found. Please check your order number and phone number." },
                { status: 404 }
            );
        }

        const items = await db
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, order.id));

        return NextResponse.json({
            order: {
                orderNumber: order.orderNumber,
                fullName: order.fullName,
                orderStatus: order.orderStatus,
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod,
                deliveryMethod: order.deliveryMethod,
                deliveryLocation: order.deliveryLocation,
                subtotal: Number(order.subtotal),
                deliveryFee: Number(order.deliveryFee),
                total: Number(order.total),
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
                items: items.map((item) => ({
                    productName: item.productName,
                    variantName: item.variantName,
                    quantity: item.quantity,
                    price: Number(item.price),
                })),
            },
        });
    } catch (error) {
        console.error("Track order error:", error);
        return NextResponse.json(
            { error: "Failed to track order" },
            { status: 500 }
        );
    }
}
