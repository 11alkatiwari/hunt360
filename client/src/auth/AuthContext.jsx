import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { AuthContext } from './auth-context';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }

        setLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            console.log('Attempting login with:', credentials.identifier);
            const res = await api.post('https://hunt360new-h3i4.onrender.com/login', credentials);

            if (res.data.success) {
                const { user, token } = res.data;

                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('token', token);

                setUser(user);
                setIsAuthenticated(true);

                return { success: true };
            }

            return { success: false, error: res.data.error || 'Login failed' };
        } catch (err) {
            console.error('Login error:', err);
            let errorMessage = 'Network error. Please check your connection.';
            
            if (err.code === 'ECONNREFUSED') {
                errorMessage = 'Cannot connect to server. Please ensure the backend is running on port 8080.';
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            return {
                success: false,
                error: errorMessage,
            };
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (err) {
            console.error('Logout API failed:', err);
        }

        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setUser(null);
        setIsAuthenticated(false);
    };

    const signup = async (newUser) => {
        try {
            console.log('Attempting signup with:', newUser.email);
            const res = await api.post('https://hunt360new-h3i4.onrender.com/signup', newUser);
            
            if (res.data.success) {
                const { user, token } = res.data;
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('token', token);
                setUser(user);
                setIsAuthenticated(true);
                return { success: true };
            }
            
            return { success: false, error: res.data.error || 'Signup failed' };
        } catch (err) {
            console.error('Signup error:', err);
            let errorMessage = 'Network error. Please check your connection.';
            
            if (err.code === 'ECONNREFUSED') {
                errorMessage = 'Cannot connect to server. Please ensure the backend is running on port 8080.';
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            return {
                success: false,
                error: errorMessage,
            };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                loading,
                login,
                logout,
                signup,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
