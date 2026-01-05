import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

interface User {
    _id: string;
    username: string;
    email: string;
    role: 'student' | 'tutor' | 'admin';
    avatar_url?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (userData: any) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in (could check localStorage for basic persistence, 
        // but typically we'd hit a /me endpoint or just wait for the first 401 to fail)
        // For now, let's just finish loading.
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        setIsLoading(false);
    }, []);

    const login = (data: { accessToken: string;[key: string]: any }) => {
        const { accessToken, ...userData } = data;
        setToken(accessToken);
        setUser(userData as User);
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        api.post('/auth/logout'); // Tell server to clear cookies
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
