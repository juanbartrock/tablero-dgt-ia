'use client';
import React from 'react';
import { Task } from '../../lib/types';

interface NewHighlightedTasksListProps {
  tasks: Task[];
}

export default function NewHighlightedTasksList({ tasks }: NewHighlightedTasksListProps) {
  console.log('Renderizando NewHighlightedTasksList con tareas:', tasks);
  
  // Log adicional para verificar las tareas con archivos
  console.log('Todas las tareas destacadas:', tasks.map(task => ({
    id: task.id,
    description: task.description,
    fileUrl: task.fileUrl,
    fileName: task.fileName,
    highlighted: task.highlighted
  })));
  
  tasks.forEach(task => {
    if (task.fileUrl) {
      console.log(`Tarea ${task.id} tiene archivo adjunto:`, {
        fileUrl: task.fileUrl,
        fileName: task.fileName
      });
    }
  });
  
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
                  {task.fileUrl && (
                    <button
                      onClick={() => window.open(task.fileUrl, '_blank')}
                      className="text-gray-500 hover:text-blue-500 transition-colors"
                      title="Descargar archivo adjunto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                      </svg>
                    </button>
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