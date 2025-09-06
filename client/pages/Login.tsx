import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { login } = useAuth();
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await login({ email, password });
            navigate("/dashboard");
        } catch (err: any) {
            setError(err.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="absolute top-4 right-4 bg-card rounded-full p-3 shadow-sm border border-border hover:bg-accent transition-colors"
            >
                {theme === "dark" ? (
                    <Sun className="w-5 h-5 text-foreground" />
                ) : (
                    <Moon className="w-5 h-5 text-foreground" />
                )}
            </button>

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <div className="w-4 h-4 bg-primary-foreground rounded-full"></div>
                        </div>
                        <span className="text-foreground font-aeonik text-2xl font-medium">
                            Promage
                        </span>
                    </div>
                    <h1 className="text-foreground font-aeonik text-3xl font-medium mb-2">
                        Welcome back
                    </h1>
                    <p className="text-muted-foreground font-aeonik text-sm">
                        Sign in to your account to continue
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-card rounded-3xl p-8 shadow-sm border border-border">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4">
                                <p className="text-destructive text-sm font-aeonik">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-foreground font-aeonik text-sm font-medium">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-background border-border rounded-xl h-12 px-4 font-aeonik"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-foreground font-aeonik text-sm font-medium">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-background border-border rounded-xl h-12 px-4 pr-12 font-aeonik"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-12 font-aeonik text-sm font-medium"
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-muted-foreground font-aeonik text-sm">
                            Don't have an account?{" "}
                            <Link
                                to="/signup"
                                className="text-primary hover:text-primary/80 font-medium"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}