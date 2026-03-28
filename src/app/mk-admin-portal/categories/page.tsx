"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Search, ArrowRight, Loader2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Category = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
};

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/admin/categories");
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Failed to fetch categories", error);
        } finally {
            setIsLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingCategory(null);
        setName("");
        setDescription("");
        setIsModalOpen(true);
    };

    const openEditModal = (cat: Category) => {
        setEditingCategory(cat);
        setName(cat.name);
        setDescription(cat.description || "");
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const url = editingCategory ? `/api/admin/categories?id=${editingCategory.id}` : "/api/admin/categories";
            const method = editingCategory ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, description }),
            });

            if (!res.ok) throw new Error("Failed to save category");

            await fetchCategories();
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, catName: string) => {
        if (!confirm(`Are you sure you want to delete "${catName}"? This cannot be undone.`)) return;

        try {
            const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete category");
            await fetchCategories();
        } catch (error) {
            console.error(error);
            alert("Failed to delete category");
        }
    };

    const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-mk-dark">Categories</h1>
                    <p className="text-muted-foreground mt-1">Manage your product categories.</p>
                </div>
                <Button onClick={openAddModal} className="h-11 rounded-xl gap-2">
                    <Plus className="w-4 h-4" />
                    Add Category
                </Button>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/50 flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search categories..."
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
                ) : filteredCategories.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                        No categories found. Start by adding one.
                    </div>
                ) : (
                    <div className="divide-y divide-border/50">
                        <div className="grid grid-cols-12 gap-4 p-4 text-sm font-semibold text-muted-foreground bg-muted/30">
                            <div className="col-span-1 border-r border-border/50">#</div>
                            <div className="col-span-4">Name</div>
                            <div className="col-span-5">Description</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>
                        {filteredCategories.map((cat, idx) => (
                            <div key={cat.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/10 transition-colors">
                                <div className="col-span-1 text-muted-foreground text-sm font-medium">{idx + 1}</div>
                                <div className="col-span-4 font-semibold text-sm">{cat.name}</div>
                                <div className="col-span-5 text-sm text-muted-foreground truncate">{cat.description || "-"}</div>
                                <div className="col-span-2 flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => openEditModal(cat)}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(cat.id, cat.name)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mk-dark/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-6 border-b border-border">
                            <h2 className="text-xl font-bold text-mk-dark">
                                {editingCategory ? "Edit Category" : "Add Category"}
                            </h2>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-mk-dark">Category Name *</label>
                                <Input
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Laptop Sleeves"
                                    className="bg-muted/50 border-0 focus-visible:ring-1 focus-visible:bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-mk-dark">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-muted/50 border-0 focus:ring-1 focus:ring-primary focus:bg-white resize-none h-24 text-sm"
                                    placeholder="Optional categorization description."
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Saving..." : "Save Category"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
