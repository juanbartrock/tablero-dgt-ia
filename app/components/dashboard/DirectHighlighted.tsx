'use client';
import React from 'react';
import { Task } from '../../lib/types';

interface DirectHighlightedProps {
  tasks: Task[];
}

export default function DirectHighlighted({ tasks }: DirectHighlightedProps) {
  // Componente muy directo, duro y simple
  console.log('DirectHighlighted rendering with tasks:', tasks);
  
  // Función para manejar los colores de los estados
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'Pendiente': 'bg-yellow-100 text-yellow-800',
      'En Progreso': 'bg-blue-100 text-blue-800',
      'Bloqueada': 'bg-red-100 text-red-800',
      'Terminada': 'bg-green-100 text-green-800'
    };
    
    return colors[status] || 'bg-gray-100 text-gray-800';
  };
  
  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm" data-testid="direct-highlighted-empty">
        <h3 className="text-lg font-bold text-yellow-600 mb-2">Tareas destacadas</h3>
        <p className="text-gray-500">No hay tareas destacadas.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm" data-testid="direct-highlighted">
      <h3 className="text-lg font-bold text-yellow-600 mb-3">Tareas destacadas</h3>
      
      <ul className="divide-y divide-gray-100">
        {tasks.map(task => (
          <li key={`highlighted-${task.id}`} className="py-3 flex items-start">
            <span className="text-yellow-500 mr-2">★</span>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-start justify-between">
                <p className="font-medium text-gray-900 truncate">{task.description}</p>
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
              
              {task.comment && (
                <p className="text-sm text-gray-500 mt-1">{task.comment}</p>
              )}
              
              <p className="text-xs text-gray-500 mt-1">
                Responsable: <span className="font-medium">{task.responsible}</span>
                {task.importantDate && (
                  <> | Fecha: <span className="font-medium">{task.importantDate}</span></>
                )}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 