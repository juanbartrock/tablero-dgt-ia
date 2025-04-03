'use client';
import * as React from 'react';
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
      <div className="bg-white rounded-xl p-6 h-full" data-testid="direct-highlighted-empty">
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-gray-500">No hay tareas destacadas actualmente.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl p-6 h-full" data-testid="direct-highlighted">
      <ul className="divide-y divide-gray-100 space-y-0">
        {tasks.map(task => (
          <li key={`highlighted-${task.id}`} className="py-2 group hover:bg-gray-50 rounded-lg transition-colors duration-200 px-3 -mx-3">
            <div className="flex items-start">
              <span className="text-yellow-500 text-lg mr-2 mt-1 transform group-hover:rotate-12 transition-transform duration-200">★</span>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-gray-900 truncate text-sm">{task.description}</p>
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
                
                {task.comment && (
                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{task.comment}</p>
                )}
                
                <div className="flex items-center mt-1 text-xs text-gray-500">
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

                  {task.fileUrl && (
                    <div className="flex items-center ml-4">
                      <button
                        onClick={() => window.open(task.fileUrl, '_blank')}
                        className="text-gray-500 hover:text-blue-500 transition-colors"
                        title="Descargar archivo adjunto"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                        </svg>
                      </button>
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