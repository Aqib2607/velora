import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AdminTenants from "@/pages/admin/AdminTenants";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

// Mock the hooks
vi.mock("@/hooks/useAdminDashboard", () => ({
    useAdminTenants: () => ({
        data: { data: { data: [{ id: 1, name: "Test Tenant", slug: "test", plan: "standard", status: "active", created_at: "2026-01-01T00:00:00Z" }] } },
        isLoading: false
    }),
    useCreateTenant: () => ({ mutate: vi.fn(), isPending: false })
}));

describe("AdminTenants Component", () => {
    it("renders the component and displays tenants", () => {
        render(
            <QueryClientProvider client={queryClient}>
                <AdminTenants />
            </QueryClientProvider>
        );
        expect(screen.getByText("Tenant Management")).toBeInTheDocument();
        expect(screen.getByText("Test Tenant")).toBeInTheDocument();
    });
});
