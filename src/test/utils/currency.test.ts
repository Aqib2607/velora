import { convertAndFormat, formatCurrency } from "@/utils/currency";
import { describe, it, expect } from "vitest";

describe("currency utilities", () => {
    it("formats USD currency correctly", () => {
        const formatted = formatCurrency(1000.5, "USD", "en-US");
        expect(formatted).toBe("$1,000.50");
    });

    it("formats EUR currency correctly", () => {
        const formatted = formatCurrency(1000.5, "EUR", "de-DE");
        // replace non-breaking spaces for reliable match
        expect(formatted.replace(/\u00a0/g, ' ')).toMatch(/1\.000,50\s?€/);
    });

    it("converts and formats currency", () => {
        const result = convertAndFormat(100, "EUR", "en-US");
        expect(typeof result).toBe("string");
    });
});
