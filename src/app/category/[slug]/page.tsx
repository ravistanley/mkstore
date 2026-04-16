import { Metadata } from "next";
export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { products, productImages, categories, productVariants } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import ProductCard from "@/components/products/ProductCard";
import { notFound } from "next/navigation";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const resolvedParams = await params;
    const [category] = await db
        .select({ name: categories.name, description: categories.description })
        .from(categories)
        .where(eq(categories.slug, resolvedParams.slug))
        .limit(1);

    if (!category) {
        return { title: "Category Not Found" };
    }

    return {
        title: `${category.name} | MkStore`,
        description: category.description || `Shop ${category.name} at MkStore`,
    };
}

async function getCategoryProducts(slug: string) {
    try {
        const [category] = await db
            .select()
            .from(categories)
            .where(eq(categories.slug, slug))
            .limit(1);

        if (!category) return { category: null, products: [] };

        const results = await db
            .select({
                id: products.id,
                name: products.name,
                slug: products.slug,
                price: products.price,
                compareAtPrice: products.compareAtPrice,
                categoryName: categories.name,
            })
            .from(products)
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .where(and(eq(products.categoryId, category.id), eq(products.active, true)))
            .orderBy(desc(products.createdAt));

        if (results.length === 0) return { category, products: [] };

        const productIds = results.map((p) => p.id);

        const allImages = await db
            .select({ productId: productImages.productId, url: productImages.url })
            .from(productImages)
            .where(eq(productImages.position, 0));

        const allVariants = await db
            .select({ id: productVariants.id, productId: productVariants.productId, name: productVariants.name })
            .from(productVariants);

        const enrichedProducts = results.map((p) => ({
            ...p,
            price: Number(p.price),
            compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
            imageUrl: allImages.find((img) => img.productId === p.id)?.url || "/placeholder.svg",
            variants: allVariants.filter((v) => v.productId === p.id),
        }));

        return { category, products: enrichedProducts };
    } catch (error) {
        console.error("Failed to fetch category products:", error);
        return { category: null, products: [] };
    }
}

export default async function CategoryPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const resolvedParams = await params;
    const { category, products: catProducts } = await getCategoryProducts(resolvedParams.slug);

    if (!category) {
        notFound();
    }

    return (
        <div className="bg-mk-gray dark:bg-background min-h-screen pb-20 transition-colors">
            {/* Header */}
            <div className="bg-white dark:bg-card border-b border-border/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-mk-dark dark:text-foreground mb-4">
                        {category.name}
                    </h1>
                    {category.description && (
                        <p className="text-muted-foreground max-w-2xl text-lg md:text-xl leading-relaxed">
                            {category.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Product Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {catProducts.length === 0 ? (
                    <div className="text-center py-24 bg-white dark:bg-card rounded-3xl border border-border/50 shadow-sm animate-fade-in">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                           <span className="text-3xl text-muted-foreground/30">📦</span>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">No products yet</h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            We're currently adding products to {category.name}. Check back later!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
                        {catProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                slug={product.slug}
                                price={product.price}
                                compareAtPrice={product.compareAtPrice}
                                categoryName={product.categoryName}
                                imageUrl={product.imageUrl}
                                variants={product.variants}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
