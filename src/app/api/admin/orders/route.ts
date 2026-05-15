import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, payments, deliveryTracking, adminUsers } from "@/lib/db/schema";
import { eq, desc, count, sum } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";
import { updateOrderStatusSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = request.nextUrl;
        const status = searchParams.get("status");
        const limit = Number(searchParams.get("limit")) || 50;
        const dashboard = searchParams.get("dashboard");
        const id = searchParams.get("id");

        if (id) {
            const [order] = await db.select().from(orders).where(eq(orders.id, id));
            if (!order) {
                return NextResponse.json({ error: "Order not found" }, { status: 404 });
            }
            const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
            const paymentLogs = await db.select().from(payments).where(eq(payments.orderId, id)).orderBy(desc(payments.createdAt));
            const deliveryLogs = await db.select().from(deliveryTracking).where(eq(deliveryTracking.orderId, id)).orderBy(desc(deliveryTracking.createdAt));
            
            return NextResponse.json({ ...order, items, payments: paymentLogs, deliveryTracking: deliveryLogs });
        }

        // Dashboard stats
        if (dashboard === "true") {
            const allOrders = await db.select().from(orders);
            const totalOrders = allOrders.length;
            const totalRevenue = allOrders
                .filter((o) => o.paymentStatus === "success")
                .reduce((sum, o) => sum + Number(o.total), 0);
            const pendingOrders = allOrders.filter(
                (o) => o.orderStatus === "pending"
            ).length;
            const recentOrders = allOrders
                .sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
                .slice(0, 5);

            return NextResponse.json({
                stats: {
                    totalOrders,
                    totalRevenue,
                    pendingOrders,
                    completedOrders: allOrders.filter(
                        (o) => o.orderStatus === "delivered"
                    ).length,
                },
                recentOrders,
            });
        }

        // List orders
        let query = db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);

        const allOrders = await query;

        const filtered = status
            ? allOrders.filter((o) => o.orderStatus === status)
            : allOrders;

        return NextResponse.json({ orders: filtered });
    } catch (error) {
        console.error("Admin orders GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch orders" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Order ID required" },
                { status: 400 }
            );
        }

        const parsed = updateOrderStatusSchema.safeParse(updates);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const updateData: Record<string, string> = {};

        if (parsed.data.orderStatus) {
            updateData.orderStatus = parsed.data.orderStatus;
        }

        if (parsed.data.paymentStatus) {
            updateData.paymentStatus = parsed.data.paymentStatus;
        }

        if (parsed.data.mpesaReceipt) {
            updateData.mpesaReceipt = parsed.data.mpesaReceipt;
        }

        // Get admin user ID if it exists
        const [adminUser] = await db.select().from(adminUsers).where(eq(adminUsers.email, session.email)).limit(1);

        await db.transaction(async (tx) => {
            await tx.update(orders).set(updateData).where(eq(orders.id, id));

            if (parsed.data.paymentStatus) {
                await tx.insert(payments).values({
                    orderId: id,
                    provider: "MANUAL",
                    amount: "0",
                    status: parsed.data.paymentStatus as any,
                    rawWebhookData: { note: "Manual update by admin", updatedByEmail: session.email },
                });
            }

            if (parsed.data.orderStatus) {
                await tx.insert(deliveryTracking).values({
                    orderId: id,
                    status: parsed.data.orderStatus as any,
                    notes: "Status updated manually",
                    updatedBy: adminUser?.id || null,
                });
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Admin order update error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to update order" },
            { status: 500 }
        );
    }
}
