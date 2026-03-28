import Link from "next/link";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { Laptop, Smartphone, Monitor, Cable } from "lucide-react";

async function getCategories() {
    try {
        return await db.select().from(categories).limit(6);
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return [];
    }
}

const getIconForCategory = (slug: string) => {
    if (slug.includes("laptop") || slug.includes("macbook")) return Laptop;
    if (slug.includes("phone")) return Smartphone;
    if (slug.includes("cable")) return Cable;
    return Monitor;
};

export default async function CategoryGrid() {
    const allCategories = await getCategories();

    if (allCategories.length === 0) return null;

    return (
        <section className="py-20 bg-mk-gray">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-mk-dark">Shop by Category</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                        Find exactly what you need for your specific device.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {allCategories.map((category) => {
                        const Icon = getIconForCategory(category.slug);
                        return (
                            <Link
                                key={category.id}
                                href={`/category/${category.slug}`}
                                className="group card-hover bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-border/30"
                            >
                                <div className="w-16 h-16 rounded-full bg-mk-gray group-hover:bg-primary/10 flex items-center justify-center mb-4 transition-colors">
                                    <Icon className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                                    {category.name}
                                </h3>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
