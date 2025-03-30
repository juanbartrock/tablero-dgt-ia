'use client';

import React from 'react';
import { Task } from '../../lib/types';

interface HighlightedTasksListProps {
  tasks: Task[];
}

export default function HighlightedTasksList({ tasks }: HighlightedTasksListProps) {
  if (tasks.length === 0) {
    return <p className="text-gray-500 bg-white rounded-lg shadow-sm p-4">No hay tareas destacadas.</p>;
  }

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-white rounded-lg shadow-md p-5 h-full border-l-4 border-yellow-400">
      <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">Tareas destacadas</h3>
      <ul className="space-y-3 max-h-[calc(100vh-22rem)] overflow-y-auto pr-2">
        {tasks.map((task) => (
          <li 
            key={String(task.id)} 
            className="border border-yellow-100 rounded-lg p-3 transition-all duration-200 hover:shadow-md hover:border-yellow-200 bg-white last:mb-0"
          >
            <div className="flex items-start">
              <span className="text-yellow-500 mr-2 text-lg transform rotate-0 hover:rotate-12 transition-transform duration-300">★</span>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="font-medium text-gray-800">{task.description}</p>
                  {task.status && (
                    <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)} ml-2`}>
                      {task.status}
                    </span>
                  )}
                </div>
                {task.comment && (
                  <p className="text-sm text-gray-600 mt-2 italic">{task.comment}</p>
                )}
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  {task.responsible && <span>Responsable: {task.responsible}</span>}
                  {task.importantDate && <span>Fecha: {task.importantDate}</span>}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function getStatusColor(status: string): string {
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
} 