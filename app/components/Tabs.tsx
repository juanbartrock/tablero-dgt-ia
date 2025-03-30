'use client';

import React, { useState, useEffect } from 'react';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTabId?: string;
}

export default function Tabs({ tabs, defaultTabId }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTabId || (tabs.length > 0 ? tabs[0].id : ''));

  // Manejar cambios en la URL hash para la navegación
  useEffect(() => {
    // Verificar si hay un hash en la URL que coincida con alguna pestaña
    const hash = window.location.hash.substring(1);
    if (hash && tabs.some(tab => tab.id === hash)) {
      setActiveTab(hash);
    }
  }, [tabs]);

  // Función para manejar el cambio de pestaña
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    
    // Actualizar la URL con un hash para permitir enlaces directos
    window.location.hash = tabId;
  };

  return (
    <div className="rounded-lg overflow-hidden shadow-sm bg-white">
      <div className="border-b border-gray-200 bg-gradient-to-r from-slate-50 to-white">
        <nav className="-mb-px flex space-x-1 px-4" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`tab-button-${tab.id}`}
              onClick={() => handleTabChange(tab.id)}
              className={`
                ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary to-info text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'}
                whitespace-nowrap py-3 px-4 rounded-t-lg font-medium text-sm transition-all duration-200 ease-in-out flex items-center
              `}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="py-6 px-4 transition-all duration-300 ease-in-out">
        {tabs.map(tab => (
          <div 
            key={tab.id} 
            id={`tab-content-${tab.id}`} 
            className={`transform transition-opacity duration-300 ${activeTab === tab.id ? 'opacity-100' : 'opacity-0 hidden'}`}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
} 