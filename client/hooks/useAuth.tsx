import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse, LoginData, CreateUserData } from '@shared/api';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (credentials: LoginData) => Promise<void>;
    signup: (userData: CreateUserData) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user && !!token;

    // Initialize auth state from localStorage
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('auth_token');

            if (storedToken) {
                try {
                    const response = await fetch('/api/auth/verify', {
                        headers: {
                            'Authorization': `Bearer ${storedToken}`
                        }
                    });

                    if (response.ok) {
                        try {
                            const data = await response.json();
                            if (data.success && data.user) {
                                setUser(data.user);
                                setToken(storedToken);
                            } else {
                                localStorage.removeItem('auth_token');
                            }
                        } catch (jsonError) {
                            console.error('JSON parsing error:', jsonError);
                            localStorage.removeItem('auth_token');
                        }
                    } else {
                        localStorage.removeItem('auth_token');
                    }
                } catch (error) {
                    console.error('Auth verification failed:', error);
                    localStorage.removeItem('auth_token');
                }
            }

            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (credentials: LoginData) => {
        try {
            console.log('Making login request to:', '/api/auth/login');
            console.log('Request payload:', credentials);

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            console.log('Login response status:', response.status);
            console.log('Login response status text:', response.statusText);
            console.log('Login response URL:', response.url);

            if (!response.ok) {
                // Handle non-2xx status codes
                let errorMessage = 'Login failed';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                    console.log('Error response data:', errorData);
                } catch (jsonError) {
                    // If JSON parsing fails, use status text
                    errorMessage = response.statusText || errorMessage;
                    console.log('Failed to parse error response as JSON:', jsonError);
                }
                throw new Error(errorMessage);
            }

            const data: AuthResponse = await response.json();
            console.log('Login response data:', data);

            if (!data.success) {
                throw new Error(data.message);
            }

            if (data.user && data.token) {
                setUser(data.user);
                setToken(data.token);
                localStorage.setItem('auth_token', data.token);
                console.log('Login successful, user set:', data.user);
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const signup = async (userData: CreateUserData) => {
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                // Handle non-2xx status codes
                let errorMessage = 'Signup failed';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    // If JSON parsing fails, use status text
                    errorMessage = response.statusText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const data: AuthResponse = await response.json();

            if (!data.success) {
                throw new Error(data.message);
            }

            if (data.user && data.token) {
                setUser(data.user);
                setToken(data.token);
                localStorage.setItem('auth_token', data.token);
            }
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_token');
    };

    const value = {
        user,
        token,
        login,
        signup,
        logout,
        isLoading,
        isAuthenticated,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}