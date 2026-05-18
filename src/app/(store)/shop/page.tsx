import { Metadata } from "next";
export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { products, productImages, categories, productVariants } from "@/lib/db/schema";
import { eq, desc, asc, and, or, ilike, inArray, gte, lte, SQL } from "drizzle-orm";
import ProductCard from "@/components/products/ProductCard";
import SearchBar from "@/components/products/SearchBar";
import FilterSidebar from "@/components/products/FilterSidebar";
import SortDropdown from "@/components/products/SortDropdown";

export const metadata: Metadata = {
    title: "Shop All Accessories | MkStore",
    description: "Browse our complete collection of premium tech accessories.",
};

async function getShopProducts(params: {
    search: string | null;
    category: string[] | null;
    minPrice: number | null;
    maxPrice: number | null;
    sort: string | null;
}) {
    try {
        const conditions: SQL[] = [eq(products.active, true)];

        if (params.search) {
            conditions.push(
                or(
                    ilike(products.name, `%${params.search}%`),
                    ilike(products.description, `%${params.search}%`)
                )!
            );
        }

        if (params.category && params.category.length > 0) {
            // Find category IDs for the given slugs
            const catIds = await db
                .select({ id: categories.id })
                .from(categories)
                .where(inArray(categories.slug, params.category));

            if (catIds.length > 0) {
                conditions.push(inArray(products.categoryId, catIds.map(c => c.id)));
            }
        }

        if (params.minPrice !== null) {
            conditions.push(gte(products.price, params.minPrice.toString()));
        }

        if (params.maxPrice !== null) {
            conditions.push(lte(products.price, params.maxPrice.toString()));
        }

        let orderByClause = desc(products.createdAt);
        if (params.sort === "price_asc") orderByClause = asc(products.price);
        if (params.sort === "price_desc") orderByClause = desc(products.price);
        if (params.sort === "featured") orderByClause = desc(products.featured);

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
            .orderBy(orderByClause);

        if (results.length === 0) return [];

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

async function getAllCategories() {
    try {
        return await db.select().from(categories);
    } catch (error) {
        return [];
    }
}

export default async function ShopPage({
    searchParams,
}: {
    searchParams: Promise<{
        search?: string;
        category?: string | string[];
        price?: string;
        sort?: string;
    }>;
}) {
    const resolvedSearchParams = await searchParams;
    const search = resolvedSearchParams.search || null;

    // Normalize category to array
    const categoryParam = resolvedSearchParams.category;
    const categoriesFilter = categoryParam
        ? (Array.isArray(categoryParam) ? categoryParam : [categoryParam])
        : null;

    // Parse price range from "0-2000" format
    let minPrice: number | null = null;
    let maxPrice: number | null = null;
    if (resolvedSearchParams.price) {
        const parts = resolvedSearchParams.price.split("-");
        if (parts.length === 2) {
            minPrice = parts[0] === "" ? null : Number(parts[0]);
            maxPrice = parts[1] === "" ? null : Number(parts[1]);
        }
    }

    const sort = resolvedSearchParams.sort || "latest";

    const [shopProducts, allCategoriesList] = await Promise.all([
        getShopProducts({
            search,
            category: categoriesFilter,
            minPrice,
            maxPrice,
            sort
        }),
        getAllCategories()
    ]);

    return (
        <div className="bg-white dark:bg-background min-h-screen pb-20">
            {/* Page Header */}
            <div className="border-b border-border bg-white dark:bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12 animate-fade-in">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-2">
                        {search ? "Search results" : "Accessories"}
                    </p>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">
                        {search ? `"${search}"` : "Shop All"}
                    </h1>
                    {!search && (
                        <p className="text-muted-foreground text-sm max-w-xl leading-relaxed mb-6">
                            Our full collection of premium tech accessories, delivered across Kenya.
                        </p>
                    )}
                    <div className="max-w-md">
                        <SearchBar />
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-56 flex-shrink-0">
                        <FilterSidebar
                            categories={allCategoriesList}
                            activeCategories={categoriesFilter || []}
                            activePrice={resolvedSearchParams.price || null}
                        />
                    </aside>

                    {/* Product Grid Area */}
                    <div className="flex-1 min-w-0">
                        {/* Top Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-border animate-fade-in relative z-30" style={{ animationDelay: "0.1s" }}>

                            <div className="text-sm text-muted-foreground">
                                Showing <span className="font-semibold text-foreground">{shopProducts.length}</span> results
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
                                <SortDropdown currentSort={sort} />
                            </div>
                        </div>

                        {/* Active Filter Tags (Optional, can be added later if requested) */}

                        {shopProducts.length === 0 ? (
                            <div className="text-center py-24 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                                <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mx-auto mb-5">
                                    <span className="text-2xl">🔍</span>
                                </div>
                                <h2 className="text-xl font-bold mb-2">No products found</h2>
                                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                    Try adjusting your filters or search terms.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                                {shopProducts.map((product, index) => (
                                    <ProductCard
                                        key={product.id}
                                        {...product}
                                        priority={index < 6}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
