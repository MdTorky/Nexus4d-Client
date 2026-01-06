import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (userData: any) => void;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('accessToken');
            if (storedToken) {
                api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                try {
                    const { data } = await api.get('/auth/me');
                    setUser(data);
                    setToken(storedToken);
                    // Update local storage with fresh data
                    localStorage.setItem('user', JSON.stringify(data));
                } catch (error) {
                    console.error('Session validation failed:', error);
                    // If token is invalid, clear auth
                    logout();
                }
            }
            setIsLoading(false);
        };
        checkAuth();
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

    const updateUser = (userData: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...userData };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, isLoading }}>
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
