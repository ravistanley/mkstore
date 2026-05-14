"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Trash2, Search, Loader2, Image as ImageIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

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
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/admin/products");
            if (res.status === 401) {
                router.replace("/mk-admin-portal/login");
                return;
            }
            if (res.ok) {
                const data = await res.json();
                setProducts(data.products || []);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setIsLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;
        setIsDeleting(true);
        setDeleteError(null);
        try {
            const res = await fetch(`/api/admin/products?id=${productToDelete.id}`, { method: "DELETE" });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to delete product");
            }
            toast.success("Product deleted successfully");
            await fetchProducts();
            setProductToDelete(null);
        } catch (error) {
            setDeleteError(error instanceof Error ? error.message : "Failed to delete product");
        } finally {
            setIsDeleting(false);
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
            toast.success(product.featured ? "Product removed from featured" : "Product marked as featured");
            await fetchProducts();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update product status");
        }
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    const formatPrice = (p: string) => `KSh ${Number(p).toLocaleString('en-KE')}`;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Products</h1>
                    <p className="text-muted-foreground mt-1">Manage your store's inventory and catalog.</p>
                </div>
                <Link href="/mk-admin-portal/products/new" className={buttonVariants({ className: "h-11 rounded-xl gap-2" })}>
                    <Plus className="w-4 h-4" />
                    Add Product
                </Link>
            </div>

            <div className="bg-card p-4 rounded-2xl shadow-sm border border-border">
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

            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
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
                            <div className="col-span-1 border-r border-border">Image</div>
                            <div className="col-span-4">Product Name</div>
                            <div className="col-span-2">Category</div>
                            <div className="col-span-2">Base Price</div>
                            <div className="col-span-1 text-center">Status</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>

                        {filteredProducts.map((product) => (
                            <div key={product.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/10 transition-colors">

                                <div className="col-span-1 flex justify-center">
                                    <div className="w-10 h-10 bg-muted rounded-lg border border-border flex items-center justify-center overflow-hidden relative">
                                        {product.imageUrl ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
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
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setProductToDelete(product)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={!!productToDelete} onOpenChange={(open) => {
                if (!open) {
                    setProductToDelete(null);
                    setDeleteError(null);
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Product</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-foreground">"{productToDelete?.name}"</span>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {deleteError && (
                        <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-lg border border-destructive/20 font-medium">
                            {deleteError}
                        </div>
                    )}

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isDeleting}>Cancel</Button>
                        </DialogClose>
                        <Button 
                            variant="destructive" 
                            disabled={isDeleting}
                            onClick={confirmDelete}
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

