export default function Newsletter() {
    return (
        <section className="py-20 bg-mk-dark text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-bold tracking-tight mb-4">
                    Join the MkStore Community
                </h2>
                <p className="text-white/70 mb-8 max-w-xl mx-auto">
                    Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
                </p>

                <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        required
                        className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                    <button
                        type="submit"
                        className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                    >
                        Subscribe
                    </button>
                </form>
                <p className="text-xs text-white/40 mt-4">
                    By subscribing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </section>
    );
}
