import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/useAuthStore";

const AccountMenu = () => {
    const { t } = useTranslation();
    const { isAuthenticated, user, clearAuth } = useAuthStore();
    const userName = user?.name || "Guest";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex flex-col items-start hover:bg-white/10 border border-transparent p-1.5 rounded-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer text-white leading-tight focus-visible:outline-none">
                    <span className="text-[10px] sm:text-xs text-white/70 font-normal">
                        {isAuthenticated ? `Hello, ${userName}` : "Hello, sign in"}
                    </span>
                    <div className="flex items-center">
                        <span className="text-sm font-bold">Account & Lists</span>
                        <ChevronDown className="h-3 w-3 text-gray-400 ml-1 mt-1" />
                    </div>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2">
                {!isAuthenticated && (
                    <div className="flex flex-col items-center p-2 mb-2">
                        <Link
                            to="/login"
                            className="w-full text-center bg-[#f0c14b] hover:bg-[#ddb347] border border-[#a88734] px-4 py-1.5 rounded-sm text-sm font-semibold text-gray-900 shadow-sm transition-colors"
                        >
                            Sign in
                        </Link>
                        <span className="text-xs mt-2 text-center text-gray-600">
                            New customer? <Link to="/register" className="text-blue-600 hover:text-red-500 hover:underline">Start here.</Link>
                        </span>
                    </div>
                )}
                <DropdownMenuSeparator />

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <DropdownMenuLabel className="font-bold">Your Lists</DropdownMenuLabel>
                        <DropdownMenuItem asChild className="cursor-pointer text-sm font-medium">
                            <Link to="/wishlist">Create a Wish List</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer text-sm font-medium">
                            <Link to="/wishlist">Discover Your Style</Link>
                        </DropdownMenuItem>
                    </div>
                    <div className="border-l pl-2">
                        <DropdownMenuLabel className="font-bold">Your Account</DropdownMenuLabel>
                        <DropdownMenuItem asChild className="cursor-pointer text-sm font-medium">
                            <Link to="/account">Account</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer text-sm font-medium">
                            <Link to="/info/orders">Orders</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer text-sm font-medium">
                            <Link to="/account/recommendations">Recommendations</Link>
                        </DropdownMenuItem>
                        {isAuthenticated && (
                            <DropdownMenuItem onClick={clearAuth} className="cursor-pointer text-sm font-medium focus:text-red-600">
                                Sign Out
                            </DropdownMenuItem>
                        )}
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default AccountMenu;
