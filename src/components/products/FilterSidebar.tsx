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
        <div className="sticky top-20">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
                <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                    <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
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
            <div className="mb-7">
                <h3 className="font-semibold text-foreground mb-3 text-xs uppercase tracking-widest">Categories</h3>
                <ul className="space-y-2.5">
                    {categories.map(cat => (
                        <li key={cat.id}>
                            <button 
                                onClick={() => toggleCategory(cat.slug)}
                                className="flex items-center gap-3 w-full text-left group cursor-pointer py-0.5"
                            >
                                <div className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${
                                    activeCategories.includes(cat.slug)
                                        ? "bg-primary border-primary"
                                        : "border-[#9CA3AF] bg-white group-hover:border-primary"
                                }`}>
                                    <Check className={`w-3 h-3 transition-opacity ${
                                        activeCategories.includes(cat.slug) ? "opacity-100 text-white" : "opacity-0"
                                    }`} />
                                </div>
                                <span className={`text-sm transition-colors ${
                                    activeCategories.includes(cat.slug) 
                                        ? "font-semibold text-foreground" 
                                        : "text-[#374151] group-hover:text-foreground"
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
                <h3 className="font-semibold text-foreground mb-3 text-xs uppercase tracking-widest">Price Range</h3>
                <ul className="space-y-2.5">
                    {PRICE_RANGES.map((range, i) => (
                        <li key={i}>
                            <button 
                                onClick={() => setPriceRange(range.value)}
                                className="flex items-center gap-3 w-full text-left group cursor-pointer py-0.5"
                            >
                                <div className={`w-5 h-5 rounded-full flex-shrink-0 border-2 flex items-center justify-center transition-all ${
                                    activePrice === range.value
                                        ? "bg-primary border-primary"
                                        : "border-[#9CA3AF] bg-white group-hover:border-primary"
                                }`}>
                                    <div className={`w-2 h-2 rounded-full bg-white transition-opacity ${
                                        activePrice === range.value ? "opacity-100" : "opacity-0"
                                    }`} />
                                </div>
                                <span className={`text-sm transition-colors ${
                                    activePrice === range.value 
                                        ? "font-semibold text-foreground" 
                                        : "text-[#374151] group-hover:text-foreground"
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
                className={`w-full mt-8 py-2.5 font-semibold rounded-lg text-xs uppercase tracking-wider transition-all border ${
                    hasFilters 
                        ? "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10" 
                        : "hidden"
                }`}
            >
                Reset All Filters
            </button>
        </div>
    );
}
