import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import { db } from "@/lib/db";
import { products, categories, productImages, productVariants } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

async function getFeaturedProducts() {
    try {
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
            .where(eq(products.featured, true))
            .orderBy(desc(products.createdAt))
            .limit(4);

        if (results.length === 0) return [];

        const productIds = results.map((p) => p.id);

        const allImages = await db
            .select({ productId: productImages.productId, url: productImages.url })
            .from(productImages)
            .where(eq(productImages.position, 0));

        const allVariants = await db
            .select({ id: productVariants.id, productId: productVariants.productId, name: productVariants.name })
            .from(productVariants);

        return results.map((p) => ({
            ...p,
            price: Number(p.price),
            compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
            imageUrl: allImages.find((img) => img.productId === p.id)?.url || "/placeholder.svg",
            variants: allVariants.filter((v) => v.productId === p.id),
        }));
    } catch (error) {
        console.error("Failed to fetch featured products:", error);
        return [];
    }
}

export default async function FeaturedProducts() {
    const featuredProducts = await getFeaturedProducts();

    if (featuredProducts.length === 0) return null;

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-mk-dark">Featured Products</h2>
                        <p className="text-muted-foreground mt-2">Our most popular premium accessories.</p>
                    </div>
                    <Link
                        href="/shop"
                        className="group flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                        Shop All Collections
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredProducts.map((product) => (
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
            </div>
        </section>
    );
}
