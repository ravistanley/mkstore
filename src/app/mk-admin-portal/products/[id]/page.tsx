"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, UploadCloud, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ProductForm({ productId }: { productId: string }) {
    const router = useRouter();
    const isEdit = productId !== "new";

    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(isEdit);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [compareAtPrice, setCompareAtPrice] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [featured, setFeatured] = useState(false);
    const [active, setActive] = useState(true);

    // Relations
    const [variants, setVariants] = useState<{ id?: string; name: string; sku: string; priceOverride: string; stockQuantity: number }[]>([]);
    const [images, setImages] = useState<{ id?: string; url: string; altText: string }[]>([]);

    useEffect(() => {
        fetchCategories();
        if (isEdit) {
            fetchProduct();
        }
    }, [productId]);

    const fetchCategories = async () => {
        const res = await fetch("/api/admin/categories");
        if (res.ok) setCategories(await res.json());
    };

    const fetchProduct = async () => {
        try {
            const res = await fetch(`/api/admin/products?id=${productId}`);
            if (!res.ok) throw new Error("Product not found");
            const data = await res.json();

            setName(data.name);
            setDescription(data.description || "");
            setPrice(data.price);
            setCompareAtPrice(data.compareAtPrice || "");
            setCategoryId(data.categoryId || "");
            setFeatured(data.featured);
            setActive(data.active);
            setVariants(data.variants || []);
            setImages(data.images || []);
        } catch (error) {
            console.error(error);
            alert("Failed to load product");
            router.push("/mk-admin-portal/products");
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        // Fake upload for UI since we don't have cloudinary keys verified
        // In production, you'd post to /api/admin/upload via FormData
        setUploadingImage(true);
        setTimeout(() => {
            setImages([...images, { url: "/placeholder.svg", altText: name }]);
            setUploadingImage(false);
            if (e.target) e.target.value = '';
        }, 1000);
    };

    const addVariant = () => {
        setVariants([...variants, { name: "", sku: "", priceOverride: "", stockQuantity: 10 }]);
    };

    const updateVariant = (index: number, field: string, value: any) => {
        const newVariants = [...variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setVariants(newVariants);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                name,
                description,
                price,
                compareAtPrice: compareAtPrice || null,
                categoryId: categoryId || null,
                featured,
                active,
                variants: variants.map(v => ({ ...v, priceOverride: v.priceOverride || null })),
                images,
            };

            const url = isEdit ? `/api/admin/products?id=${productId}` : "/api/admin/products";
            const method = isEdit ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to save product");
            }

            router.push("/mk-admin-portal/products");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : "An error occurred");
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-mk-dark">
                        {isEdit ? "Edit Product" : "Add New Product"}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Column */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50 space-y-6">
                        <h2 className="text-lg font-bold text-mk-dark">Basic Details</h2>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-mk-dark">Product Name *</label>
                            <Input required value={name} onChange={e => setName(e.target.value)} className="bg-muted/50 border-0" placeholder="e.g. Premium Leather Laptop Sleeve" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-mk-dark">Description</label>
                            <Textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="bg-muted/50 border-0 min-h-[150px] resize-none"
                                placeholder="Product description and details..."
                            />
                        </div>
                    </div>

                    {/* Media */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50 space-y-6">
                        <h2 className="text-lg font-bold text-mk-dark">Media</h2>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {images.map((img, i) => (
                                <div key={i} className="aspect-square bg-muted rounded-xl border border-border/50 relative group overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">IMG {i + 1}</div>
                                    <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}

                            <label className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                                {uploadingImage ? (
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                ) : (
                                    <>
                                        <UploadCloud className="w-6 h-6 text-muted-foreground mb-2" />
                                        <span className="text-xs font-medium text-muted-foreground">Upload</span>
                                    </>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                            </label>
                        </div>
                    </div>

                    {/* Variants */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold text-mk-dark">Variants & Inventory</h2>
                            <Button type="button" variant="outline" size="sm" onClick={addVariant} className="gap-2">
                                <Plus className="w-4 h-4" /> Add Variant
                            </Button>
                        </div>

                        {variants.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-xl border border-dashed border-border">
                                No variants added. Will use standard base inventory logic.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {variants.map((v, i) => (
                                    <div key={i} className="grid sm:grid-cols-12 gap-4 p-4 rounded-xl border border-border/50 bg-muted/10 relative group items-start">
                                        <button type="button" onClick={() => removeVariant(i)} className="absolute -top-2 -right-2 w-6 h-6 bg-background border shadow-sm text-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X className="w-3 h-3" />
                                        </button>

                                        <div className="sm:col-span-4 space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-muted-foreground">Variant Name</label>
                                            <Input value={v.name} onChange={e => updateVariant(i, 'name', e.target.value)} placeholder="e.g. Space Gray / 13 inch" className="h-10 text-sm" required />
                                        </div>
                                        <div className="sm:col-span-3 space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-muted-foreground">SKU (Opt)</label>
                                            <Input value={v.sku} onChange={e => updateVariant(i, 'sku', e.target.value)} placeholder="MK-001" className="h-10 text-sm" />
                                        </div>
                                        <div className="sm:col-span-3 space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-muted-foreground">Price Override</label>
                                            <Input value={v.priceOverride} onChange={e => updateVariant(i, 'priceOverride', e.target.value)} placeholder="KSh" type="number" className="h-10 text-sm" />
                                        </div>
                                        <div className="sm:col-span-2 space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-muted-foreground">Stock</label>
                                            <Input value={v.stockQuantity} onChange={e => updateVariant(i, 'stockQuantity', parseInt(e.target.value) || 0)} type="number" required className="h-10 text-sm" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">

                    {/* Status */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50 space-y-6">
                        <h2 className="text-lg font-bold text-mk-dark">Status</h2>

                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                                <div>
                                    <div className="font-semibold text-sm">Active Status</div>
                                    <div className="text-xs text-muted-foreground">Visible on storefront</div>
                                </div>
                                <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} className="w-4 h-4 accent-primary" />
                            </label>

                            <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors flex-wrap gap-2">
                                <div className="flex-1">
                                    <div className="font-semibold text-sm">Featured Product</div>
                                    <div className="text-xs text-muted-foreground">Show on homepage</div>
                                </div>
                                <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="w-4 h-4 accent-amber-500" />
                            </label>
                        </div>
                    </div>

                    {/* Organization */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50 space-y-6">
                        <h2 className="text-lg font-bold text-mk-dark">Organization</h2>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-mk-dark">Category</label>
                            <select
                                value={categoryId}
                                onChange={e => setCategoryId(e.target.value)}
                                className="w-full h-12 px-3 rounded-xl bg-muted/50 border-0 focus:ring-1 focus:ring-primary text-sm"
                            >
                                <option value="">Select a category</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50 space-y-6">
                        <h2 className="text-lg font-bold text-mk-dark">Base Pricing</h2>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-mk-dark">Base Price (KSh) *</label>
                            <Input required type="number" value={price} onChange={e => setPrice(e.target.value)} className="bg-muted/50 border-0" placeholder="e.g. 2500" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-mk-dark">Compare at Price (Optional)</label>
                            <Input type="number" value={compareAtPrice} onChange={e => setCompareAtPrice(e.target.value)} className="bg-muted/50 border-0" placeholder="e.g. 3000" />
                            <p className="text-xs text-muted-foreground">Shows as crossed-out price for discounts.</p>
                        </div>
                    </div>

                </div>

            </form>

            {/* Floating Action Bar */}
            <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-border z-10">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} size="lg" className="w-32">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Product"}
                    </Button>
                </div>
            </div>

            {/* Spacer for bottom bar */}
            <div className="h-20" />
        </div>
    );
}
