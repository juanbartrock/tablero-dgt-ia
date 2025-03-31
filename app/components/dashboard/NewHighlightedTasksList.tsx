'use client';
import React from 'react';
import { Task } from '../../lib/types';

interface NewHighlightedTasksListProps {
  tasks: Task[];
}

export default function NewHighlightedTasksList({ tasks }: NewHighlightedTasksListProps) {
  console.log('Renderizando NewHighlightedTasksList con tareas:', tasks);
  
  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-white border rounded-lg shadow-sm p-5 h-full">
        <h3 className="text-xl font-bold text-yellow-600 mb-4">Tareas destacadas</h3>
        <p className="text-gray-500 italic">No hay tareas destacadas.</p>
      </div>
    );
  }

  // Función para obtener color según estado
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'En Progreso':
        return 'bg-blue-100 text-blue-800';
      case 'Bloqueada':
        return 'bg-red-100 text-red-800';
      case 'Terminada':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm p-5 h-full">
      <h3 className="text-xl font-bold text-yellow-600 mb-4">Tareas destacadas</h3>
      <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-250px)]">
        {tasks.map(task => (
          <div 
            key={`highlighted-${task.id}`} 
            className="border border-yellow-200 rounded p-3 bg-yellow-50 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start gap-2">
              <span className="text-yellow-500 mt-1">★</span>
              <div className="flex-1">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-medium text-gray-800">{task.description}</h4>
                  <span className={`px-2 py-1 text-xs leading-4 font-medium rounded-full ${getStatusBadgeColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
                
                {task.comment && (
                  <p className="text-sm text-gray-600 mt-1 italic line-clamp-2">
                    {task.comment}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                  <span>Responsable: <strong>{task.responsible}</strong></span>
                  {task.importantDate && (
                    <span>Fecha: <strong>{task.importantDate}</strong></span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 