import { z } from "zod";

// ============================================================
// Product Validators
// ============================================================
export const createProductSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    slug: z
        .string()
        .min(1, "Slug is required")
        .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
    description: z.string().optional(),
    price: z.coerce.number().positive("Price must be positive"),
    compareAtPrice: z.coerce.number().positive().optional().nullable(),
    categoryId: z.string().uuid().optional().nullable(),
    featured: z.boolean().default(false),
    active: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

// ============================================================
// Variant Validators
// ============================================================
export const createVariantSchema = z.object({
    name: z.string().min(1, "Variant name is required"),
    sku: z.string().optional().nullable(),
    priceOverride: z.coerce.number().positive().optional().nullable(),
    stockQuantity: z.coerce.number().int().min(0).default(0),
});

// ============================================================
// Category Validators
// ============================================================
export const createCategorySchema = z.object({
    name: z.string().min(1, "Category name is required"),
    slug: z
        .string()
        .min(1, "Slug is required")
        .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
    description: z.string().optional(),
    imageUrl: z.string().url().optional().nullable(),
});

// ============================================================
// Cart Validators
// ============================================================
export const addToCartSchema = z.object({
    productId: z.string().uuid("Invalid product ID"),
    variantId: z.string().uuid("Invalid variant ID").optional().nullable(),
    quantity: z.coerce.number().int().min(1).default(1),
});

export const updateCartItemSchema = z.object({
    itemId: z.string().uuid("Invalid item ID"),
    quantity: z.coerce.number().int().min(0),
});

// ============================================================
// Checkout Validators
// ============================================================
export const checkoutSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    phoneNumber: z
        .string()
        .min(9, "Phone number is required")
        .regex(/^(\+?254|0)?[17]\d{8}$/, "Enter a valid Kenyan phone number"),
    email: z.string().email().optional().or(z.literal("")),
    deliveryLocation: z.string().min(1, "Delivery location is required"),
    deliveryNotes: z.string().optional(),
    deliveryMethod: z.enum(["delivery", "pickup"]),
    paymentMethod: z.enum(["mpesa", "pay_on_delivery"]),
});

// ============================================================
// Admin Auth Validators
// ============================================================
export const adminLoginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

// ============================================================
// Order Status Validators
// ============================================================
export const updateOrderStatusSchema = z.object({
    orderStatus: z.enum([
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
    ]),
    paymentStatus: z
        .enum(["pending", "completed", "failed", "refunded"])
        .optional(),
    mpesaReceipt: z.string().optional(),
});

// ============================================================
// Track Order
// ============================================================
export const trackOrderSchema = z.object({
    orderNumber: z.string().min(1, "Order number is required"),
    phoneNumber: z
        .string()
        .min(9, "Phone number is required"),
});
