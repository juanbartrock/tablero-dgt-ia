'use client';

import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Task } from '@/app/lib/types';

interface UpcomingTasksListProps {
  tasks: Task[];
}

export default function UpcomingTasksList({ tasks }: UpcomingTasksListProps) {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Listado de Tareas</h3>
      {tasks.length === 0 ? (
        <p className="text-gray-500">No hay tareas activas.</p>
      ) : (
        <div className="overflow-auto h-56">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map((task) => {
                const date = task.importantDate ? new Date(task.importantDate) : null;
                const formattedDate = date ? format(date, 'dd MMM yyyy', { locale: es }) : 'Sin fecha';
                
                return (
                  <tr key={String(task.id)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.responsible}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formattedDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 