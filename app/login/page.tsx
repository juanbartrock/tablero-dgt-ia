'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth/auth-context';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('Por favor, complete todos los campos');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await login(username, password);
      
      if (success) {
        router.push('/');
      }
    } catch (err) {
      console.error('Error en login:', err);
      setError('Ocurrió un error al iniciar sesión. Por favor, intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-primary to-info bg-clip-text text-transparent drop-shadow-sm">
            DGT - Área Inteligencia Artificial
          </h2>
          <p className="mt-2 text-gray-600">Iniciar Sesión</p>
        </div>
        
        <div className="rounded-lg bg-white p-8 shadow-md">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-gradient-to-r from-primary to-info px-4 py-2 text-white shadow-sm hover:opacity-90 focus:outline-none disabled:opacity-70"
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Usuario por defecto: admin</p>
            <p>Contraseña por defecto: admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
} 