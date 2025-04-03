'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar si hay una sesión activa al cargar
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/auth/validate-session', {
          method: 'GET',
          credentials: 'include', // Importante para incluir las cookies
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error('Error al verificar sesión:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante para incluir las cookies
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Error en la autenticación');
      }

      const data = await response.json();
      setUser(data.user);
      
      // Disparar evento de nuevo login
      localStorage.setItem('lastLogin', new Date().toISOString());
      
      return true;
    } catch (error) {
      console.error('Error durante el login:', error);
      setError('Error al conectar con el servidor');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Importante para incluir las cookies
      });
      setUser(null);
    } catch (err) {
      console.error('Error en logout:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}; 