import { useDealsFilterStore } from "@/store/useDealsFilterStore";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const CATEGORIES = ["Electronics", "Fashion", "Home & Kitchen", "Beauty", "Sports"];
const BRANDS = ["Sony", "Samsung", "Nike", "Apple", "Dell"];

const DealsFilterSidebar = () => {
    const {
        category,
        minPrice,
        maxPrice,
        minDiscount,
        brands,
        primeOnly,
        setCategory,
        setPriceRange,
        setMinDiscount,
        toggleBrand,
        setPrimeOnly,
        resetFilters
    } = useDealsFilterStore();

    return (
        <div className="hidden lg:flex flex-col w-64 flex-shrink-0 sticky top-20 h-[calc(100vh-80px)] overflow-y-auto pr-6 custom-scrollbar">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-[#131921]">Filters</h2>
                <button
                    onClick={resetFilters}
                    className="text-xs text-[#6a329f] hover:underline font-medium"
                >
                    Clear All
                </button>
            </div>

            <Accordion type="multiple" defaultValue={["category", "prime", "price", "discount", "brand"]} className="w-full space-y-4">

                {/* Prime Toggle */}
                <AccordionItem value="prime" className="border-none">
                    <div className="flex items-center justify-between bg-[#6a329f]/5 p-3 rounded-lg border border-[#6a329f]/20">
                        <Label htmlFor="prime-mode" className="flex items-center gap-1 cursor-pointer">
                            <span className="font-bold text-[#b4a7d6] text-sm">Velora</span>
                            <span className="font-bold text-[#6a329f] text-sm tracking-wide">PRIME</span>
                        </Label>
                        <Switch
                            id="prime-mode"
                            checked={primeOnly}
                            onCheckedChange={setPrimeOnly}
                        />
                    </div>
                </AccordionItem>

                <div className="h-px bg-gray-200 my-2" />

                {/* Categories */}
                <AccordionItem value="category" className="border-none">
                    <AccordionTrigger className="font-bold py-2 hover:no-underline hover:text-[#6a329f]">
                        Department
                    </AccordionTrigger>
                    <AccordionContent className="pt-2">
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => setCategory("All")}
                                className={`text-left text-sm transition-colors ${category === "All" ? "text-[#6a329f] font-bold" : "text-gray-600 hover:text-black"}`}
                            >
                                All Departments
                            </button>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`text-left text-sm transition-colors ${category === cat ? "text-[#6a329f] font-bold" : "text-gray-600 hover:text-black"}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Price */}
                <AccordionItem value="price" className="border-none">
                    <AccordionTrigger className="font-bold py-2 hover:no-underline hover:text-[#6a329f]">
                        Price Range
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 px-2">
                        <Slider
                            defaultValue={[0, 500]}
                            max={500}
                            step={10}
                            value={[minPrice || 0, maxPrice || 500]}
                            onValueChange={([min, max]) => setPriceRange(min, max)}
                            className="mb-6"
                        />
                        <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                            <span>${minPrice || 0}</span>
                            <span>${maxPrice || 500}+</span>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Deal Discount */}
                <AccordionItem value="discount" className="border-none">
                    <AccordionTrigger className="font-bold py-2 hover:no-underline hover:text-[#6a329f]">
                        Discount
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pl-1">
                        <div className="flex flex-col gap-3">
                            {[10, 25, 50, 70].map(discount => (
                                <div key={discount} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`discount-${discount}`}
                                        checked={minDiscount === discount}
                                        onCheckedChange={(checked) => setMinDiscount(checked ? discount : null)}
                                    />
                                    <Label
                                        htmlFor={`discount-${discount}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-gray-700"
                                    >
                                        {discount}% Off or more
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Brands */}
                <AccordionItem value="brand" className="border-none">
                    <AccordionTrigger className="font-bold py-2 hover:no-underline hover:text-[#6a329f]">
                        Brands
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pl-1">
                        <div className="flex flex-col gap-3">
                            {BRANDS.map(brand => (
                                <div key={brand} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`brand-${brand}`}
                                        checked={brands.includes(brand)}
                                        onCheckedChange={() => toggleBrand(brand)}
                                    />
                                    <Label
                                        htmlFor={`brand-${brand}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-gray-700"
                                    >
                                        {brand}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

            </Accordion>
        </div>
    );
};

export default DealsFilterSidebar;
