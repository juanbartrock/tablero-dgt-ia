'use client';
import React from 'react';

interface DirectKPIProps {
  title: string;
  value: number;
  color: 'success' | 'warning' | 'info' | 'error';
  onClick?: () => void;
}

export default function DirectKPI({ title, value, color, onClick }: DirectKPIProps) {
  // Colores con gradientes y mejores combinaciones
  const colorMap = {
    success: 'bg-gradient-to-br from-green-50 to-green-100 border-green-500 text-green-700',
    warning: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-500 text-yellow-700',
    info: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-500 text-blue-700',
    error: 'bg-gradient-to-br from-red-50 to-red-100 border-red-500 text-red-700'
  };

  // Iconos para cada tipo de KPI
  const iconMap = {
    'Total': '📊',
    'Pendientes': '⏳',
    'En Progreso': '🔄',
    'Detenida': '⚠️'
  };

  // Usar el color directamente desde el mapa
  const colorClasses = colorMap[color] || 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-500 text-gray-700';
  const icon = (iconMap as Record<string, string>)[title] || '📌';

  return (
    <div
      className={`${colorClasses} rounded-xl shadow-lg p-5 border-l-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px]`}
      onClick={onClick}
      data-testid={`kpi-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-lg font-medium">{title}</div>
      <div className="text-4xl font-bold mt-2">{value}</div>
    </div>
  );
} 