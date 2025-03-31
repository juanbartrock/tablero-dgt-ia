'use client';
import React from 'react';

interface NewKPICardProps {
  title: string;
  value: number;
  color: 'success' | 'warning' | 'info' | 'error';
  onClick?: () => void;
}

export default function NewKPICard({ title, value, color, onClick }: NewKPICardProps) {
  // Función para determinar estilos según el color
  const getColorStyles = () => {
    switch (color) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-500',
          text: 'text-green-700',
          hover: 'hover:bg-green-100',
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-500',
          text: 'text-yellow-700',
          hover: 'hover:bg-yellow-100',
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-500',
          text: 'text-blue-700',
          hover: 'hover:bg-blue-100',
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-500',
          text: 'text-red-700',
          hover: 'hover:bg-red-100',
        };
      default:
        return {
          container: 'bg-gray-50 border-gray-500',
          text: 'text-gray-700',
          hover: 'hover:bg-gray-100',
        };
    }
  };

  const styles = getColorStyles();

  return (
    <div
      className={`
        rounded-lg shadow-md p-4 border-l-4 
        ${styles.container} ${styles.hover}
        cursor-pointer transition-all duration-200
        flex flex-col items-center justify-center h-full
      `}
      onClick={onClick}
    >
      <h3 className="text-gray-800 text-lg font-semibold mb-2">{title}</h3>
      <p className={`text-5xl font-bold ${styles.text}`}>{value}</p>
    </div>
  );
} 