import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentProfile, UserRole } from '../types/index.ts';

interface AuthContextType {
  user: User | null;
  studentProfile: StudentProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string, role?: UserRole) => Promise<User>;
  logout: () => void;
  isAdmin: boolean;
  isStudent: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('school_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('school_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          if (data.studentProfile) {
            setStudentProfile(data.studentProfile);
          }
        } else {
          // Token invalid or expired
          localStorage.removeItem('school_token');
          setToken(null);
          setUser(null);
          setStudentProfile(null);
        }
      } catch (err) {
        console.error('Auth verification failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string, role?: UserRole): Promise<User> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Kirishda xatolik yuz berdi');
    }

    localStorage.setItem('school_token', data.token);
    setToken(data.token);
    setUser(data.user);
    if (data.studentProfile) {
      setStudentProfile(data.studentProfile);
    }

    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('school_token');
    setToken(null);
    setUser(null);
    setStudentProfile(null);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isStudent = user?.role === 'STUDENT';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        studentProfile,
        token,
        isLoading,
        login,
        logout,
        isAdmin,
        isStudent,
        isAuthenticated,
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
