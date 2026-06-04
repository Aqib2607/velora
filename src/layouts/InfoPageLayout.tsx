import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface InfoPageLayoutProps {
    title: string;
    subtitle?: string;
    breadcrumb: Array<{ label: string; href: string }>;
    children: React.ReactNode;
}

const InfoPageLayout = ({ title, subtitle, breadcrumb, children }: InfoPageLayoutProps) => {
    // Update document title for SEO
    React.useEffect(() => {
        document.title = `${title} | Velora`;
    }, [title]);

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-muted/30 py-16 lg:py-20 border-b border-border">
                <div className="container-premium relative z-10">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8" aria-label="Breadcrumb">
                        <Link to="/" className="hover:text-foreground transition-colors font-medium">Home</Link>
                        {breadcrumb.map((crumb, index) => (
                            <React.Fragment key={crumb.href}>
                                <ChevronRight className="h-3.5 w-3.5" />
                                {index === breadcrumb.length - 1 ? (
                                    <span className="text-foreground font-semibold">{crumb.label}</span>
                                ) : (
                                    <Link to={crumb.href} className="hover:text-foreground transition-colors font-medium">
                                        {crumb.label}
                                    </Link>
                                )}
                            </React.Fragment>
                        ))}
                    </nav>

                    <motion.h1
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="font-display text-display font-bold tracking-tight text-foreground mb-4"
                    >
                        {title}
                    </motion.h1>
                    {subtitle && (
                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-body-lg text-muted-foreground max-w-3xl"
                        >
                            {subtitle}
                        </motion.p>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <main className="container-premium py-14 lg:py-16">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="bg-card border border-border rounded-2xl shadow-sm p-8 md:p-12 lg:p-14 prose prose-slate dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-5 prose-h2:border-b-0 prose-p:text-base prose-p:leading-relaxed prose-a:text-foreground hover:prose-a:opacity-80 transition-opacity"
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
};

export default InfoPageLayout;
