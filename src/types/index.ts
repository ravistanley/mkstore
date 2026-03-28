// ============================================================
// MkStore — Core TypeScript Types
// ============================================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  categoryId: string | null;
  featured: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  category?: Category | null;
  variants?: ProductVariant[];
  images?: ProductImage[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string | null;
  priceOverride: number | null;
  stockQuantity: number;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText: string | null;
  position: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
}

export interface Cart {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  items?: CartItem[];
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  priceAtTimeAdded: number;
  // Relations
  product?: Product;
  variant?: ProductVariant | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  fullName: string;
  phoneNumber: string;
  email: string | null;
  deliveryLocation: string;
  deliveryNotes: string | null;
  deliveryMethod: string;
  paymentMethod: string;
  mpesaReceipt: string | null;
  paymentStatus: string;
  orderStatus: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  productName: string;
  variantName: string | null;
  quantity: number;
  price: number;
}

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

// Cart action types
export type CartAction = "add" | "update" | "remove";

// Order statuses
export const ORDER_STATUSES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = [
  "pending",
  "completed",
  "failed",
  "refunded",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

// Product with full relations
export type ProductWithRelations = Product & {
  category: Category | null;
  variants: ProductVariant[];
  images: ProductImage[];
};

// Cart with items and product details
export type CartWithItems = Cart & {
  items: (CartItem & {
    product: Product;
    variant: ProductVariant | null;
  })[];
};
