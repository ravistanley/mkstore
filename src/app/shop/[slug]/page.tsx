import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { products, productImages, categories, productVariants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import VariantSelector from "@/components/products/VariantSelector";
import { ShieldCheck, Truck, RotateCcw } from "lucide-react";

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

    return (
        <div className="bg-mk-gray min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-[2rem] p-6 lg:p-12 shadow-sm border border-border/50">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">

                        {/* Image Gallery */}
                        <div className="space-y-4">
                            <div className="aspect-square bg-mk-gray rounded-2xl overflow-hidden relative border border-border/30">
                                <div className="absolute inset-0 flex items-center justify-center product-image-zoom">
                                    <span className="text-4xl text-muted-foreground/30 font-bold">IMAGE</span>
                                    {/* <Image 
                    src={product.images[0].url} 
                    alt={product.images[0].altText || product.name}
                    fill
                    className="object-cover object-center"
                    priority
                  /> */}
                                </div>
                            </div>

                            {product.images.length > 1 && (
                                <div className="grid grid-cols-4 gap-4">
                                    {product.images.slice(1, 5).map((img, i) => (
                                        <div key={i} className="aspect-square bg-mk-gray rounded-xl overflow-hidden relative cursor-pointer hover:border-primary border-2 border-transparent transition-colors">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-xs text-muted-foreground/50">Img {i + 2}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="flex flex-col">
                            {product.categoryName && (
                                <div className="text-sm text-primary font-semibold tracking-wider uppercase mb-3">
                                    {product.categoryName}
                                </div>
                            )}

                            <h1 className="text-3xl md:text-4xl font-bold text-mk-dark mb-4 tracking-tight">
                                {product.name}
                            </h1>

                            {/* Description */}
                            {product.description && (
                                <div className="text-muted-foreground leading-relaxed mb-8">
                                    {product.description}
                                </div>
                            )}

                            <hr className="border-border mb-8" />

                            {/* Variant Selector & Cart Action */}
                            <div className="mb-8">
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
                            <div className="mt-auto pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="flex flex-col items-center text-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Truck className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground">Nationwide Delivery</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground">Original Products</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <RotateCcw className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground">Easy Returns</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
