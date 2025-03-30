'use client';

import React from 'react';
import { Task } from '@/app/lib/types';

interface TasksTableProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string | number) => void;
}

export default function TasksTable({ tasks, onEdit, onDelete }: TasksTableProps) {
  // Ordenar tareas por ID (de mayor a menor)
  const sortedTasks = [...tasks].sort((a, b) => {
    // Si una tarea está terminada y la otra no, la terminada va al final
    if (a.status === 'Terminada' && b.status !== 'Terminada') {
      return 1; // a va después de b
    }
    if (a.status !== 'Terminada' && b.status === 'Terminada') {
      return -1; // a va antes de b
    }
    
    // Si ambas tareas tienen el mismo estado (ambas terminadas o ambas no terminadas),
    // mantener el orden por ID de mayor a menor
    const idA = Number(a.id);
    const idB = Number(b.id);
    return idB - idA; // Ordenar de mayor a menor
  });

  // Función para presentar responsables, posiblemente separados por comas
  const formatResponsibles = (responsibles: string) => {
    if (!responsibles) return '-';
    
    // Si los responsables están separados por comas, los presentamos como una lista
    if (responsibles.includes(',')) {
      const respList = responsibles.split(',').map(r => r.trim()).filter(r => r);
      return (
        <ul className="list-disc list-inside text-xs">
          {respList.map((resp, idx) => (
            <li key={idx}>{resp}</li>
          ))}
        </ul>
      );
    }
    
    // Si es un solo responsable, lo presentamos directamente
    return responsibles;
  };

  // Función para presentar áreas vinculadas como una lista formateada
  const formatLinkedAreas = (areas: string[]) => {
    if (!areas || areas.length === 0) return '-';
    
    if (areas.length === 1) return areas[0];
    
    return (
      <ul className="list-disc list-inside text-xs">
        {areas.map((area, idx) => (
          <li key={idx}>{area}</li>
        ))}
      </ul>
    );
  };

  return (
    <div className="mt-6 overflow-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Descripción</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comentario</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable(s)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Importante</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Áreas Vinculadas</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destacada</th>
            {(onEdit || onDelete) && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedTasks.length === 0 ? (
            <tr>
              <td colSpan={onEdit || onDelete ? 10 : 9} className="px-6 py-4 text-center text-sm text-gray-500">
                No hay tareas para mostrar.
              </td>
            </tr>
          ) : (
            sortedTasks.map((task) => (
              <tr key={String(task.id)}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{String(task.id)}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="break-words">{task.description || '-'}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {task.comment ? (
                    <div className="max-w-xs truncate" title={task.comment}>
                      {task.comment}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${task.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                      task.status === 'En Progreso' ? 'bg-blue-100 text-blue-800' : 
                      task.status === 'Bloqueada' ? 'bg-red-100 text-red-800' :
                      'bg-green-100 text-green-800'}`}>
                    {task.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {formatResponsibles(task.responsible)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${task.priority === 'Alta' ? 'bg-red-100 text-red-800' : 
                      task.priority === 'Media' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {task.importantDate || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatLinkedAreas(task.linkedAreas)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  {task.highlighted ? (
                    <span className="text-yellow-500 text-lg">★</span>
                  ) : (
                    <span className="text-gray-300 text-lg">☆</span>
                  )}
                </td>
                {(onEdit || onDelete) && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(task)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Editar
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(task.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 