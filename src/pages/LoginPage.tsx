import { Link } from "react-router-dom";
import { useState } from "react";

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3">
            <span className="text-xl font-bold text-primary-foreground">V</span>
          </div>
          <h1 className="text-2xl font-bold">{isRegister ? "Create Account" : "Welcome Back"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isRegister ? "Join Velora marketplace" : "Sign in to your account"}
          </p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {isRegister && (
            <input placeholder="Full Name" className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          )}
          <input type="email" placeholder="Email" className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <input type="password" placeholder="Password" className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <button className="w-full rounded-lg bg-primary px-6 py-2.5 font-medium text-primary-foreground hover:opacity-90 transition-opacity">
            {isRegister ? "Create Account" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={() => setIsRegister(!isRegister)} className="text-primary hover:underline font-medium">
            {isRegister ? "Sign In" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
