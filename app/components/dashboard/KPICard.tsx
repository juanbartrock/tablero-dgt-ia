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
  const getStyles = () => {
    switch(color) {
      case 'success': return 'bg-gradient-to-br from-green-50 to-white border-green-500 text-green-700';
      case 'warning': return 'bg-gradient-to-br from-yellow-50 to-white border-yellow-500 text-yellow-700';
      case 'info': return 'bg-gradient-to-br from-blue-50 to-white border-blue-500 text-blue-700';
      case 'error': return 'bg-gradient-to-br from-red-50 to-white border-red-500 text-red-700';
      default: return 'bg-gradient-to-br from-blue-50 to-white border-primary text-primary';
    }
  };
  
  return (
    <div 
      className={`rounded-lg shadow-md p-5 border-l-4 ${getStyles()} h-full flex flex-row items-center justify-between transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px] cursor-pointer`}
      onClick={onClick}
    >
      {icon && <div className="text-3xl mr-4 opacity-80">{icon}</div>}
      <div className={`flex flex-col ${icon ? 'items-end' : 'items-center w-full'}`}>
        <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
        <h2 className="text-3xl font-bold">{value}</h2>
      </div>
    </div>
  );
} 