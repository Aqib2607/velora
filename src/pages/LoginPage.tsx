import { useState } from "react";
import { useLogin, useRegister } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Sparkles, Shield, Zap, Globe2 } from "lucide-react";

const LoginPage = () => {
    const [isRegister, setIsRegister] = useState(false);

    // ── Form state ─────────────────────────────────────────
    const [name,                 setName]                 = useState("");
    const [email,                setEmail]                = useState("");
    const [password,             setPassword]             = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [showPassword,         setShowPassword]         = useState(false);

    const login    = useLogin();
    const register = useRegister();

    const isPending = login.isPending || register.isPending;

    // ── Submit ─────────────────────────────────────────────
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isRegister) {
            register.mutate({ name, email, password, password_confirmation: passwordConfirmation });
        } else {
            login.mutate({ email, password });
        }
    };

    const features = [
      { icon: Shield, text: "Secure & encrypted" },
      { icon: Zap, text: "Lightning fast" },
      { icon: Globe2, text: "Global marketplace" },
    ];

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-0 overflow-hidden rounded-3xl shadow-lg border border-border/50">
            
            {/* ── Left: Visual Panel ────────────────── */}
            <div className="hidden lg:flex flex-col justify-between bg-foreground p-12 text-background relative overflow-hidden">
              {/* Animated orbs */}
              <motion.div
                className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 8, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.05, 0.15] }}
                transition={{ duration: 10, repeat: Infinity }}
              />
              
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-background/15 backdrop-blur-sm flex items-center justify-center mb-8">
                  <span className="text-xl font-black">V</span>
                </div>
                <h2 className="font-display text-4xl font-bold mb-4 leading-tight">
                  {isRegister ? "Join the\nPremium\nMarketplace" : "Welcome\nBack to\nVelora"}
                </h2>
                <p className="text-background/60 text-lg leading-relaxed max-w-xs">
                  {isRegister
                    ? "Create your account and start your premium commerce journey."
                    : "Sign in to continue your shopping experience."
                  }
                </p>
              </div>

              <div className="relative z-10 space-y-4">
                {features.map((f) => (
                  <div key={f.text} className="flex items-center gap-3 text-background/70">
                    <div className="h-8 w-8 rounded-xl bg-background/10 flex items-center justify-center">
                      <f.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{f.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Form ───────────────────────── */}
            <div className="bg-card p-8 md:p-12 lg:p-14">

                {/* Logo + heading (mobile) */}
                <div className="text-center lg:text-left mb-10">
                    <div className="h-12 w-12 rounded-2xl bg-foreground flex items-center justify-center mx-auto lg:mx-0 mb-4 shadow-sm">
                        <span className="text-xl font-bold text-background">V</span>
                    </div>
                    <h1 className="font-display text-3xl font-bold mb-2">
                        {isRegister ? "Create Account" : "Welcome Back"}
                    </h1>
                    <p className="text-muted-foreground">
                        {isRegister ? "Join Velora premium marketplace" : "Sign in to your account"}
                    </p>
                </div>

                {/* Form */}
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <AnimatePresence mode="wait">
                    {isRegister && (
                        <motion.div
                          key="name-field"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <label htmlFor="name" className="block text-sm font-medium mb-2">Full Name</label>
                          <input
                              id="name"
                              type="text"
                              placeholder="John Doe"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                              className="w-full rounded-xl border border-input bg-background px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/50 transition-all"
                          />
                        </motion.div>
                    )}
                    </AnimatePresence>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded-xl border border-input bg-background px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/50 transition-all"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
                        <div className="relative">
                          <input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              minLength={8}
                              className="w-full rounded-xl border border-input bg-background px-4 py-3.5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/50 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                    {isRegister && (
                        <motion.div
                          key="confirm-field"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <label htmlFor="password_confirmation" className="block text-sm font-medium mb-2">Confirm Password</label>
                          <input
                              id="password_confirmation"
                              type="password"
                              placeholder="••••••••"
                              value={passwordConfirmation}
                              onChange={(e) => setPasswordConfirmation(e.target.value)}
                              required
                              className="w-full rounded-xl border border-input bg-background px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/50 transition-all"
                          />
                        </motion.div>
                    )}
                    </AnimatePresence>

                    <motion.button
                        type="submit"
                        disabled={isPending}
                        className="w-full rounded-xl bg-foreground px-6 py-4 font-semibold text-background hover:-translate-y-0.5 shadow-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 relative overflow-hidden"
                        whileHover={{ scale: isPending ? 1 : 1.01 }}
                        whileTap={{ scale: isPending ? 1 : 0.99 }}
                    >
                        {isPending && (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                        )}
                        {isPending
                            ? (isRegister ? "Creating account…" : "Signing in…")
                            : (isRegister ? "Create Account" : "Sign In")}
                    </motion.button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-8">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground font-medium">or continue with</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                {/* Social (visual only) */}
                <div className="grid grid-cols-3 gap-3">
                  {["Google", "Apple", "GitHub"].map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      className="py-3 rounded-xl border border-border hover:bg-muted/50 transition-all text-sm font-medium"
                    >
                      {provider}
                    </button>
                  ))}
                </div>

                {/* Toggle */}
                <p className="text-center text-sm text-muted-foreground mt-8">
                    {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                        type="button"
                        onClick={() => setIsRegister(!isRegister)}
                        className="text-foreground font-semibold underline transition-colors hover:opacity-80"
                    >
                        {isRegister ? "Sign In" : "Register"}
                    </button>
                </p>
            </div>
          </div>
        </div>
    );
};

export default LoginPage;
