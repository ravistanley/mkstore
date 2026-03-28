import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";
import { createCategorySchema } from "@/lib/validators";

export async function GET() {
    try {
        const allCategories = await db.select().from(categories);
        return NextResponse.json({ categories: allCategories });
    } catch (error) {
        console.error("Categories GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch categories" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const parsed = createCategorySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const [category] = await db
            .insert(categories)
            .values(parsed.data)
            .returning();

        return NextResponse.json({ success: true, category });
    } catch (error) {
        console.error("Category create error:", error);
        return NextResponse.json(
            { error: "Failed to create category" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Category ID required" },
                { status: 400 }
            );
        }

        const parsed = createCategorySchema.partial().safeParse(updates);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        await db.update(categories).set(parsed.data).where(eq(categories.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Category update error:", error);
        return NextResponse.json(
            { error: "Failed to update category" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const id = request.nextUrl.searchParams.get("id");
        if (!id) {
            return NextResponse.json(
                { error: "Category ID required" },
                { status: 400 }
            );
        }

        await db.delete(categories).where(eq(categories.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Category delete error:", error);
        return NextResponse.json(
            { error: "Failed to delete category" },
            { status: 500 }
        );
    }
}
