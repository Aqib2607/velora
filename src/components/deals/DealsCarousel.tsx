import { DealItem } from "@/hooks/useDealsQuery";
import DealCard from "./DealCard";
import { Flame } from "lucide-react";

interface DealsCarouselProps {
    title: string;
    deals: DealItem[];
}

const DealsCarousel = ({ title, deals }: DealsCarouselProps) => {
    if (!deals || deals.length === 0) return null;

    return (
        <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center gap-2 mb-6">
                <div className="bg-[#f1c232]/20 p-2 rounded-full">
                    <Flame className="w-6 h-6 text-[#f1c232]" />
                </div>
                <h2 className="text-2xl font-black text-[#131921] tracking-tight">{title}</h2>
            </div>

            <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {deals.map((deal) => (
                    <div key={deal.id} className="min-w-[280px] max-w-[280px] snap-start shrink-0">
                        <DealCard deal={deal} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DealsCarousel;
