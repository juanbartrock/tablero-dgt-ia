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
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`tab-button-${tab.id}`}
              onClick={() => handleTabChange(tab.id)}
              className={`
                ${activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              `}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="py-4">
        {tabs.map(tab => (
          <div 
            key={tab.id} 
            id={`tab-content-${tab.id}`} 
            className={activeTab === tab.id ? 'block' : 'hidden'}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
} 