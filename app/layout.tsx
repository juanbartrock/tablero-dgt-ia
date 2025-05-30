import type { Metadata } from 'next';
import React from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './lib/auth/auth-context';
import PulsingTitle from './components/PulsingTitle';
import { setupDatabase } from './lib/db/setup';

const inter = Inter({ subsets: ['latin'] });

// Inicializar la base de datos al cargar la aplicación
try {
  setupDatabase();
} catch (error) {
  console.error('Error al inicializar la aplicación:', error);
}

export const metadata: Metadata = {
  title: 'DGT - Área de Inteligencia Artificial',
  description: 'Visualización de tareas para la Dirección del Área',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* Metaetiquetas y recursos adicionales */}
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <main className="container mx-auto py-4 px-4 max-w-7xl">
            <div className="text-center mb-4">
              <PulsingTitle 
                titleText="DGT - Área Inteligencia Artificial"
                className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-primary to-info bg-clip-text text-transparent drop-shadow-sm tracking-tight py-1"
              />
              <div className="h-1 w-32 bg-gradient-to-r from-primary to-info rounded-full mx-auto"></div>
            </div>
            
            {/* Zona para la notificación importante */}
            <div id="notification-container"></div>
            
            {children}
          </main>
        </AuthProvider>
        
        {/* Script para manejar las notificaciones - cargado al final del body para asegurar la disponibilidad del DOM */}
        <script src="/js/notification-handler.js"></script>
      </body>
    </html>
  );
} 