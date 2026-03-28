import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, productImages, productVariants, categories } from "@/lib/db/schema";
import { eq, ilike, desc, and, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const category = searchParams.get("category");
        const search = searchParams.get("search");
        const featured = searchParams.get("featured");
        const limit = Number(searchParams.get("limit")) || 20;
        const offset = Number(searchParams.get("offset")) || 0;

        const conditions = [eq(products.active, true)];

        if (category) {
            const [cat] = await db
                .select({ id: categories.id })
                .from(categories)
                .where(eq(categories.slug, category))
                .limit(1);

            if (cat) {
                conditions.push(eq(products.categoryId, cat.id));
            }
        }

        if (search) {
            conditions.push(
                or(
                    ilike(products.name, `%${search}%`),
                    ilike(products.description, `%${search}%`)
                )!
            );
        }

        if (featured === "true") {
            conditions.push(eq(products.featured, true));
        }

        const results = await db
            .select({
                id: products.id,
                name: products.name,
                slug: products.slug,
                description: products.description,
                price: products.price,
                compareAtPrice: products.compareAtPrice,
                categoryId: products.categoryId,
                featured: products.featured,
                createdAt: products.createdAt,
                categoryName: categories.name,
                categorySlug: categories.slug,
            })
            .from(products)
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .where(and(...conditions))
            .orderBy(desc(products.updatedAt))
            .limit(limit)
            .offset(offset);

        // Get images and variants for each product
        const productIds = results.map((p) => p.id);

        const allImages =
            productIds.length > 0
                ? await db.select().from(productImages)
                : [];

        const allVariants =
            productIds.length > 0
                ? await db.select().from(productVariants)
                : [];

        const productsWithRelations = results.map((product) => ({
            ...product,
            price: Number(product.price),
            compareAtPrice: product.compareAtPrice
                ? Number(product.compareAtPrice)
                : null,
            category: product.categoryId
                ? { id: product.categoryId, name: product.categoryName, slug: product.categorySlug }
                : null,
            images: allImages
                .filter((img) => img.productId === product.id)
                .sort((a, b) => a.position - b.position),
            variants: allVariants.filter((v) => v.productId === product.id),
        }));

        return NextResponse.json({ products: productsWithRelations });
    } catch (error) {
        console.error("Products GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}
