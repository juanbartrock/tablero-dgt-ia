'use client';
import React from 'react';

interface DirectKPIProps {
  title: string;
  value: number;
  color: 'success' | 'warning' | 'info' | 'error';
  onClick?: () => void;
}

export default function DirectKPI({ title, value, color, onClick }: DirectKPIProps) {
  // Colores directos sin lógica compleja
  const colorMap = {
    success: 'bg-green-100 border-green-500 text-green-700',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    info: 'bg-blue-100 border-blue-500 text-blue-700',
    error: 'bg-red-100 border-red-500 text-red-700'
  };

  // Usar el color directamente desde el mapa
  const colorClasses = colorMap[color] || 'bg-gray-100 border-gray-500 text-gray-700';

  return (
    <div
      className={`${colorClasses} rounded-lg shadow-md p-4 border-l-4 flex flex-col items-center justify-center cursor-pointer`}
      onClick={onClick}
      data-testid={`kpi-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="text-lg font-medium">{title}</div>
      <div className="text-4xl font-bold mt-2">{value}</div>
    </div>
  );
} 