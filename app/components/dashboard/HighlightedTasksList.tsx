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
    <div className="bg-white rounded-lg shadow-sm p-4 h-full border-l-4 border-yellow-400">
      <h3 className="text-lg font-semibold mb-3 text-center">Tareas destacadas</h3>
      <ul className="space-y-2 max-h-[calc(100vh-22rem)] overflow-y-auto pr-2">
        {tasks.map((task) => (
          <li key={String(task.id)} className="border-b border-blue-50 pb-2 last:border-b-0">
            <div className="flex items-start">
              <span className="text-yellow-500 mr-2 text-lg">★</span>
              <div className="flex-1">
                <p className="font-medium">{task.description}</p>
                {task.comment && (
                  <p className="text-sm text-gray-600 mt-1">{task.comment}</p>
                )}
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