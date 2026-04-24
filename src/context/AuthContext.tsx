import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { buildApiUrl } from '../utils/api';

export type UserRole = 'passenger' | 'driver' | null;

interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  vehicleType?: string;
  vehicleName?: string;
  vehicleNumber?: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    vehicleType?: string,
    vehicleName?: string,
    vehicleNumber?: string
  ) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  React.useEffect(() => {
    const savedUser = localStorage.getItem('go_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse user', error);
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(buildApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData || 'Login failed');
      }

      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('go_user', JSON.stringify(userData));
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    vehicleType?: string,
    vehicleName?: string,
    vehicleNumber?: string
  ) => {
    try {
      const response = await fetch(buildApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, vehicleType, vehicleName, vehicleNumber }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData || 'Registration failed');
      }

      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('go_user', JSON.stringify(userData));
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('go_user');
  };

  const updateUser = async (data: Partial<User>) => {
    if (user) {
      try {
        const response = await fetch(buildApiUrl(`/api/auth/${user._id}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error('Update failed');

        const updatedUser = await response.json();
        setUser(updatedUser);
        localStorage.setItem('go_user', JSON.stringify(updatedUser));
      } catch (error) {
        console.error("Update error:", error);
        throw error;
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
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
