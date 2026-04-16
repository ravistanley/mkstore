import { ShieldCheck, Zap, Heart, Truck, Sparkles, Globe } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="bg-mk-gray dark:bg-background min-h-screen pb-24">
            {/* Hero Section */}
            <div className="relative pt-24 pb-32 overflow-hidden bg-mk-dark">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=2070')] bg-cover bg-center opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-mk-dark to-transparent"></div>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center animate-slide-in-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-semibold tracking-wide mb-6">
                        <Sparkles className="w-4 h-4 mr-2" /> Our Story
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
                        Elevating Your <br className="hidden md:block"/> Everyday Tech
                    </h1>
                    <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
                        MkStore was founded to provide high-quality, aesthetically pleasing tech accessories to the Kenyan market. Elevating your everyday carry since 2024.
                    </p>
                </div>
            </div>

            {/* Stats Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 mb-24 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <div className="bg-white dark:bg-card rounded-3xl shadow-xl dark:shadow-none border border-border/50 p-8 md:p-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border">
                        <div className="text-center px-4">
                            <div className="text-4xl font-extrabold text-mk-dark dark:text-foreground mb-2">10k+</div>
                            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Happy Clients</div>
                        </div>
                        <div className="text-center px-4">
                            <div className="text-4xl font-extrabold text-mk-dark dark:text-foreground mb-2">50+</div>
                            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Premium Brands</div>
                        </div>
                        <div className="text-center px-4">
                            <div className="text-4xl font-extrabold text-mk-dark dark:text-foreground mb-2">24h</div>
                            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Avg Delivery</div>
                        </div>
                        <div className="text-center px-4">
                            <div className="text-4xl font-extrabold text-mk-dark dark:text-foreground mb-2">4.9</div>
                            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Star Rating</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mission Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-20 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold tracking-tight text-mk-dark dark:text-foreground">Bridging the Gap in Premium Accessories</h2>
                        <div className="space-y-4 text-muted-foreground leading-relaxed text-lg">
                            <p>
                                We realized that while modern devices are beautifully designed, the accessories protecting and accompanying them often fall short in both aesthetics and quality.
                            </p>
                            <p>
                                We bridge that gap by curating a collection of minimalist, premium products that complement your devices rather than detract from them. Every product we sell is treated as an extension of your own personal style.
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl relative z-10 glass border-2 border-white/20">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-mk-purple/20 flex items-center justify-center">
                                {/* Decorative geometric elements simulating premium setup */}
                                <div className="w-48 h-48 rounded-full bg-white/10 blur-xl absolute -top-10 -left-10 animate-pulse-slow"></div>
                                <div className="w-64 h-64 rounded-full bg-mk-dark/10 shadow-2xl backdrop-blur-md border border-white/10 flex items-center justify-center">
                                    <Globe className="w-20 h-20 text-white/50" />
                                </div>
                            </div>
                        </div>
                        {/* Decorative background shape */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 rounded-[3rem] -rotate-6 z-0"></div>
                    </div>
                </div>
            </div>

            {/* Values Section */}
            <div className="bg-white/50 dark:bg-card/50 py-24 border-y border-border/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-mk-dark dark:text-foreground mb-4">Why Choose MkStore?</h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">Our commitment to excellence drives everything we do.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white dark:bg-muted p-8 rounded-2xl shadow-sm border border-border/50 card-hover group">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                                <ShieldCheck className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-mk-dark dark:text-foreground">Curated Selection</h3>
                            <p className="text-muted-foreground">We don't overwhelm you with choices; we offer only the best. Every item is rigorously tested.</p>
                        </div>

                        <div className="bg-white dark:bg-muted p-8 rounded-2xl shadow-sm border border-border/50 card-hover group">
                            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 text-emerald-500 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <Heart className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-mk-dark dark:text-foreground">Premium Quality</h3>
                            <p className="text-muted-foreground">Materials and craftsmanship that speak for themselves. Built to last and age gracefully.</p>
                        </div>

                        <div className="bg-white dark:bg-muted p-8 rounded-2xl shadow-sm border border-border/50 card-hover group">
                            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                <Zap className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-mk-dark dark:text-foreground">Seamless Experience</h3>
                            <p className="text-muted-foreground">From fast local delivery to integrated M-Pesa payments, we ensure a frictionless shopping journey.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
