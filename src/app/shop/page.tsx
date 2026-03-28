import { Metadata } from "next";
export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { products, productImages, categories, productVariants } from "@/lib/db/schema";
import { eq, desc, and, or, ilike } from "drizzle-orm";
import ProductCard from "@/components/products/ProductCard";
import SearchBar from "@/components/products/SearchBar";

export const metadata: Metadata = {
    title: "Shop All Accessories | MkStore",
    description: "Browse our complete collection of premium tech accessories.",
};

async function getShopProducts(searchParam: string | null) {
    try {
        const conditions = [eq(products.active, true)];

        if (searchParam) {
            conditions.push(
                or(
                    ilike(products.name, `%${searchParam}%`),
                    ilike(products.description, `%${searchParam}%`)
                )!
            );
        }

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
            .where(and(...conditions))
            .orderBy(desc(products.createdAt));

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
        console.error("Failed to fetch shop products:", error);
        return [];
    }
}

export default async function ShopPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string }>;
}) {
    const resolvedSearchParams = await searchParams;
    const search = resolvedSearchParams.search || null;
    const shopProducts = await getShopProducts(search);

    return (
        <div className="bg-mk-gray min-h-screen pb-20">
            {/* Header */}
            <div className="bg-white border-b border-border/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-4xl font-bold tracking-tight text-mk-dark mb-4">
                        {search ? `Search Results for "${search}"` : "Shop All"}
                    </h1>
                    <p className="text-muted-foreground mb-8 max-w-2xl">
                        {search
                            ? `Showing exactly what matches your search.`
                            : `Explore our entire collection of premium tech accessories designed to elevate your everyday carry.`}
                    </p>

                    <div className="max-w-md">
                        <SearchBar />
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {shopProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-border/50">
                        <h2 className="text-2xl font-semibold mb-2">No products found</h2>
                        <p className="text-muted-foreground">
                            {search ? "Try adjusting your search terms." : "We're restocking soon!"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {shopProducts.map((product) => (
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
