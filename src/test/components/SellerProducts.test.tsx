import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import SellerProducts from "@/pages/seller/SellerProducts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

const queryClient = new QueryClient();

vi.mock("@/hooks/useSellerDashboard", () => ({
    useSellerProducts: () => ({
        data: { data: [{ id: 1, name: "Test Product", price: 99.99, status: "published", created_at: "2026-01-01T00:00:00Z" }] },
        isLoading: false
    }),
    useDeleteProduct: () => ({ mutate: vi.fn(), isPending: false })
}));

vi.mock("@/store/useRegionStore", () => ({
    useRegionStore: () => ({ currency: "USD", locale: "en-US" })
}));

describe("SellerProducts Component", () => {
    it("renders the component and displays products", () => {
        render(
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <SellerProducts />
                </BrowserRouter>
            </QueryClientProvider>
        );
        expect(screen.getByText("Products")).toBeInTheDocument();
        expect(screen.getByText("Test Product")).toBeInTheDocument();
    });
});
