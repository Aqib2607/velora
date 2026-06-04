import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Facebook, Twitter, Instagram, Linkedin, 
  ArrowRight, ChevronUp, Sparkles
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const PremiumFooter = () => {
  const { t } = useTranslation();

  // Restored footer columns from original
  const footerColumnsData = [
    {
      title: t('footer.get_to_know', 'Get to Know Us'),
      links: [
        { label: t('footer.careers', 'Careers'), href: "/careers" },
        { label: t('footer.blog', 'Blog'), href: "/blog" },
        { label: t('footer.about', 'About Velora'), href: "/about" },
        { label: t('footer.investor_relations', 'Investor Relations'), href: "/investor-relations" },
        { label: t('footer.technology', 'Velora Technology'), href: "/technology" },
        { label: t('footer.velora_science', 'Velora Science'), href: "/velora-science" }
      ]
    },
    {
      title: t('footer.make_money', 'Make Money with Us'),
      links: [
        { label: t('footer.sell_products', 'Sell products on Velora'), href: "/sell" },
        { label: t('footer.sell_business', 'Sell on Velora Business'), href: "/sell-business" },
        { label: t('footer.advertise', 'Advertise Your Products'), href: "/advertise" },
        { label: t('footer.affiliate', 'Become an Affiliate'), href: "/affiliate" },
        { label: t('footer.self_publish', 'Self-Publish with Us'), href: "/self-publish" },
        { label: t('footer.pickup_hub', 'Host a Velora Hub'), href: "/pickup-hub" }
      ]
    },
    {
      title: t('footer.payment_products', 'Velora Payment Products'),
      links: [
        { label: t('footer.business_card', 'Velora Business Card'), href: "/business-card" },
        { label: t('footer.shop_points', 'Shop with Points'), href: "/shop-with-points" },
        { label: t('footer.reload_balance', 'Reload Your Balance'), href: "/reload-balance" },
        { label: t('footer.currency_converter', 'Currency Converter'), href: "/currency-converter" }
      ]
    },
    {
      title: t('footer.help', 'Let Us Help You'),
      links: [
        { label: t('footer.your_account', 'Your Account'), href: "/account" },
        { label: t('footer.your_orders', 'Your Orders'), href: "/info/orders" },
        { label: t('footer.shipping_policies', 'Shipping Rates & Policies'), href: "/shipping" },
        { label: t('footer.returns_refunds', 'Returns & Replacements'), href: "/returns" },
        { label: t('footer.help_center', 'Help'), href: "/help" }
      ]
    }
  ];

  // Restored ecosystem items
  const ecosystemItems = [
    { name: "Velora Music", path: "/velora-music", desc: "Stream millions of songs" },
    { name: "Velora Ads", path: "/velora-ads", desc: "Reach customers wherever they spend their time" },
    { name: "Velora Web Services", path: "/velora-web-services", desc: "Scalable Cloud Computing Services" },
    { name: "Velora Prime", path: "/velora-prime", desc: "Fast, FREE Delivery & More" },
    { name: "Velora Publishing", path: "/velora-publishing", desc: "Indie Digital & Print Publishing" },
    { name: "Velora Business", path: "/velora-business", desc: "Everything For Your Business" },
    { name: "Velora Global", path: "/velora-global", desc: "Ship Orders Internationally" },
    { name: "Velora Cloud", path: "/velora-cloud", desc: "Cloud Storage from Velora" },
    { name: "Velora Studios", path: "/velora-studios", desc: "Award-Winning Movies & TV Shows" },
    { name: "Velora Reviews", path: "/velora-reviews", desc: "Trusted Product Reviews" },
    { name: "Velora Devices", path: "/velora-devices", desc: "Smart Home & Electronics" },
    { name: "Velora Subscriptions", path: "/velora-subscriptions", desc: "Subscribe & Save" }
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  const legalLinks = [
    { label: t('footer.conditions_of_use', 'Conditions of Use'), href: "/conditions" },
    { label: t('footer.privacy_notice', 'Privacy Notice'), href: "/privacy" },
    { label: t('footer.data_disclosure', 'Your Ads Privacy Choices'), href: "/data-disclosure" },
    { label: t('footer.your_ads_privacy_choices', 'Interest-Based Ads'), href: "/ad-preferences" }
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative mt-20 border-t border-border bg-background">

      {/* ── Back to Top ──────────────────────────────── */}
      <motion.button
        onClick={scrollToTop}
        className="relative w-full py-4 bg-muted/30 hover:bg-muted/50 transition-all duration-300 text-sm font-medium flex items-center justify-center gap-2 group"
        whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
      >
        <ChevronUp className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
        Back to top
      </motion.button>

      <div className="relative container-premium py-16 lg:py-20">
        
        {/* ── Newsletter ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 rounded-3xl bg-foreground p-10 md:p-14 shadow-sm"
        >
          <div className="max-w-3xl mx-auto text-center">
            <Sparkles className="h-8 w-8 text-white/80 mx-auto mb-5" />
            <h3 className="font-display text-3xl md:text-4xl font-bold mb-4 text-white">
              Stay in the Loop
            </h3>
            <p className="text-background/70 mb-8 text-lg">
              Get exclusive deals, new arrivals, and insider updates delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              />
              <motion.button
                className="px-7 py-3.5 rounded-xl bg-background text-foreground font-semibold flex items-center justify-center gap-2 hover:bg-background/90 transition-all shadow-sm"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Subscribe
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── Footer Columns ─────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          {footerColumnsData.map((col, index) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <h4 className="font-display font-semibold mb-5 text-lg">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 inline-flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* ── Ecosystem Grid ─────────────────────────── */}
        <div className="mb-16">
          {/* Mobile Accordion */}
          <div className="md:hidden">
            <Accordion type="single" collapsible>
              <AccordionItem value="ecosystem" className="border-b-0">
                <AccordionTrigger className="py-6 hover:no-underline font-display font-semibold text-lg">
                  Explore Velora Ecosystem
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4">
                    {ecosystemItems.map((item) => (
                      <Link
                        to={item.path}
                        key={item.name}
                        className="flex flex-col group gap-1"
                      >
                        <span className="text-xs font-semibold text-foreground group-hover:text-foreground/80 transition-all">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground leading-snug">
                          {item.desc}
                        </span>
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:block">
            <div className="divider-gradient mb-10" />
            <h3 className="font-display text-2xl font-bold mb-8 text-center">
              Velora <span className="text-foreground">Ecosystem</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {ecosystemItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.04, duration: 0.4 }}
                >
                  <Link
                    to={item.path}
                    className="flex flex-col group cursor-pointer gap-1.5 p-4 rounded-xl hover:bg-muted/30 hover:shadow-sm transition-all duration-200"
                  >
                    <span className="text-xs font-semibold text-foreground group-hover:text-foreground/80 transition-all">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground leading-snug">
                      {item.desc}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ──────────────────────────────── */}
        <div className="pt-10 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-foreground flex items-center justify-center shadow-sm">
                <span className="text-lg font-black text-background">V</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground font-display">Velora</span>
                <span className="text-[10px] text-muted-foreground tracking-widest uppercase -mt-0.5">
                  Premium Commerce
                </span>
              </div>
            </Link>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2.5 rounded-xl bg-muted/30 hover:bg-foreground hover:text-background transition-all duration-300"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <social.icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Secure payments via</span>
              <div className="flex items-center gap-1.5">
                {['Visa', 'Mastercard', 'PayPal', 'Stripe'].map((method) => (
                  <div
                    key={method}
                    className="px-2.5 py-1 rounded-lg bg-muted/30 text-[11px] font-semibold text-muted-foreground"
                  >
                    {method}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3 mb-5">
            {legalLinks.map((link, i) => (
              <span key={link.label} className="flex items-center gap-2">
                <Link
                  to={link.href}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
                {i < legalLinks.length - 1 && <span className="text-border">·</span>}
              </span>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-center text-xs text-muted-foreground/60">
            {t('footer.copyright', `© ${new Date().getFullYear()} Velora. All rights reserved.`)}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PremiumFooter;
