import { Link } from "react-router-dom";
import DeliveryLocationComponent from "./DeliveryLocationComponent";
import SearchBar from "./SearchBar";
import LanguageDropdown from "./LanguageDropdown";
import AccountMenu from "./AccountMenu";
import CartIcon from "./CartIcon";
import SecondaryNav from "./SecondaryNav";
import ThemeToggle from "../ThemeToggle";
import NotificationBell from "./NotificationBell";
import { useTranslation } from "react-i18next";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useEffect, useState } from "react";

const Navbar = () => {
    const { t } = useTranslation();
    const scrollDirection = useScrollDirection();
    const [scrolledFromTop, setScrolledFromTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolledFromTop(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll(); // Check on mount
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // We translate the entire header up on scroll down. 
    // On mobile, we might only translate the top nav part - but the requirement says "Navbar hides when scrolling down" and "Mobile: hide only top nav but keep compact bar"
    // To achieve this cleanly across breakpoints, we'll apply the transform.

    // A trick for mobile: if we translate the whole header up by just the height of the top section, the bottom section stays visible.
    // However, translating -100% hides everything. Let's start with hiding everything on Desktop, and adjusting for mobile if needed.
    // simpler approach: just hide the Top Nav div and let the Secondary Nav slide up.

    // Instead of translating the whole header (which leaves a gap or hides the bottom), we will control the top nav's height/margin or use a -translate-y-full on the inner elements.
    // A better approach for sticky headers is to translate the whole header up by an exact amount, but that's brittle.
    // Let's translate the main header `-translate-y-full` on desktop `md:-translate-y-full`.
    // On mobile screens, the top part is large. Let's just `-translate-y-[calc(100%-40px)]` where 40px is the height of the secondary nav.

    return (
        <header className={`flex flex-col w-full z-50 sticky top-0 transition-transform duration-300 ease-in-out will-change-transform ${scrollDirection === 'down' ? '-translate-y-[calc(100%-40px)] md:-translate-y-full' : 'translate-y-0'} ${scrolledFromTop ? 'shadow-md' : ''}`}>
            {/* Top Nav */}
            <div className="bg-[#6a329f] dark:bg-gradient-to-r dark:from-[#6a329f] dark:to-[#5a2a8f] text-white flex flex-wrap lg:flex-nowrap items-center px-4 py-2 gap-4">

                {/* Left Section: Logo & Location */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    <Link
                        to="/"
                        className="flex items-center hover:bg-white/10 border border-transparent p-1.5 rounded-lg transition-all duration-200 hover:scale-[1.02] focus-visible:outline-none"
                        aria-label="Homepage"
                    >
                        <div className="flex items-center gap-1 shrink-0">
                            <div className="h-8 w-8 rounded-lg bg-white/95 dark:bg-white shadow-sm flex items-center justify-center">
                                <span className="text-sm font-bold text-[#6a329f] dark:text-[#131921]">V</span>
                            </div>
                            <span className="text-xl font-bold text-white tracking-widest hidden sm:block drop-shadow-md">Velora</span>
                            <span className="text-xs text-white/70 mt-3 self-start">.com</span>
                        </div>
                    </Link>

                    <div className="hidden md:block">
                        <DeliveryLocationComponent />
                    </div>
                </div>

                {/* Center Section: Search */}
                <div className="flex-1 min-w-0 order-3 w-full lg:order-none lg:w-auto mt-2 lg:mt-0">
                    <SearchBar />
                </div>

                {/* Right Section: Language, Account, Orders, Cart */}
                <div className="flex items-center gap-2 flex-shrink-0 ml-auto order-2 lg:order-none">
                    <ThemeToggle />

                    <div className="hidden lg:block">
                        <LanguageDropdown />
                    </div>

                    <AccountMenu />
                    
                    <NotificationBell />

                    <Link
                        to="/info/orders"
                        className="hidden md:flex flex-col items-start hover:bg-white/10 border border-transparent p-1.5 rounded-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer text-white leading-tight focus-visible:outline-none"
                    >
                        <span className="text-[10px] sm:text-xs text-white/80 font-normal">{t('nav.returns', 'Returns')}</span>
                        <span className="text-sm font-bold">& {t('nav.orders', 'Orders')}</span>
                    </Link>

                    <CartIcon />
                </div>
            </div>

            {/* Mobile Location row */}
            <div className="md:hidden bg-[#5a2a8f] dark:bg-[#5a2a8f]/90 text-white flex items-center px-4 py-2 border-b border-[#6a329f]/40">
                <DeliveryLocationComponent />
            </div>

            {/* Bottom Nav / Secondary Nav */}
            <SecondaryNav />
        </header>
    );
};

export default Navbar;
