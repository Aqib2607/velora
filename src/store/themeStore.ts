import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeStore {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "light",
      toggleTheme: () =>
        set((state) => {
          const next = state.theme === "light" ? "dark" : "light";
          document.documentElement.classList.toggle("dark", next === "dark");
          return { theme: next };
        }),
    }),
    {
      name: "velora-theme",
      onRehydrateStorage: () => (state) => {
        if (state?.theme === "dark") {
          document.documentElement.classList.add("dark");
        }
      },
    }
  )
);
