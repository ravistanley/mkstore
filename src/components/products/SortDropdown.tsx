"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

const SORT_OPTIONS = [
    { label: "Latest Arrivals", value: "latest" },
    { label: "Featured", value: "featured" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
];

export default function SortDropdown({ currentSort }: { currentSort: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedOption = SORT_OPTIONS.find(opt => opt.value === currentSort) || SORT_OPTIONS[0];

    const createQueryString = useCallback(
        (value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("sort", value);
            return params.toString();
        },
        [searchParams]
    );

    const handleSort = (value: string) => {
        const query = createQueryString(value);
        router.push(`${pathname}?${query}`, { scroll: false });
        setIsOpen(false);
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-border/80 rounded-xl text-sm font-medium hover:bg-muted transition-all bg-background min-w-[160px] justify-between shadow-sm active:scale-95"
            >
                {selectedOption.label}
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`absolute top-full right-0 mt-2 w-52 bg-white dark:bg-card border border-border/50 rounded-2xl shadow-xl transition-all duration-300 z-[100] overflow-hidden transform origin-top-right ${
                isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
            }`}>
                <div className="flex flex-col py-2">
                    {SORT_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleSort(option.value)}
                            className={`flex items-center justify-between w-full px-4 py-3 text-sm transition-colors text-left ${
                                currentSort === option.value 
                                    ? 'bg-primary/5 text-primary font-bold' 
                                    : 'hover:bg-muted text-foreground/70 hover:text-foreground'
                            }`}
                        >
                            <span className="truncate">{option.label}</span>
                            {currentSort === option.value && <Check className="w-4 h-4 flex-shrink-0" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
