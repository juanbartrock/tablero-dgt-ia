'use client';

import React from 'react';

interface AlertNotificationProps {
  message: string;
}

export default function AlertNotification({ message }: AlertNotificationProps) {
  if (!message) return null;
  
  return (
    <div className="bg-red-600 text-white p-4 mb-6 rounded-md shadow-md border-2 border-red-800">
      <div className="container mx-auto flex items-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 mr-2 flex-shrink-0" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
        <div className="font-bold text-lg">{message}</div>
      </div>
    </div>
  );
} 