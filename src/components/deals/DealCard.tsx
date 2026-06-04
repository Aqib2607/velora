import { DealItem } from "@/hooks/useDealsQuery";
import DealCountdown from "./DealCountdown";
import { useRegionStore } from "@/store/useRegionStore";
import { Star, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface DealCardProps {
    deal: DealItem;
}

const DealCard = ({ deal }: DealCardProps) => {
    const { currency } = useRegionStore();
    const { t, i18n } = useTranslation();
    const addItem = useCartStore((s) => s.addItem);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(i18n.language, {
            style: 'currency',
            currency: currency,
        }).format(amount); // Highly simplified for mock - ideally binds to actual rates
    };

    const handleAddToCart = () => {
        addItem({
            id: deal.id,
            name: deal.title,
            price: deal.discountPrice,
            originalPrice: deal.originalPrice,
            image: deal.image,
            category: deal.category,
            rating: deal.rating,
            reviewCount: deal.reviewsCount,
            seller: deal.brand,
            stock: deal.stockTotal,
            description: deal.title
        });
        toast.success(`${deal.title} added to cart!`);
    };

    const stockPercentage = Math.round((deal.stockRemaining / deal.stockTotal) * 100);

    return (
        <div className="group flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">

            {/* Image Block */}
            <div className="relative aspect-square overflow-hidden bg-gray-50 flex items-center justify-center p-4">
                <img
                    src={deal.image}
                    alt={deal.title}
                    className="object-contain w-full h-full mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                />

                {/* Deal Badge */}
                <div className="absolute top-3 left-3 bg-[#f1c232] text-[#5e4b11] font-extrabold text-xs px-2.5 py-1 rounded-full shadow-sm z-10 flex flex-col items-center">
                    <span>{deal.discountPercentage}%</span>
                    <span className="uppercase text-[9px] font-bold tracking-wider opacity-80 leading-none">OFF</span>
                </div>

                {deal.isLightningDeal && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white font-bold text-xs px-2 py-1 rounded-sm shadow-sm z-10 uppercase tracking-tighter animate-pulse">
                        Lightning Deal
                    </div>
                )}
            </div>

            {/* Content Block */}
            <div className="p-4 flex flex-col flex-1">
                <DealCountdown endTimeISO={deal.endTimeISO} />

                <h3 className="font-semibold text-gray-800 line-clamp-2 text-sm leading-snug mb-1">
                    {deal.title}
                </h3>

                <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${i < Math.floor(deal.rating) ? 'fill-[#f1c232] text-[#f1c232]' : 'fill-gray-200 text-gray-200'}`}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-blue-600 hover:underline cursor-pointer">
                        {deal.reviewsCount.toLocaleString()}
                    </span>
                </div>

                {/* Pricing */}
                <div className="flex items-baseline gap-2 mb-2 mt-auto">
                    <span className="text-xl font-extrabold text-[#6a329f]">
                        {formatCurrency(deal.discountPrice)}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                        {formatCurrency(deal.originalPrice)}
                    </span>
                </div>

                {/* Prime Tag */}
                {deal.isPrimeExclusive && (
                    <div className="flex items-center gap-1 mb-3">
                        <span className="text-xs italic font-bold text-[#b4a7d6]">Velora</span>
                        <span className="text-xs font-bold text-[#6a329f]">PRIME</span>
                    </div>
                )}

                {/* Stock Bar */}
                <div className="mb-4">
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1 overflow-hidden">
                        <div
                            className={`h-1.5 rounded-full ${stockPercentage < 20 ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${stockPercentage}%` }}
                        ></div>
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium">
                        {stockPercentage}% Claimed
                    </p>
                </div>

                {/* Action Button */}
                <button
                    onClick={handleAddToCart}
                    className="w-full bg-[#6a329f] hover:bg-[#562884] text-white py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 active:scale-95"
                >
                    <ShoppingCart className="w-4 h-4" />
                    {t('cart.add_to_cart', 'Add to Cart')}
                </button>
            </div>

        </div>
    );
};

export default DealCard;
