export default function AboutPage() {
    return (
        <div className="bg-mk-gray min-h-screen py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-mk-dark mb-6 text-center">About MkStore</h1>
                <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
                    Premium tech accessories designed for the modern Kenyan professional. Elevating your everyday carry since 2024.
                </p>

                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-border/50">
                    <div className="prose prose-lg max-w-none prose-p:text-muted-foreground prose-headings:text-mk-dark">
                        <h2>Our Story</h2>
                        <p>
                            MkStore was founded with a simple mission: to provide high-quality, aesthetically pleasing tech accessories to the Kenyan market. We realized that while modern devices are beautifully designed, the accessories protecting and accompanying them often fall short.
                        </p>
                        <p>
                            We bridge that gap by curating a collection of minimalist, premium products that complement your devices rather than detract from them.
                        </p>

                        <h2>Our Promise</h2>
                        <p>
                            We believe in quality without compromise. Every product we stock is rigorously tested for durability, functionality, and design excellence. When you shop at MkStore, you're not just buying an accessory; you're investing in an enhancement to your daily tech experience.
                        </p>

                        <h2>Why Choose Us?</h2>
                        <ul>
                            <li><strong>Curated Selection:</strong> We don't overwhelm you with choices; we offer only the best.</li>
                            <li><strong>Premium Quality:</strong> Materials and craftsmanship that speak for themselves.</li>
                            <li><strong>Fast Local Delivery:</strong> Reliable shipping across Kenya.</li>
                            <li><strong>Seamless Payments:</strong> Integrated M-Pesa for a smooth checkout process.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
