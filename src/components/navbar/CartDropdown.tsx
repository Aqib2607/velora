import { useState } from "react";
import { ShoppingCart, X, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/cartStore";
import { useCartQuery, useRemoveFromCart, type CartItem as AuthCartItem } from "@/hooks/useCartQuery";
import type { Product } from "@/hooks/useProductsQuery";
import { cn } from "@/lib/utils";

type GuestCartItem = { product: Product; quantity: number };

const CartDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated } = useAuthStore();
    
    // Auth Cart
    const { data: cartData } = useCartQuery();
    const removeFromCartMutation = useRemoveFromCart();
    
    // Guest Cart
    const localCartItems = useCartStore(state => state.items);
    const removeLocalItem = useCartStore(state => state.removeItem);
    const totalLocalItems = useCartStore(state => state.totalItems());
    const totalLocalPrice = useCartStore(state => state.totalPrice());

    // Computed
    const isAuth = isAuthenticated;
    const items = isAuth ? (cartData?.items || []) : localCartItems;
    
    const totalItems = isAuth 
        ? items.reduce((sum: number, i: unknown) => sum + (i as AuthCartItem).quantity, 0)
        : totalLocalItems;
        
    const subtotal = isAuth
        ? items.reduce((sum: number, i: unknown) => sum + ((i as AuthCartItem).unit_price * (i as AuthCartItem).quantity), 0)
        : totalLocalPrice;

    const handleRemove = (itemId: number, skuId?: number) => {
        if (isAuth) {
            removeFromCartMutation.mutate(itemId);
        } else {
            removeLocalItem(skuId!); // For local cart, product ID is used
        }
    };

    return (
        <div className="relative" onMouseLeave={() => setIsOpen(false)}>
            <div onMouseEnter={() => setIsOpen(true)}>
                <Link to="/cart">
                    <motion.button
                        className="relative p-2.5 rounded-xl hover:bg-muted/50 transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Cart"
                    >
                        <ShoppingCart className="h-5 w-5" />
                        <motion.span
                            className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-foreground text-background text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm"
                            initial={{ scale: 0 }}
                            animate={{ scale: totalItems > 0 ? 1 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        >
                            {totalItems > 99 ? "99+" : totalItems}
                        </motion.span>
                    </motion.button>
                </Link>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-80 bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl z-50 overflow-hidden text-foreground"
                    >
                        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
                            <h3 className="font-semibold text-sm flex items-center gap-2">
                                <ShoppingCart className="h-4 w-4" />
                                Cart Preview
                            </h3>
                            <span className="text-xs text-muted-foreground font-medium">
                                {totalItems} items
                            </span>
                        </div>
                        
                        <div className="max-h-80 overflow-y-auto p-2">
                            {items.length === 0 ? (
                                <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2">
                                        <ShoppingCart className="h-6 w-6 text-muted-foreground opacity-50" />
                                    </div>
                                    <p className="text-sm font-medium">Your cart is empty</p>
                                    <p className="text-xs text-muted-foreground">Start shopping to add items.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {items.map((rawItem: unknown, idx: number) => {
                                        // Handle both Auth Cart Item and Guest Cart Item structures
                                        const isAuthItem = isAuth;
                                        const id = isAuthItem ? (rawItem as AuthCartItem).id : (rawItem as GuestCartItem).product.id;
                                        const name = isAuthItem ? (rawItem as AuthCartItem).sku.product.name : (rawItem as GuestCartItem).product.name;
                                        const price = isAuthItem ? (rawItem as AuthCartItem).unit_price : (rawItem as GuestCartItem).product.price;
                                        const qty = (rawItem as AuthCartItem | GuestCartItem).quantity;
                                        const image = isAuthItem ? (rawItem as AuthCartItem).sku.product.thumbnail : (rawItem as GuestCartItem).product.thumbnail;
                                        const skuId = isAuthItem ? (rawItem as AuthCartItem).sku.id : (rawItem as GuestCartItem).product.id;

                                        return (
                                            <div key={`${id}-${idx}`} className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                                                <div className="h-16 w-16 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                                                    {image ? (
                                                        <img src={image} alt={name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">No img</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 flex flex-col justify-center min-w-0">
                                                    <p className="text-sm font-medium truncate">{name}</p>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <p className="text-xs text-muted-foreground">Qty: {qty}</p>
                                                        <p className="text-sm font-bold">${(price * qty).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.preventDefault(); handleRemove(id, skuId); }}
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-red-500 transition-all"
                                                    aria-label="Remove item"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        
                        {items.length > 0 && (
                            <div className="p-4 border-t border-border bg-muted/10">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-medium text-muted-foreground">Subtotal</span>
                                    <span className="text-lg font-black">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Link
                                        to="/cart"
                                        onClick={() => setIsOpen(false)}
                                        className="w-full py-2.5 rounded-lg border border-border text-center text-sm font-semibold hover:bg-muted transition-colors"
                                    >
                                        View Cart
                                    </Link>
                                    <Link
                                        to="/checkout"
                                        onClick={() => setIsOpen(false)}
                                        className="w-full py-2.5 rounded-lg bg-foreground text-background text-center text-sm font-semibold hover:opacity-90 transition-opacity"
                                    >
                                        Checkout
                                    </Link>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CartDropdown;
