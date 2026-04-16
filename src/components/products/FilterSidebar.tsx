"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, SlidersHorizontal, X } from "lucide-react";
import { useCallback } from "react";

type Category = {
    id: string;
    name: string;
    slug: string;
};

interface FilterSidebarProps {
    categories: Category[];
    activeCategories: string[];
    activePrice: string | null;
}

const PRICE_RANGES = [
    { label: "Under KSh 2,000", value: "0-2000" },
    { label: "KSh 2,000 - KSh 5,000", value: "2000-5000" },
    { label: "KSh 5,000 - KSh 10,000", value: "5000-10000" },
    { label: "Over KSh 10,000", value: "10000-" },
];

export default function FilterSidebar({ categories, activeCategories, activePrice }: FilterSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createQueryString = useCallback(
        (params: Record<string, string | string[] | null>) => {
            const newSearchParams = new URLSearchParams(searchParams.toString());

            Object.entries(params).forEach(([name, value]) => {
                if (value === null) {
                    newSearchParams.delete(name);
                } else if (Array.isArray(value)) {
                    newSearchParams.delete(name);
                    value.forEach(v => newSearchParams.append(name, v));
                } else {
                    newSearchParams.set(name, value);
                }
            });

            return newSearchParams.toString();
        },
        [searchParams]
    );

    const toggleCategory = (slug: string) => {
        const newCategories = activeCategories.includes(slug)
            ? activeCategories.filter(c => c !== slug)
            : [...activeCategories, slug];
        
        const query = createQueryString({ category: newCategories.length > 0 ? newCategories : null });
        router.push(`${pathname}?${query}`, { scroll: false });
    };

    const setPriceRange = (value: string) => {
        const newValue = activePrice === value ? null : value;
        const query = createQueryString({ price: newValue });
        router.push(`${pathname}?${query}`, { scroll: false });
    };

    const resetFilters = () => {
        router.push(pathname);
    };

    const hasFilters = activeCategories.length > 0 || activePrice !== null;

    return (
        <div className="sticky top-24 bg-white dark:bg-card p-6 rounded-3xl border border-border/50 shadow-sm transition-colors animate-slide-in-right">
            <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-4">
                <div className="flex items-center gap-2 font-bold text-lg">
                    <SlidersHorizontal className="w-5 h-5 text-primary" />
                    Filters
                </div>
                {hasFilters && (
                    <button 
                        onClick={resetFilters}
                        className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                        <X className="w-3 h-3" />
                        Clear
                    </button>
                )}
            </div>
            
            {/* Categories Filter */}
            <div className="mb-8">
                <h3 className="font-semibold text-mk-dark dark:text-foreground mb-4 text-sm uppercase tracking-wider">Categories</h3>
                <ul className="space-y-3">
                    {categories.map(cat => (
                        <li key={cat.id}>
                            <button 
                                onClick={() => toggleCategory(cat.slug)}
                                className="flex items-center gap-3 w-full text-left group cursor-pointer"
                            >
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                    activeCategories.includes(cat.slug)
                                        ? "bg-primary border-primary shadow-sm"
                                        : "border-border/80 bg-mk-gray dark:bg-muted group-hover:border-primary"
                                }`}>
                                    <Check className={`w-3.5 h-3.5 transition-opacity ${
                                        activeCategories.includes(cat.slug) ? "opacity-100 text-white" : "opacity-0"
                                    }`} />
                                </div>
                                <span className={`text-sm transition-colors ${
                                    activeCategories.includes(cat.slug) 
                                        ? "font-semibold text-foreground" 
                                        : "text-muted-foreground group-hover:text-foreground"
                                }`}>
                                    {cat.name}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Price Filter */}
            <div>
                <h3 className="font-semibold text-mk-dark dark:text-foreground mb-4 text-sm uppercase tracking-wider">Price Range</h3>
                <ul className="space-y-3">
                    {PRICE_RANGES.map((range, i) => (
                        <li key={i}>
                            <button 
                                onClick={() => setPriceRange(range.value)}
                                className="flex items-center gap-3 w-full text-left group cursor-pointer"
                            >
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                    activePrice === range.value
                                        ? "bg-primary border-primary shadow-sm"
                                        : "border-border/80 bg-mk-gray dark:bg-muted group-hover:border-primary"
                                }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full bg-white transition-opacity ${
                                        activePrice === range.value ? "opacity-100" : "opacity-0"
                                    }`} />
                                </div>
                                <span className={`text-sm transition-colors ${
                                    activePrice === range.value 
                                        ? "font-semibold text-foreground" 
                                        : "text-muted-foreground group-hover:text-foreground"
                                }`}>
                                    {range.label}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            
            <button 
                onClick={resetFilters}
                className={`w-full mt-10 py-3 font-semibold rounded-xl text-sm transition-all border ${
                    hasFilters 
                        ? "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10" 
                        : "bg-muted text-muted-foreground border-transparent cursor-not-allowed hidden"
                }`}
            >
                Reset All Filters
            </button>
        </div>
    );
}
