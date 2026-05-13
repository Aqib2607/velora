import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import type { UserRole } from '@/store/useAuthStore';

interface ProtectedRouteProps {
    children: React.ReactNode;
    role?: UserRole;
}

/**
 * Guards routes requiring authentication and/or specific roles.
 * 
 * - Redirects unauthenticated users to /login with return URL.
 * - Redirects unauthorized users (wrong role) to homepage.
 * - Shows a loading spinner while auth state is rehydrating.
 */
const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading, hasRole } = useAuthStore();
    const location = useLocation();

    // While auth state is rehydrating from localStorage, show nothing to prevent flash
    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    // Not authenticated — redirect to login with return URL
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // Role check — admin has universal access, seller can access seller routes
    if (role && !hasRole(role)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
