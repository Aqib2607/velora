import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CategoryDropdown from "./CategoryDropdown";
import { useTranslation } from "react-i18next";
import api from "@/utils/api";

const SearchBar = () => {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("all");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const wrapperRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.trim().length < 2) {
                setSuggestions([]);
                return;
            }
            try {
                const res = await api.get(`/search/autocomplete?q=${encodeURIComponent(query)}`);
                setSuggestions(res.data.data.products || []);
            } catch (err) {
                console.error(err);
            }
        };

        const debounce = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = (e?: React.FormEvent, searchQ?: string) => {
        if (e) e.preventDefault();
        const q = searchQ || query;
        if (q.trim()) {
            setShowSuggestions(false);
            navigate(`/search?q=${encodeURIComponent(q)}&category=${category}`);
        }
    };

    return (
        <form
            ref={wrapperRef}
            onSubmit={handleSearch}
            className="flex flex-1 h-11 rounded-xl overflow-visible bg-white focus-within:ring-2 focus-within:ring-[#f1c232] transition-shadow shadow-sm relative"
        >
            <div className="hidden sm:block">
                <CategoryDropdown value={category} onChange={setCategory} />
            </div>

            <div className="flex-1 relative">
                <input
                    type="text"
                    placeholder={t("nav.search") + " Velora"}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full h-full px-3 py-2 text-sm text-black outline-none rounded-l-xl sm:rounded-none"
                />
                
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden text-black text-sm">
                        {suggestions.map((s) => (
                            <div 
                                key={s.id} 
                                className="px-4 py-2 hover:bg-muted cursor-pointer truncate"
                                onClick={() => {
                                    setQuery(s.name);
                                    handleSearch(undefined, s.name);
                                }}
                            >
                                <Search className="inline-block h-3 w-3 mr-2 text-muted-foreground" />
                                {s.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button
                type="submit"
                className="bg-[#f1c232] hover:bg-[#d4a72c] px-5 flex items-center justify-center transition-colors focus:outline-none rounded-r-xl"
                aria-label="Submit search"
            >
                <Search className="h-5 w-5 text-black" />
            </button>
        </form>
    );
};

export default SearchBar;
