import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
    products,
    productVariants,
    productImages,
    categories,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";
import { createProductSchema, createVariantSchema } from "@/lib/validators";

async function requireAdmin() {
    const session = await getAdminSession();
    if (!session) {
        return null;
    }
    return session;
}

// GET /api/admin/products — List all products or get single product
export async function GET(request: NextRequest) {
    const session = await requireAdmin();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const id = request.nextUrl.searchParams.get("id");

        if (id) {
            const [product] = await db
                .select({
                    id: products.id,
                    name: products.name,
                    slug: products.slug,
                    description: products.description,
                    price: products.price,
                    compareAtPrice: products.compareAtPrice,
                    categoryId: products.categoryId,
                    featured: products.featured,
                    active: products.active,
                    createdAt: products.createdAt,
                    updatedAt: products.updatedAt,
                })
                .from(products)
                .where(eq(products.id, id))
                .limit(1);

            if (!product) {
                return NextResponse.json({ error: "Product not found" }, { status: 404 });
            }

            const productVars = await db.select().from(productVariants).where(eq(productVariants.productId, id));
            const productImgs = await db.select().from(productImages).where(eq(productImages.productId, id)).orderBy(productImages.position);

            return NextResponse.json({
                ...product,
                price: Number(product.price),
                compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
                variants: productVars,
                images: productImgs,
            });
        }

        const allProducts = await db
            .select({
                id: products.id,
                name: products.name,
                slug: products.slug,
                price: products.price,
                featured: products.featured,
                active: products.active,
                createdAt: products.createdAt,
                updatedAt: products.updatedAt,
                categoryName: categories.name,
            })
            .from(products)
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .orderBy(desc(products.updatedAt));

        // Get variant counts and image counts
        const allVariants = await db.select().from(productVariants);
        const allImages = await db.select().from(productImages);

        const enriched = allProducts.map((p) => {
            const pImages = allImages.filter((img) => img.productId === p.id).sort((a, b) => a.position - b.position);
            const pVariants = allVariants.filter((v) => v.productId === p.id);

            return {
                ...p,
                price: Number(p.price),
                variantCount: pVariants.length,
                imageCount: pImages.length,
                imageUrl: pImages.length > 0 ? pImages[0].url : null,
                totalStock: pVariants.reduce((sum, v) => sum + v.stockQuantity, 0),
            };
        });

        return NextResponse.json({ products: enriched });
    } catch (error) {
        console.error("Admin products GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}

// POST /api/admin/products — Create product
export async function POST(request: NextRequest) {
    const session = await requireAdmin();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { variants, images, ...productData } = body;

        const parsed = createProductSchema.safeParse(productData);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const [product] = await db
            .insert(products)
            .values({
                ...parsed.data,
                price: parsed.data.price.toFixed(2),
                compareAtPrice: parsed.data.compareAtPrice
                    ? parsed.data.compareAtPrice.toFixed(2)
                    : null,
            })
            .returning();

        // Add variants if provided
        if (variants && Array.isArray(variants)) {
            for (const variant of variants) {
                const vParsed = createVariantSchema.safeParse(variant);
                if (vParsed.success) {
                    await db.insert(productVariants).values({
                        productId: product.id,
                        ...vParsed.data,
                        priceOverride: vParsed.data.priceOverride?.toFixed(2) || null,
                    });
                }
            }
        }

        // Add images if provided
        if (images && Array.isArray(images)) {
            for (let i = 0; i < images.length; i++) {
                await db.insert(productImages).values({
                    productId: product.id,
                    url: images[i].url,
                    altText: images[i].altText || product.name,
                    position: i,
                });
            }
        }

        return NextResponse.json({ success: true, product });
    } catch (error: any) {
        console.error("Admin product create error:", error);
        
        if (error.code === '23505' && error.constraint === 'products_slug_key') {
            return NextResponse.json(
                { error: "A product with this name already exists. Please choose a different name." },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create product" },
            { status: 500 }
        );
    }
}

// PUT /api/admin/products — Update product
export async function PUT(request: NextRequest) {
    const session = await requireAdmin();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, variants, images, ...updates } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Product ID required" },
                { status: 400 }
            );
        }

        const parsed = createProductSchema.partial().safeParse(updates);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const updateData: Record<string, unknown> = { ...parsed.data };
        if (parsed.data.price !== undefined) {
            updateData.price = parsed.data.price.toFixed(2);
        }
        if (parsed.data.compareAtPrice !== undefined) {
            updateData.compareAtPrice = parsed.data.compareAtPrice
                ? parsed.data.compareAtPrice.toFixed(2)
                : null;
        }

        await db.update(products).set(updateData).where(eq(products.id, id));

        // Update images
        if (images && Array.isArray(images)) {
            await db.delete(productImages).where(eq(productImages.productId, id));
            for (let i = 0; i < images.length; i++) {
                await db.insert(productImages).values({
                    productId: id,
                    url: images[i].url,
                    altText: images[i].altText || "Product Image",
                    position: i,
                });
            }
        }

        // Update variants
        if (variants && Array.isArray(variants)) {
            const existingVariants = await db.select().from(productVariants).where(eq(productVariants.productId, id));
            const existingIds = existingVariants.map(v => v.id);
            const payloadIds = variants.map(v => v.id).filter(Boolean);

            const toDelete = existingIds.filter(vId => !payloadIds.includes(vId));
            for (const dId of toDelete) {
                await db.delete(productVariants).where(eq(productVariants.id, dId));
            }

            for (const variant of variants) {
                const vParsed = createVariantSchema.safeParse(variant);
                if (vParsed.success) {
                    if (variant.id) {
                        await db.update(productVariants).set({
                            ...vParsed.data,
                            priceOverride: vParsed.data.priceOverride?.toFixed(2) || null,
                        }).where(eq(productVariants.id, variant.id));
                    } else {
                        await db.insert(productVariants).values({
                            productId: id,
                            ...vParsed.data,
                            priceOverride: vParsed.data.priceOverride?.toFixed(2) || null,
                        });
                    }
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Admin product update error:", error);
        
        if (error.code === '23505' && error.constraint === 'products_slug_key') {
            return NextResponse.json(
                { error: "A product with this name already exists. Please choose a different name." },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to update product" },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/products?id=xxx
export async function DELETE(request: NextRequest) {
    const session = await requireAdmin();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const id = request.nextUrl.searchParams.get("id");
        if (!id) {
            return NextResponse.json(
                { error: "Product ID required" },
                { status: 400 }
            );
        }

        await db.delete(products).where(eq(products.id, id));

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Admin product delete error:", error);

        if (error.code === '23503') {
            return NextResponse.json(
                { error: "Cannot delete this product because it is part of existing customer orders. Please mark it as 'Draft' to hide it from the store instead." },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to delete product" },
            { status: 500 }
        );
    }
}
