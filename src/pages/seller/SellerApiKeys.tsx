import { useState } from "react";
import { Key, Eye, EyeOff, Plus, Shield } from "lucide-react";
import { motion } from "framer-motion";

export const SellerApiKeys = () => {
    const [showKey, setShowKey] = useState(false);

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <motion.h1
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-2xl lg:text-3xl font-bold flex items-center gap-3"
            >
                <Key className="h-7 w-7 text-foreground" /> Settings & API Keys
            </motion.h1>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-border bg-card overflow-hidden"
            >
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <span className="font-display font-semibold text-lg">API Keys</span>
                    <button className="flex items-center gap-2 text-xs px-4 py-2 rounded-xl bg-foreground text-background font-semibold hover:shadow-sm transition-all">
                        <Plus className="h-3.5 w-3.5" /> Generate New Key
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Use API keys to integrate Velora Seller APIs into your systems.
                        Keys are shown only once when created.
                    </p>
                    <div className="mt-6 p-5 rounded-xl bg-muted/30 border border-border">
                        <div className="flex items-center gap-2 mb-3">
                            <Shield className="h-4 w-4 text-foreground" />
                            <p className="font-semibold text-sm">Production Key</p>
                        </div>
                        <code className="text-xs font-mono bg-background px-4 py-3 rounded-xl block border border-border">
                            {showKey ? "vlr_live_sk_placeholder_generate_real_key" : "•".repeat(40)}
                        </code>
                        <button
                            onClick={() => setShowKey(!showKey)}
                            className="flex items-center gap-1.5 text-xs text-foreground mt-3 hover:text-foreground/80 font-semibold transition-colors"
                        >
                            {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            {showKey ? "Hide" : "Reveal"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SellerApiKeys;
