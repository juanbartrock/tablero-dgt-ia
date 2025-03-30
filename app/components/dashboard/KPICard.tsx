'use client';

import React from 'react';

interface KPICardProps {
  title: string;
  value: number;
  color?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export default function KPICard({ title, value, color = 'primary', icon, onClick }: KPICardProps) {
  const getBackgroundColor = () => {
    switch(color) {
      case 'success': return 'bg-green-50 border-green-500';
      case 'warning': return 'bg-yellow-50 border-yellow-500';
      case 'info': return 'bg-blue-50 border-blue-500';
      case 'error': return 'bg-red-50 border-red-500';
      default: return 'bg-white border-gray-500';
    }
  };
  
  return (
    <div 
      className={`rounded-lg shadow p-4 border-l-4 ${getBackgroundColor()} h-full flex flex-col items-center justify-center transition hover:shadow-md cursor-pointer`}
      onClick={onClick}
    >
      <div className="w-full text-center">
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h2 className="text-3xl font-bold text-center">{value}</h2>
        {icon && <div className="text-2xl mt-2">{icon}</div>}
      </div>
    </div>
  );
} 