'use client';

import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Task } from '@/app/lib/types';

interface UpcomingTasksListProps {
  tasks: Task[];
}

export default function UpcomingTasksList({ tasks }: UpcomingTasksListProps) {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'En Progreso': return 'bg-blue-100 text-blue-800';
      case 'Bloqueada': return 'bg-red-100 text-red-800';
      case 'Terminada': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
      <h3 className="text-lg font-semibold p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">Listado de Tareas</h3>
      {tasks.length === 0 ? (
        <p className="text-gray-500 p-4">No hay tareas activas.</p>
      ) : (
        <div className="overflow-auto h-56">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {tasks.map((task, index) => {
                const date = task.importantDate ? new Date(task.importantDate) : null;
                const formattedDate = date ? format(date, 'dd MMM yyyy', { locale: es }) : 'Sin fecha';
                
                return (
                  <tr 
                    key={String(task.id)} 
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-150`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{task.responsible}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formattedDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status || 'Pendiente')}`}>
                        {task.status || 'Pendiente'}
                      </span>
                    </td>
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