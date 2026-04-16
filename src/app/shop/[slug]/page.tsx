import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { products, productImages, categories, productVariants } from "@/lib/db/schema";
import { eq, ne, and } from "drizzle-orm";
import VariantSelector from "@/components/products/VariantSelector";
import ProductGallery from "@/components/products/ProductGallery";
import ProductCard from "@/components/products/ProductCard";
import { ShieldCheck, Truck, RotateCcw, ChevronRight, Share2 } from "lucide-react";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const resolvedParams = await params;
    const [product] = await db
        .select({ name: products.name, description: products.description })
        .from(products)
        .where(eq(products.slug, resolvedParams.slug))
        .limit(1);

    if (!product) {
        return { title: "Product Not Found" };
    }

    return {
        title: `${product.name} | MkStore`,
        description: product.description || `Buy ${product.name} at MkStore`,
    };
}

async function getProduct(slug: string) {
    try {
        const [product] = await db
            .select({
                id: products.id,
                name: products.name,
                slug: products.slug,
                description: products.description,
                price: products.price,
                compareAtPrice: products.compareAtPrice,
                categoryId: products.categoryId,
                categoryName: categories.name,
                categorySlug: categories.slug,
            })
            .from(products)
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .where(eq(products.slug, slug))
            .limit(1);

        if (!product) return null;

        const images = await db
            .select()
            .from(productImages)
            .where(eq(productImages.productId, product.id))
            .orderBy(productImages.position);

        const variants = await db
            .select()
            .from(productVariants)
            .where(eq(productVariants.productId, product.id));

        return {
            ...product,
            price: Number(product.price),
            compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
            images: images.length > 0 ? images : [{ id: "1", url: "/placeholder.svg", altText: product.name, position: 0 }],
            variants,
        };
    } catch (error) {
        console.error("Failed to fetch product:", error);
        return null;
    }
}

async function getRelatedProducts(categoryId: string | null, currentProductId: string) {
    if (!categoryId) return [];
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
            .where(and(eq(products.categoryId, categoryId), ne(products.id, currentProductId)))
            .limit(4);

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
        console.error("Failed to fetch related products:", error);
        return [];
    }
}

export default async function ProductPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const resolvedParams = await params;
    const product = await getProduct(resolvedParams.slug);

    if (!product) {
        notFound();
    }

    const relatedProducts = await getRelatedProducts(product.categoryId, product.id);

    return (
        <div className="bg-mk-gray dark:bg-background min-h-screen pb-20">
            {/* Breadcrumbs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
                <nav className="flex items-center space-x-2 text-sm text-muted-foreground animate-fade-in">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                    <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
                    {product.categoryName && (
                        <>
                            <ChevronRight className="w-4 h-4 shrink-0" />
                            <Link href={`/category/${product.categorySlug}`} className="hover:text-primary transition-colors truncate max-w-[120px] sm:max-w-none">
                                {product.categoryName}
                            </Link>
                        </>
                    )}
                    <ChevronRight className="w-4 h-4 shrink-0" />
                    <span className="text-foreground font-medium truncate max-w-[150px] sm:max-w-none">{product.name}</span>
                </nav>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="bg-white dark:bg-card rounded-[2rem] p-6 lg:p-12 shadow-sm border border-border/50 animate-fade-in">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
                        {/* Image Gallery */}
                        <div className="w-full">
                            <ProductGallery images={product.images as any} productName={product.name} />
                        </div>

                        {/* Product Info */}
                        <div className="flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                                {product.categoryName && (
                                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary uppercase tracking-wider">
                                        {product.categoryName}
                                    </div>
                                )}
                                <button className="w-10 h-10 rounded-full bg-mk-gray hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                                    <Share2 className="w-4 h-4" />
                                </button>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-extrabold text-mk-dark dark:text-foreground mb-4 tracking-tight leading-tight">
                                {product.name}
                            </h1>

                            {/* Description */}
                            {product.description && (
                                <div className="text-muted-foreground leading-relaxed mb-8 text-[15px]">
                                    {product.description}
                                </div>
                            )}

                            <hr className="border-border mb-8" />

                            {/* Variant Selector & Cart Action */}
                            <div className="mb-8 bg-mk-gray/50 dark:bg-muted/30 p-6 rounded-2xl border border-border/40">
                                <VariantSelector
                                    productId={product.id}
                                    price={product.price}
                                    variants={product.variants.map((v) => ({
                                        ...v,
                                        priceOverride: v.priceOverride ? String(v.priceOverride) : null,
                                    }))}
                                />
                            </div>

                            {/* Trust Features */}
                            <div className="mt-auto pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="flex flex-col items-center text-center p-4 rounded-xl bg-mk-gray/30 dark:bg-muted/20 border border-border/30">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2">
                                        <Truck className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-semibold text-foreground">Nationwide Delivery</span>
                                </div>
                                <div className="flex flex-col items-center text-center p-4 rounded-xl bg-mk-gray/30 dark:bg-muted/20 border border-border/30">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-2">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-semibold text-foreground">Original Products</span>
                                </div>
                                <div className="flex flex-col items-center text-center p-4 rounded-xl bg-mk-gray/30 dark:bg-muted/20 border border-border/30">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 mb-2">
                                        <RotateCcw className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-semibold text-foreground">Easy Returns</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16 sm:mt-24 animate-slide-in-right">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-mk-dark dark:text-foreground">You May Also Like</h2>
                            <Link href={`/category/${product.categorySlug}`} className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                                View category <ChevronRight className="w-4 h-4 inline" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((p) => (
                                <ProductCard key={p.id} {...p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
