import { useState, useEffect } from "react";
import { ProductOption, ProductVariant } from "@/types/domain";

interface VariantSelectorProps {
  options: ProductOption[];
  variants: ProductVariant[];
  onVariantChange: (variant: ProductVariant | null) => void;
}

export default function VariantSelector({ options, variants, onVariantChange }: VariantSelectorProps) {
  const [selected, setSelected] = useState<Record<number, number>>({});

  useEffect(() => {
    if (options.length > 0 && Object.keys(selected).length === 0) {
      const initial: Record<number, number> = {};
      options.forEach(opt => {
        if (opt.values && opt.values.length > 0) {
          initial[opt.id] = opt.values[0].id;
        }
      });
      setSelected(initial);
    }
  }, [options]);

  useEffect(() => {
    if (variants.length === 0) return;
    
    const matchingVariant = variants.find(v => {
      if (!v.optionValues) return false;
      const selectedValues = Object.values(selected);
      // Ensure the variant has all the selected values
      return selectedValues.every(valId => 
        v.optionValues!.some(ov => ov.id === valId)
      );
    });
    
    onVariantChange(matchingVariant || null);
  }, [selected, variants, onVariantChange]);

  if (!options || options.length === 0) return null;

  return (
    <div className="space-y-6 mb-8">
      {options.map(option => (
        <div key={option.id}>
          <h3 className="text-sm font-medium mb-3">{option.name}</h3>
          <div className="flex flex-wrap gap-2">
            {option.values?.map(val => (
              <button
                key={val.id}
                onClick={() => setSelected({ ...selected, [option.id]: val.id })}
                className={`px-4 py-2 text-sm rounded-xl border transition-all ${
                  selected[option.id] === val.id 
                    ? "border-foreground bg-foreground text-background" 
                    : "border-border hover:border-foreground/50 text-foreground"
                }`}
              >
                {val.value}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
