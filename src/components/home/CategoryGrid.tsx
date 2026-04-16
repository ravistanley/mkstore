import Link from "next/link";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { Laptop, Smartphone, Monitor, Cable, Speaker, Battery, Keyboard, Zap, Headphones } from "lucide-react";
import { eq } from "drizzle-orm";

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

const getCategoryStyle = (slug: string) => {
    if (slug.includes("laptop") || slug.includes("macbook")) return { icon: Laptop, color: "text-blue-500", bg: "bg-blue-500/10", hoverBg: "group-hover:bg-blue-500" };
    if (slug.includes("phone-case")) return { icon: Smartphone, color: "text-emerald-500", bg: "bg-emerald-500/10", hoverBg: "group-hover:bg-emerald-500" };
    if (slug.includes("screen")) return { icon: Monitor, color: "text-amber-500", bg: "bg-amber-500/10", hoverBg: "group-hover:bg-amber-500" };
    if (slug.includes("cable") || slug.includes("charger")) return { icon: Cable, color: "text-rose-500", bg: "bg-rose-500/10", hoverBg: "group-hover:bg-rose-500" };
    if (slug.includes("charm")) return { icon: Zap, color: "text-purple-500", bg: "bg-purple-500/10", hoverBg: "group-hover:bg-purple-500" };
    if (slug.includes("audio") || slug.includes("pod")) return { icon: Headphones, color: "text-cyan-500", bg: "bg-cyan-500/10", hoverBg: "group-hover:bg-cyan-500" };
    if (slug.includes("desk") || slug.includes("stand")) return { icon: Keyboard, color: "text-indigo-500", bg: "bg-indigo-500/10", hoverBg: "group-hover:bg-indigo-500" };
    
    return { icon: Monitor, color: "text-primary", bg: "bg-primary/10", hoverBg: "group-hover:bg-primary" };
};

export default async function CategoryGrid() {
    const allCategories = await getCategoriesWithCounts();

    if (allCategories.length === 0) return null;

    return (
        <section className="py-24 bg-mk-gray/50 dark:bg-background border-y border-border/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-mk-dark dark:text-foreground">Shop by Category</h2>
                        <p className="text-muted-foreground mt-2 max-w-2xl">
                            Find exactly what you need for your specific device.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                    {allCategories.map((category, index) => {
                        const style = getCategoryStyle(category.slug);
                        const Icon = style.icon;
                        
                        return (
                            <Link
                                key={category.id}
                                href={`/category/${category.slug}`}
                                className="group card-hover bg-white dark:bg-card rounded-3xl p-6 flex flex-col items-center justify-center text-center border border-border/50 shadow-sm relative overflow-hidden animate-slide-in-right"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 ${style.bg} ${style.hoverBg}`}>
                                    <Icon className={`w-8 h-8 transition-colors duration-300 group-hover:text-white ${style.color}`} />
                                </div>
                                <h3 className="font-bold text-sm text-mk-dark dark:text-foreground group-hover:text-primary transition-colors tracking-tight">
                                    {category.name}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                                    {category.count} {category.count === 1 ? 'Product' : 'Products'}
                                </p>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
