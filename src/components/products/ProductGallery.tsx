"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";

export default function ProductGallery({ images, productName }: { images: {id:string, url:string, altText:string|null}[], productName: string }) {
    const [mainImage, setMainImage] = useState(images[0]?.url || "/placeholder.svg");

    const isPlaceholder = mainImage.includes("placeholder") || mainImage === "/placeholder.svg";

    return (
        <div className="space-y-4 w-full">
            <div className="aspect-square bg-mk-gray dark:bg-muted rounded-3xl overflow-hidden relative border border-border/50 shadow-sm">
                <div className="absolute inset-0 flex items-center justify-center product-image-zoom w-full h-full">
                    {!isPlaceholder ? (
                        <Image
                            src={mainImage}
                            alt={productName}
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover object-center"
                            priority
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground space-y-4">
                            <div className="w-24 h-24 bg-white/50 dark:bg-black/20 rounded-2xl flex items-center justify-center">
                                <ShoppingBag className="w-10 h-10" />
                            </div>
                            <span className="text-sm font-medium">Image coming soon</span>
                        </div>
                    )}
                </div>
            </div>

            {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                    {images.map((img, i) => (
                        <button 
                            key={i} 
                            onClick={() => setMainImage(img.url)}
                            className={`aspect-square bg-mk-gray dark:bg-muted rounded-2xl overflow-hidden relative cursor-pointer outline-none transition-all ${
                                mainImage === img.url 
                                ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-background shadow-sm' 
                                : 'hover:ring-2 hover:ring-primary/50 hover:ring-offset-1 dark:hover:ring-offset-background'
                            }`}
                        >
                            {img.url && !img.url.includes("placeholder") ? (
                                <Image
                                    src={img.url}
                                    alt={`Thumbnail ${i+1}`}
                                    fill
                                    sizes="(max-width: 640px) 25vw, 150px"
                                    className="object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                                    <ShoppingBag className="w-5 h-5 text-muted-foreground/50" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
