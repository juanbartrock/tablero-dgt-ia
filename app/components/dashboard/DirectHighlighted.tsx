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
  
  // Función para obtener el ícono según el estado
  const getStatusIcon = (status: string): string => {
    const icons: Record<string, string> = {
      'Pendiente': '🕓',
      'En Progreso': '⚙️',
      'Bloqueada': '⛔',
      'Terminada': '✅'
    };
    return icons[status] || '📋';
  };

  // Función para obtener los colores de estado
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'Pendiente': 'bg-yellow-50 text-yellow-800 border-yellow-200',
      'En Progreso': 'bg-blue-50 text-blue-800 border-blue-200',
      'Bloqueada': 'bg-red-50 text-red-800 border-red-200',
      'Terminada': 'bg-green-50 text-green-800 border-green-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-800 border-gray-200';
  };

  // Función para obtener las iniciales del responsable
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Función para obtener un color basado en el nombre
  const getAvatarColor = (name: string): string => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 h-full border border-gray-100" data-testid="direct-highlighted-empty">
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <div className="text-5xl mb-4">⭐</div>
          <p className="text-gray-500">No hay tareas destacadas actualmente.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
      <div className="grid gap-4">
        {tasks.map((task) => (
          <div 
            key={String(task.id)}
            className={`relative p-4 rounded-lg border ${getStatusColor(task.status)} hover:shadow-md transition-all duration-200`}
          >
            {/* Separador superior sutil */}
            <div className="absolute top-0 left-4 right-4 h-px bg-gray-200"></div>
            
            <div className="flex items-start gap-3">
              {/* Ícono de estado */}
              <div className="flex-shrink-0 text-lg" title={task.status}>
                {getStatusIcon(task.status)}
              </div>

              <div className="flex-1 min-w-0">
                {/* Título y estado */}
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900 line-clamp-2">
                    {task.description}
                  </h4>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>

                {/* Descripción si existe */}
                {task.comment && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {task.comment}
                  </p>
                )}

                {/* Metadatos */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  {/* Avatar del responsable */}
                  <div className="flex items-center gap-2">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full ${getAvatarColor(task.responsible)} flex items-center justify-center text-xs font-medium`}>
                      {getInitials(task.responsible)}
                    </div>
                    <span>{task.responsible}</span>
                  </div>

                  {/* Fecha importante si existe */}
                  {task.importantDate && (
                    <div className="flex items-center gap-1">
                      <span>📅</span>
                      <span>{new Date(task.importantDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  {/* Prioridad */}
                  {task.priority && (
                    <div className="flex items-center gap-1">
                      <span>🎯</span>
                      <span>{task.priority}</span>
                    </div>
                  )}

                  {/* Archivo adjunto si existe */}
                  {task.fileUrl && (
                    <div className="flex items-center gap-1">
                      <span>📎</span>
                      <span className="text-blue-600 hover:underline cursor-pointer">
                        {task.fileName || 'Archivo adjunto'}
                      </span>
                    </div>
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