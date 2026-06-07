import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo'));
    if (userInfo) {
      setUser(userInfo);
    }
    setLoading(false);
  }, []);

  const login = async (email, password, remember = false) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.removeItem('userInfo');
      sessionStorage.removeItem('userInfo');
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      if (error.response?.data?.needsVerification) {
        throw { needsVerification: true, email };
      }
      throw error;
    }
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    return data;
  };

  const verifyOTP = async (email, otp, remember = true) => {
    const { data } = await api.post('/auth/verify-otp', { email, otp });
    localStorage.removeItem('userInfo');
    sessionStorage.removeItem('userInfo');
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const googleLogin = async (credential, remember = true) => {
    const { data } = await api.post('/auth/google', { credential });
    localStorage.removeItem('userInfo');
    sessionStorage.removeItem('userInfo');
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    sessionStorage.removeItem('userInfo');
    setUser(null);
  };

  const updateUser = (data) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo'));
    const newUserInfo = { ...userInfo, ...data };
    const storage = localStorage.getItem('userInfo') ? localStorage : sessionStorage;
    storage.setItem('userInfo', JSON.stringify(newUserInfo));
    setUser(newUserInfo);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyOTP, googleLogin, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
