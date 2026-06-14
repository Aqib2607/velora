import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCartQuery } from "@/hooks/useCartQuery";
import { useTranslation } from "react-i18next";

const CartIcon = () => {
    const { data: cart } = useCartQuery();
    const totalItems = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
    const { t } = useTranslation();

    return (
        <Link
            to="/cart"
            className="flex items-center gap-1 hover:bg-white/10 border border-transparent p-1.5 pt-3 rounded-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer text-white relative focus-visible:outline-none group"
        >
            <div className="relative flex items-end tracking-tighter shrink-0 mb-1">
                <ShoppingCart className="h-8 w-8 text-white relative transition-transform group-active:scale-90" />
                <span className="absolute -top-1 -right-1 left-2.5 h-6 w-6 rounded-full bg-[#f1c232] text-black text-sm shadow-sm font-extrabold text-center flex items-center justify-center scale-100 transition-transform">
                    {totalItems}
                </span>
            </div>
            <div className="hidden sm:flex self-end font-bold text-sm tracking-tighter">
                {t("nav.cart")}
            </div>
        </Link>
    );
};

export default CartIcon;
