"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Search, Loader2, Image as ImageIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Product = {
    id: string;
    name: string;
    price: string;
    active: boolean;
    featured: boolean;
    categoryName: string | null;
    imageUrl: string | null;
};

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            // Re-using the public products API for the list view since it returns what we need
            // In a real app, an admin-specific endpoint might be better to return inactive products too
            const res = await fetch("/api/admin/products");
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This will delete all variants and images too.`)) return;

        try {
            const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete product");
            await fetchProducts();
        } catch (error) {
            console.error(error);
            alert("Failed to delete product");
        }
    };

    const toggleFeatured = async (product: Product) => {
        try {
            const res = await fetch(`/api/admin/products?id=${product.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ featured: !product.featured }),
            });
            if (!res.ok) throw new Error("Failed to update status");
            await fetchProducts();
        } catch (error) {
            console.error(error);
        }
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    const formatPrice = (p: string) => `KSh ${Number(p).toLocaleString('en-KE')}`;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-mk-dark">Products</h1>
                    <p className="text-muted-foreground mt-1">Manage your store's inventory and catalog.</p>
                </div>
                <Link href="/mk-admin-portal/products/new" className={buttonVariants({ className: "h-11 rounded-xl gap-2" })}>
                    <Plus className="w-4 h-4" />
                    Add Product
                </Link>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/50">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-10 bg-muted/50 border-0"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-border/50 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 flex justify-center text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                        No products found matching your criteria.
                    </div>
                ) : (
                    <div className="divide-y divide-border/50">
                        <div className="grid grid-cols-12 gap-4 p-4 text-sm font-semibold text-muted-foreground bg-muted/30">
                            <div className="col-span-1 border-r border-border/50">Image</div>
                            <div className="col-span-4">Product Name</div>
                            <div className="col-span-2">Category</div>
                            <div className="col-span-2">Base Price</div>
                            <div className="col-span-1 text-center">Status</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>

                        {filteredProducts.map((product) => (
                            <div key={product.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/10 transition-colors">

                                <div className="col-span-1 flex justify-center">
                                    <div className="w-10 h-10 bg-muted rounded-lg border border-border/50 flex items-center justify-center overflow-hidden relative">
                                        {product.imageUrl ? (
                                            <span className="text-[10px] absolute text-muted-foreground w-full text-center">IMG</span>
                                        ) : (
                                            <ImageIcon className="w-4 h-4 text-muted-foreground/50" />
                                        )}
                                    </div>
                                </div>

                                <div className="col-span-4 font-semibold text-sm line-clamp-2 pr-4">{product.name}</div>
                                <div className="col-span-2 text-sm text-muted-foreground">{product.categoryName || "-"}</div>
                                <div className="col-span-2 font-medium text-sm">{formatPrice(product.price)}</div>

                                <div className="col-span-1 flex flex-col gap-1 items-center">
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${product.active ? "bg-[#4ade80]/10 text-[#4ade80]" : "bg-muted text-muted-foreground"
                                        }`}>
                                        {product.active ? "Active" : "Draft"}
                                    </span>
                                    <button
                                        onClick={() => toggleFeatured(product)}
                                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md transition-colors ${product.featured ? "bg-amber-100 text-amber-600 hover:bg-amber-200" : "bg-muted text-muted-foreground hover:bg-border"
                                            }`}
                                    >
                                        {product.featured ? "★ Featured" : "★ Feature"}
                                    </button>
                                </div>

                                <div className="col-span-2 flex justify-end gap-2">
                                    <Link href={`/mk-admin-portal/products/${product.id}`} className={buttonVariants({ variant: "ghost", size: "icon" })}>
                                        <Edit className="w-4 h-4" />
                                    </Link>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(product.id, product.name)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
