import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@shared/api";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState<UserRole>("employee");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { signup } = useAuth();
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await signup({ email, password, name, role });
            navigate("/dashboard");
        } catch (err: any) {
            setError(err.message || "Signup failed");
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
                        Create your account
                    </h1>
                    <p className="text-muted-foreground font-aeonik text-sm">
                        Join us to get started with project management
                    </p>
                </div>

                {/* Signup Form */}
                <div className="bg-card rounded-3xl p-8 shadow-sm border border-border">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4">
                                <p className="text-destructive text-sm font-aeonik">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-foreground font-aeonik text-sm font-medium">
                                Full Name
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-background border-border rounded-xl h-12 px-4 font-aeonik"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

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
                            <Label htmlFor="role" className="text-foreground font-aeonik text-sm font-medium">
                                Role
                            </Label>
                            <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                                <SelectTrigger className="bg-background border-border rounded-xl h-12 px-4 font-aeonik">
                                    <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="employee">Employee</SelectItem>
                                    <SelectItem value="project_manager">Project Manager</SelectItem>
                                </SelectContent>
                            </Select>
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
                                    placeholder="Create a password"
                                    minLength={6}
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
                            <p className="text-muted-foreground text-xs font-aeonik">
                                Password must be at least 6 characters long
                            </p>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-12 font-aeonik text-sm font-medium"
                        >
                            {isLoading ? "Creating account..." : "Create Account"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-muted-foreground font-aeonik text-sm">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="text-primary hover:text-primary/80 font-medium"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}