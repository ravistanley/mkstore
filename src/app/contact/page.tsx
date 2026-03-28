export default function ContactPage() {
    return (
        <div className="bg-mk-gray min-h-[80vh] py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-mk-dark mb-6 text-center">Contact Us</h1>
                <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
                    Have a question about a product, your order, or just want to say hi? We're here to help.
                </p>

                <div className="grid md:grid-cols-2 gap-8">

                    {/* Contact Details */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-border/50 space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-mk-dark mb-2">Customer Support</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                                Our support team is available Monday through Saturday, 9am to 6pm EAT.
                            </p>
                            <div className="space-y-4 font-medium text-sm">
                                <p>Email: <a href="mailto:hello@mkstore.co.ke" className="text-primary hover:underline">hello@mkstore.co.ke</a></p>
                                <p>Phone: <a href="tel:+254700000000" className="text-primary hover:underline">+254 700 000 000</a></p>
                            </div>
                        </div>

                        <hr className="border-border" />

                        <div>
                            <h3 className="text-lg font-bold text-mk-dark mb-2">Location</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                                We are an online-first store, but our fulfillment operations are based in Nairobi.
                            </p>
                            <address className="not-italic text-sm font-medium">
                                Nairobi Central Business District<br />
                                Nairobi, Kenya
                            </address>
                        </div>
                    </div>

                    {/* Contact Form Placeholder */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-border/50">
                        <h3 className="text-lg font-bold text-mk-dark mb-6">Send a Message</h3>
                        <form className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <input type="text" className="w-full h-12 px-4 rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary" placeholder="Your name" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Component</label>
                                <input type="email" className="w-full h-12 px-4 rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary" placeholder="Your email address" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Message</label>
                                <textarea className="w-full h-32 p-4 rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary resize-none" placeholder="How can we help?" />
                            </div>
                            <button type="button" className="w-full h-12 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">
                                Send Message
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}
