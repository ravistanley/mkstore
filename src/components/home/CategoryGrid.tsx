import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ArrowRight } from "lucide-react";

async function getCategoriesWithCounts() {
    try {
        const allCats = await db.select().from(categories).limit(6);
        const allProds = await db.select({ categoryId: products.categoryId }).from(products).where(eq(products.active, true));
        
        return allCats.map(cat => ({
            ...cat,
            count: allProds.filter(p => p.categoryId === cat.id).length
        }));
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return [];
    }
}

export default async function CategoryGrid() {
    const allCategories = await getCategoriesWithCounts();

    if (allCategories.length === 0) return null;

    const [featured1, featured2, ...rest] = allCategories;

    return (
        <section className="py-20 bg-white dark:bg-background border-y border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <div className="mb-10">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-2">Collections</p>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Shop by category</h2>
                </div>

                {/* Grid layout: 2 featured + 4 smaller */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Featured card 1 — spans 2 rows on lg */}
                    {featured1 && (
                        <Link
                            href={`/category/${featured1.slug}`}
                            className="group relative col-span-1 lg:col-span-1 lg:row-span-2 flex flex-col justify-end bg-mk-gray dark:bg-muted rounded-2xl overflow-hidden min-h-[200px] lg:min-h-[320px] border border-border hover:border-primary/30 transition-colors"
                        >
                            {featured1.imageUrl ? (
                                <>
                                    <Image src={featured1.imageUrl} alt={featured1.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                </>
                            ) : (
                                <div className="absolute inset-x-0 top-0 h-1 bg-primary rounded-t-2xl" />
                            )}
                            <div className="relative p-5 pt-8 z-10">
                                <h3 className={`font-bold text-base group-hover:text-primary transition-colors leading-tight ${featured1.imageUrl ? 'text-white' : 'text-foreground'}`}>
                                    {featured1.name}
                                </h3>
                                <p className={`text-sm mt-1 ${featured1.imageUrl ? 'text-white/70' : 'text-muted-foreground'}`}>{featured1.count} items</p>
                                <div className="mt-3 flex items-center gap-1 text-primary text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                    Browse <ArrowRight className="w-3 h-3" />
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* Featured card 2 — spans 2 rows on lg */}
                    {featured2 && (
                        <Link
                            href={`/category/${featured2.slug}`}
                            className="group relative col-span-1 lg:col-span-1 lg:row-span-2 flex flex-col justify-end bg-mk-gray dark:bg-muted rounded-2xl overflow-hidden min-h-[200px] lg:min-h-[320px] border border-border hover:border-primary/30 transition-colors"
                        >
                            {featured2.imageUrl ? (
                                <>
                                    <Image src={featured2.imageUrl} alt={featured2.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                </>
                            ) : (
                                <div className="absolute inset-x-0 top-0 h-1 bg-primary rounded-t-2xl" />
                            )}
                            <div className="relative p-5 pt-8 z-10">
                                <h3 className={`font-bold text-base group-hover:text-primary transition-colors leading-tight ${featured2.imageUrl ? 'text-white' : 'text-foreground'}`}>
                                    {featured2.name}
                                </h3>
                                <p className={`text-sm mt-1 ${featured2.imageUrl ? 'text-white/70' : 'text-muted-foreground'}`}>{featured2.count} items</p>
                                <div className="mt-3 flex items-center gap-1 text-primary text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                    Browse <ArrowRight className="w-3 h-3" />
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* Smaller category cards */}
                    {rest.map((category) => (
                        <Link
                            key={category.id}
                            href={`/category/${category.slug}`}
                            className="group relative flex flex-col justify-end bg-mk-gray dark:bg-muted rounded-2xl overflow-hidden min-h-[140px] border border-border hover:border-primary/30 transition-colors"
                        >
                            {category.imageUrl ? (
                                <>
                                    <Image src={category.imageUrl} alt={category.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                </>
                            ) : (
                                <div className="absolute inset-x-0 top-0 h-0.5 bg-border group-hover:bg-primary rounded-t-2xl transition-colors" />
                            )}
                            <div className="relative p-4 pt-6 z-10">
                                <h3 className={`font-semibold text-sm group-hover:text-primary transition-colors leading-tight ${category.imageUrl ? 'text-white' : 'text-foreground'}`}>
                                    {category.name}
                                </h3>
                                <p className={`text-xs mt-0.5 ${category.imageUrl ? 'text-white/70' : 'text-muted-foreground'}`}>{category.count} items</p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* View all link */}
                <div className="mt-8 text-center">
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group"
                    >
                        View all products
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
