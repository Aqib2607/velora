import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useAdminTenants, useAdminCommissions } from "@/hooks/useAdminDashboard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

vi.mock("@/lib/api", () => ({
    apiFetch: vi.fn().mockResolvedValue({ data: [] })
}));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
    },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("useAdminDashboard hooks", () => {
    it("useAdminTenants initializes loading state", () => {
        const { result } = renderHook(() => useAdminTenants(), { wrapper });
        expect(result.current.isLoading).toBe(true);
    });

    it("useAdminCommissions initializes loading state", () => {
        const { result } = renderHook(() => useAdminCommissions(), { wrapper });
        expect(result.current.isLoading).toBe(true);
    });
});
