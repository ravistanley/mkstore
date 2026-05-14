import { db } from "./index";
import { categories, products, productVariants, productImages, adminUsers } from "./schema";
import { hashPassword } from "../auth";

async function seed() {
    console.log("🌱 Seeding database...");

    // Seed admin user
    const adminEmail = process.env.ADMIN_EMAIL || "admin@mkstore.co.ke";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const hashedPassword = await hashPassword(adminPassword);

    await db.insert(adminUsers).values({
        email: adminEmail,
        passwordHash: hashedPassword,
    }).onConflictDoNothing();

    console.log(`✅ Admin user created: ${adminEmail}`);

    // Seed categories
    const categoryData = [
        {
            name: "Laptop Sleeves",
            slug: "laptop-sleeves",
            description: "Premium sleeves to protect your laptop in style",
            imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop"
        },
        {
            name: "MacBook Covers",
            slug: "macbook-covers",
            description: "Precision-fit cases for every MacBook model",
            imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop"
        },
        {
            name: "Phone Cases",
            slug: "phone-cases",
            description: "Protective and stylish cases for your smartphone",
            imageUrl: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=800&auto=format&fit=crop"
        },
        {
            name: "Desk Accessories",
            slug: "desk-accessories",
            description: "Elevate your workspace with premium accessories",
            imageUrl: "https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?q=80&w=800&auto=format&fit=crop"
        },
        {
            name: "Phone Charms",
            slug: "phone-charms",
            description: "Unique charms to personalize your phone",
            imageUrl: "https://images.unsplash.com/photo-1616410011236-7a42121dd981?q=80&w=800&auto=format&fit=crop"
        },
        {
            name: "Screen Protectors",
            slug: "screen-protectors",
            description: "Crystal-clear protection for your devices",
            imageUrl: "https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800&auto=format&fit=crop"
        },
        {
            name: "Cable Organizers",
            slug: "cable-organizers",
            description: "Keep your cables neat and tidy",
            imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop"
        },
    ];

    const insertedCategories = await db
        .insert(categories)
        .values(categoryData)
        .onConflictDoNothing()
        .returning();

    console.log(`✅ ${insertedCategories.length} categories created`);

    // Seed products
    const catMap = new Map(insertedCategories.map((c) => [c.slug, c.id]));

    const productData = [
        {
            name: "Premium Leather Laptop Sleeve",
            slug: "premium-leather-laptop-sleeve",
            description: "Handcrafted genuine leather sleeve with soft microfiber interior. Fits 13-14 inch laptops perfectly.",
            price: "3500.00",
            compareAtPrice: "4500.00",
            categoryId: catMap.get("laptop-sleeves"),
            featured: true,
            imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop"
        },
        {
            name: "MacBook Clear Hard Case",
            slug: "macbook-clear-hard-case",
            description: "Crystal clear polycarbonate case that showcases your MacBook's design while providing scratch protection.",
            price: "2800.00",
            categoryId: catMap.get("macbook-covers"),
            featured: true,
            imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop"
        },
        {
            name: "iPhone Silicone Case",
            slug: "iphone-silicone-case",
            description: "Soft-touch silicone case with precise cutouts and raised edges for camera protection.",
            price: "1500.00",
            compareAtPrice: "2000.00",
            categoryId: catMap.get("phone-cases"),
            featured: true,
            imageUrl: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=800&auto=format&fit=crop"
        },
        {
            name: "Crystal Bead Phone Charm",
            slug: "crystal-bead-phone-charm",
            description: "Handmade beaded charm with genuine crystals. Makes your phone uniquely yours.",
            price: "800.00",
            categoryId: catMap.get("phone-charms"),
            featured: false,
            imageUrl: "https://images.unsplash.com/photo-1616410011236-7a42121dd981?q=80&w=800&auto=format&fit=crop"
        },
        {
            name: "Tempered Glass Screen Protector",
            slug: "tempered-glass-screen-protector",
            description: "9H hardness tempered glass with oleophobic coating. Bubble-free installation guaranteed.",
            price: "500.00",
            categoryId: catMap.get("screen-protectors"),
            featured: true,
            imageUrl: "https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800&auto=format&fit=crop"
        },
        {
            name: "Bamboo Laptop Stand",
            slug: "bamboo-laptop-stand",
            description: "Eco-friendly bamboo stand with adjustable height. Improves ergonomics and airflow.",
            price: "4200.00",
            categoryId: catMap.get("desk-accessories"),
            featured: true,
            imageUrl: "https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?q=80&w=800&auto=format&fit=crop"
        },
        {
            name: "Leather Cable Organizer",
            slug: "leather-cable-organizer",
            description: "Genuine leather cable clips with adhesive backing. Set of 5 clips in assorted sizes.",
            price: "1200.00",
            categoryId: catMap.get("cable-organizers"),
            featured: false,
            imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop"
        },
        {
            name: "Minimalist Desk Mat",
            slug: "minimalist-desk-mat",
            description: "Premium PU leather desk mat. Waterproof, non-slip, and double-sided (black/grey).",
            price: "3200.00",
            compareAtPrice: "3800.00",
            categoryId: catMap.get("desk-accessories"),
            featured: true,
            imageUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=800&auto=format&fit=crop"
        },
    ];

    const insertedProducts = await db
        .insert(products)
        .values(productData.map(({ imageUrl, ...rest }) => rest))
        .onConflictDoNothing()
        .returning();

    let finalProducts = [...insertedProducts];
    if (finalProducts.length === 0) {
        finalProducts = await db.select().from(products);
    }

    console.log(`✅ Using ${finalProducts.length} products for variants/images`);

    // Seed variants
    const prodMap = new Map(finalProducts.map((p) => [p.slug, p.id]));

    const variantData = [
        { productId: prodMap.get("macbook-clear-hard-case")!, name: "MacBook Air M1", sku: "MCC-AIR-M1", stockQuantity: 25 },
        { productId: prodMap.get("macbook-clear-hard-case")!, name: "MacBook Air M2", sku: "MCC-AIR-M2", stockQuantity: 30 },
        { productId: prodMap.get("macbook-clear-hard-case")!, name: "MacBook Pro 14\"", sku: "MCC-PRO-14", stockQuantity: 20 },
        { productId: prodMap.get("macbook-clear-hard-case")!, name: "MacBook Pro 16\"", sku: "MCC-PRO-16", stockQuantity: 15 },
        { productId: prodMap.get("iphone-silicone-case")!, name: "iPhone 15", sku: "ISC-15", stockQuantity: 50 },
        { productId: prodMap.get("iphone-silicone-case")!, name: "iPhone 15 Pro", sku: "ISC-15P", stockQuantity: 40 },
        { productId: prodMap.get("iphone-silicone-case")!, name: "iPhone 15 Pro Max", sku: "ISC-15PM", stockQuantity: 35 },
        { productId: prodMap.get("tempered-glass-screen-protector")!, name: "iPhone 15", sku: "TGP-15", stockQuantity: 100 },
        { productId: prodMap.get("tempered-glass-screen-protector")!, name: "Samsung S24", sku: "TGP-S24", stockQuantity: 80 },
        { productId: prodMap.get("premium-leather-laptop-sleeve")!, name: "13 inch", sku: "PLS-13", stockQuantity: 20 },
        { productId: prodMap.get("premium-leather-laptop-sleeve")!, name: "14 inch", sku: "PLS-14", stockQuantity: 25 },
        { productId: prodMap.get("premium-leather-laptop-sleeve")!, name: "15 inch", sku: "PLS-15", stockQuantity: 15 },
    ].filter(v => v.productId); // Ensure we only insert variants with a valid productId

    if (variantData.length > 0) {
        await db.insert(productVariants).values(variantData).onConflictDoNothing();
        console.log(`✅ ${variantData.length} variants created`);
    }

    // Seed product images using the map to match real URLs
    const imageData = finalProducts.map((p) => {
        const matchingProduct = productData.find(pd => pd.slug === p.slug);
        return {
            productId: p.id,
            url: matchingProduct?.imageUrl || `https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop`,
            altText: p.name,
            position: 0,
        };
    });

    await db.insert(productImages).values(imageData).onConflictDoNothing();
    console.log(`✅ ${imageData.length} product images created`);

    console.log("\n🎉 Seeding complete!");
}

seed()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    });
