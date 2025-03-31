'use client';
import React from 'react';
import { Task } from '../../lib/types';

interface DirectHighlightedProps {
  tasks: Task[];
}

export default function DirectHighlighted({ tasks }: DirectHighlightedProps) {
  // Mantener los logs
  console.log('DirectHighlighted rendering with tasks:', tasks);
  console.log('DirectHighlighted - IDs de tareas destacadas:', tasks?.map(t => t.id).join(', '));
  console.log('DirectHighlighted - Número de tareas destacadas:', tasks?.length || 0);
  console.log('DirectHighlighted - Propiedad highlighted en tareas:', tasks?.map(t => `${t.id}:${t.highlighted}`).join(', '));
  
  // Función para manejar los colores de los estados con mejores combinaciones
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'Pendiente': 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      'En Progreso': 'bg-blue-100 text-blue-800 border border-blue-300',
      'Bloqueada': 'bg-red-100 text-red-800 border border-red-300',
      'Terminada': 'bg-green-100 text-green-800 border border-green-300'
    };
    
    return colors[status] || 'bg-gray-100 text-gray-800 border border-gray-300';
  };
  
  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-xl p-6 shadow-lg h-full" data-testid="direct-highlighted-empty">
        <h3 className="text-xl font-bold text-yellow-600 mb-3 flex items-center">
          <span className="text-2xl mr-2">🌟</span> Tareas destacadas
        </h3>
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-gray-500">No hay tareas destacadas actualmente.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-xl p-6 shadow-lg h-full" data-testid="direct-highlighted">
      <h3 className="text-xl font-bold text-yellow-600 mb-4 flex items-center">
        <span className="text-2xl mr-2">🌟</span> Tareas destacadas
      </h3>
      
      <ul className="divide-y divide-amber-100 space-y-1">
        {tasks.map(task => (
          <li key={`highlighted-${task.id}`} className="py-3 group hover:bg-yellow-50 rounded-lg transition-colors duration-200 px-3 -mx-3">
            <div className="flex items-start">
              <span className="text-yellow-500 text-xl mr-3 mt-1 transform group-hover:rotate-12 transition-transform duration-200">★</span>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-gray-900 truncate">{task.description}</p>
                  <span className={`ml-2 px-3 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
                
                {task.comment && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.comment}</p>
                )}
                
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <div className="flex items-center">
                    <span className="mr-1">👤</span>
                    <span className="font-medium">{task.responsible}</span>
                  </div>
                  
                  {task.importantDate && (
                    <div className="flex items-center ml-4">
                      <span className="mr-1">📅</span>
                      <span className="font-medium">{task.importantDate}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 