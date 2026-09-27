import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('yatralok_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('yatralok_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.error('Session expired or invalid token:', err);
          logout(false);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, user } = res.data;
        localStorage.setItem('yatralok_token', token);
        localStorage.setItem('yatralok_user', JSON.stringify(user));
        setToken(token);
        setUser(user);
        toast.success(`Welcome back, ${user.name}!`);
        return { success: true, user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      if (err.response?.data?.requiresVerification) {
        return {
          success: false,
          requiresVerification: true,
          email: err.response.data.email,
          devOtp: err.response.data.devOtp,
          message: msg,
        };
      }
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.success) {
        toast.success('Registration initiated! Please enter the OTP sent to your email.');
        return {
          success: true,
          email: res.data.data.email,
          devOtp: res.data.data.devOtp,
        };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      if (res.data.success) {
        const { token, user } = res.data;
        localStorage.setItem('yatralok_token', token);
        localStorage.setItem('yatralok_user', JSON.stringify(user));
        setToken(token);
        setUser(user);
        toast.success('Account successfully verified! Welcome aboard.');
        return { success: true, user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'OTP verification failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const resendOTP = async (email) => {
    try {
      const res = await api.post('/auth/resend-otp', { email });
      if (res.data.success) {
        toast.success('A new OTP has been dispatched to your email.');
        return { success: true, devOtp: res.data.devOtp };
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not resend OTP');
      return { success: false };
    }
  };

  const logout = (showToast = true) => {
    localStorage.removeItem('yatralok_token');
    localStorage.removeItem('yatralok_user');
    setToken(null);
    setUser(null);
    if (showToast) {
      toast.success('Logged out successfully.');
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('yatralok_user', JSON.stringify(updatedUser));
  };

  const toggleFavorite = async (destId) => {
    if (!user) {
      toast.error('Please login to save destinations.');
      return false;
    }
    try {
      const res = await api.post(`/users/favorites/${destId}`);
      if (res.data.success) {
        setUser((prev) => ({
          ...prev,
          favorites: res.data.favorites,
        }));
        toast.success(res.data.message);
        return res.data.isFavorite;
      }
    } catch (err) {
      toast.error('Could not update favorites');
    }
    return false;
  };

  const isFavorite = (destId) => {
    if (!user || !user.favorites) return false;
    return user.favorites.some((fav) => {
      if (typeof fav === 'string') return fav === destId;
      return fav._id === destId;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        verifyOTP,
        resendOTP,
        logout,
        updateUser,
        toggleFavorite,
        isFavorite,
      }}
    >
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
