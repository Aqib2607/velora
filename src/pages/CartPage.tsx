import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag, Shield, Truck, RotateCcw } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useRegionStore } from "@/store/useRegionStore";
import { convertAndFormat, convertAmount } from "@/utils/currency";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

const CartPage = () => {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore();
  const { currency, locale, taxRate } = useRegionStore();
  const totalInUSD = totalPrice();
  const { t } = useTranslation();

  if (items.length === 0) {
    return (
      <div className="container-premium py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-24 w-24 mx-auto mb-6 rounded-3xl bg-muted/50 flex items-center justify-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-3">{t('cart.empty')}</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">{t('cart.continue_shopping')}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-foreground px-8 py-4 font-semibold text-background shadow-sm hover:-translate-y-0.5 transition-all"
          >
            {t('cart.continue_shopping')}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container-premium py-8 lg:py-12">
      <motion.h1
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-title font-bold mb-10"
      >
        {t('cart.shopping_cart')} <span className="text-muted-foreground font-normal text-lg">({items.length} {t('cart.items')})</span>
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
          {items.map((item, index) => (
            <motion.div
              key={item.product.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.05 }}
              className="flex gap-5 p-5 rounded-2xl border border-border bg-card hover:shadow-sm transition-all duration-300 group"
            >
              <Link to={`/product/${item.product.id}`}>
                <img src={item.product.image} alt={item.product.name} className="h-28 w-28 rounded-xl object-cover group-hover:scale-105 transition-transform duration-300" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.product.id}`}>
                  <h3 className="font-semibold truncate hover:text-foreground/80 transition-colors text-base">{item.product.name}</h3>
                </Link>
                <p className="text-sm text-muted-foreground mt-1">{item.product.seller}</p>
                <p className="font-bold text-lg text-foreground mt-2">{convertAndFormat(item.product.price, currency, locale)}</p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center rounded-xl border border-border overflow-hidden">
                    <motion.button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-2 hover:bg-muted/50 transition-colors"
                      whileTap={{ scale: 0.9 }}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </motion.button>
                    <span className="px-4 text-sm font-semibold tabular-nums">{item.quantity}</span>
                    <motion.button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-2 hover:bg-muted/50 transition-colors"
                      whileTap={{ scale: 0.9 }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </motion.button>
                  </div>
                  <motion.button
                    onClick={() => removeItem(item.product.id)}
                    className="text-destructive hover:bg-destructive/10 p-2 rounded-xl transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
              <p className="font-bold text-lg shrink-0">{convertAndFormat(item.product.price * item.quantity, currency, locale)}</p>
            </motion.div>
          ))}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border bg-card p-7 sticky top-32 shadow-sm"
          >
            <h2 className="font-display font-bold text-xl mb-6">{t('cart.order_summary')}</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{t('cart.subtotal')}</span><span className="font-semibold">{convertAndFormat(totalInUSD, currency, locale)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t('cart.shipping')}</span><span className="font-semibold text-green-600">{totalInUSD > 50 ? t('cart.free') : convertAndFormat(5.99, currency, locale)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t('cart.tax')} ({Math.round(taxRate * 100)}%)</span><span className="font-semibold">{convertAndFormat(totalInUSD * taxRate, currency, locale)}</span></div>
            </div>
            <div className="divider-gradient my-5" />
            <div className="flex justify-between font-bold text-xl mb-6">
              <span>{t('cart.total')}</span>
              <span className="text-foreground">{convertAndFormat(totalInUSD + (totalInUSD > 50 ? 0 : 5.99) + totalInUSD * taxRate, currency, locale)}</span>
            </div>
            <Link
              to="/checkout"
              className="w-full flex items-center justify-center rounded-xl bg-foreground px-6 py-4 font-semibold text-background hover:opacity-90 shadow-sm hover:-translate-y-0.5 transition-all duration-300"
            >
              {t('cart.proceed_to_checkout')}
            </Link>

            {/* Trust */}
            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Secure</span>
              <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Fast Delivery</span>
              <span className="flex items-center gap-1"><RotateCcw className="h-3.5 w-3.5" /> Easy Returns</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
