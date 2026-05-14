"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Loader2, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
    const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus("loading");

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        // Simulate API execution
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("Contact Form Submitted:", data);

        setStatus("success");
    };

    return (
        <div className="bg-mk-gray dark:bg-background min-h-screen py-16 pb-24">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 animate-slide-in-right">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-mk-dark dark:text-foreground mb-6">Contact Us</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Have a question about a product, your order, or just want to say hi? We're here to help. Our team typically responds within hours.
                    </p>
                </div>

                <div className="grid md:grid-cols-5 gap-8 bg-white dark:bg-card p-4 sm:p-8 rounded-[2.5rem] shadow-xl dark:shadow-none border border-border/50 animate-fade-in relative overflow-hidden">
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

                    {/* Contact Details */}
                    <div className="md:col-span-2 space-y-8 p-6 bg-mk-dark text-white rounded-3xl relative overflow-hidden">
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-2xl"></div>
                        
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Customer Support</h3>
                            <p className="text-white/70 text-sm leading-relaxed mb-8">
                                Our support team is available Monday through Saturday, 9am to 6pm EAT.
                            </p>
                            
                            <div className="space-y-6">
                                <a href="mailto:hello@mkstore.co.ke" className="flex items-center gap-4 text-white/90 hover:text-white transition-colors group">
                                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-primary/50 transition-colors">
                                        <Mail className="w-5 h-5 text-primary group-hover:text-white" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-white/50 mb-0.5">Email Us</div>
                                        <div className="font-medium">hello@mkstore.co.ke</div>
                                    </div>
                                </a>

                                <a href="tel:+254700000000" className="flex items-center gap-4 text-white/90 hover:text-white transition-colors group">
                                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-primary/50 transition-colors">
                                        <Phone className="w-5 h-5 text-primary group-hover:text-white" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-white/50 mb-0.5">Call Us</div>
                                        <div className="font-medium">+254 700 000 000</div>
                                    </div>
                                </a>

                                <div className="flex items-center gap-4 text-white/90">
                                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-white/50 mb-0.5">Location</div>
                                        <address className="not-italic font-medium">Nairobi, Kenya</address>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="md:col-span-3 p-6 sm:p-8 relative">
                        {status === "success" ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 animate-fade-in bg-white dark:bg-card z-10">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-mk-dark dark:text-foreground mb-4">Message Sent!</h3>
                                <p className="text-muted-foreground mb-8">
                                    Thank you for reaching out. We've received your message and will get back to you shortly.
                                </p>
                                <button
                                    onClick={() => setStatus("idle")}
                                    className="px-8 py-3 bg-mk-gray dark:bg-muted text-foreground font-semibold rounded-xl hover:bg-muted/80 transition-colors"
                                >
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-2xl font-bold text-mk-dark dark:text-foreground mb-6">Send a Message</h3>
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid sm:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                                            <input 
                                                id="name"
                                                name="name" 
                                                type="text" 
                                                required 
                                                disabled={status === "loading"}
                                                className="w-full h-12 px-4 rounded-xl bg-mk-gray/50 dark:bg-muted/50 border border-border/50 focus:bg-white dark:focus:bg-card focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" 
                                                placeholder="John Doe" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                                            <input 
                                                id="email"
                                                name="email" 
                                                type="email" 
                                                required 
                                                disabled={status === "loading"}
                                                className="w-full h-12 px-4 rounded-xl bg-mk-gray/50 dark:bg-muted/50 border border-border/50 focus:bg-white dark:focus:bg-card focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" 
                                                placeholder="john@example.com" 
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                                        <input 
                                            id="subject"
                                            name="subject" 
                                            type="text" 
                                            required 
                                            disabled={status === "loading"}
                                            className="w-full h-12 px-4 rounded-xl bg-mk-gray/50 dark:bg-muted/50 border border-border/50 focus:bg-white dark:focus:bg-card focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" 
                                            placeholder="Order Inquiry" 
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="message" className="text-sm font-medium">Message</label>
                                        <textarea 
                                            id="message"
                                            name="message" 
                                            required 
                                            disabled={status === "loading"}
                                            className="w-full h-32 p-4 rounded-xl bg-mk-gray/50 dark:bg-muted/50 border border-border/50 focus:bg-white dark:focus:bg-card focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none" 
                                            placeholder="How can we help you?" 
                                        />
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={status === "loading"}
                                        className="w-full h-14 mt-4 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {status === "loading" ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            "Send Message"
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
