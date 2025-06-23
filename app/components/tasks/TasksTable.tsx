'use client';

import React, { useState } from 'react';
import { Task } from '@/app/lib/types';

interface TasksTableProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string | number) => void;
  isLoading: boolean;
}

export default function TasksTable({ tasks, onEdit, onDelete, isLoading }: TasksTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 10;

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

  // Calcular el total de páginas
  const totalPages = Math.ceil(sortedTasks.length / tasksPerPage);
  
  // Obtener las tareas para la página actual
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = sortedTasks.slice(indexOfFirstTask, indexOfLastTask);

  // Función para cambiar de página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Funciones removidas para simplificar la tabla

  return (
    <div className={`mt-6 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">Descripción</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Comentario</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              {(onEdit || onDelete) && (
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentTasks.length === 0 && !isLoading ? (
              <tr>
                <td colSpan={onEdit || onDelete ? 5 : 4} className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay tareas para mostrar.
                </td>
              </tr>
            ) : isLoading ? (
              <tr>
                <td colSpan={onEdit || onDelete ? 5 : 4} className="px-6 py-4 text-center text-sm text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : (
              currentTasks.map((task) => (
                <tr key={String(task.id)}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{String(task.id)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="break-words flex items-center">
                      {task.highlighted && (
                        <span className="text-yellow-500 text-lg mr-2">★</span>
                      )}
                      {task.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {task.comment ? (
                      <div className="max-w-xs text-justify whitespace-normal break-words">
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
                  {(onEdit || onDelete) && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(task)}
                          disabled={isLoading}
                          className="text-indigo-600 hover:text-indigo-900 mr-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Editar
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(task.id)}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
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
      
      {/* Paginación */}
      {totalPages > 1 && (
        <div className={`mt-4 flex justify-between items-center ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="text-sm text-gray-700">
            Mostrando {indexOfFirstTask + 1}-{Math.min(indexOfLastTask, sortedTasks.length)} de {sortedTasks.length} tareas
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
              disabled={currentPage === 1 || isLoading}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 disabled:opacity-50"
            >
              Anterior
            </button>
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              // Mostrar solo 5 páginas alrededor de la página actual
              if (
                pageNumber === 1 || 
                pageNumber === totalPages || 
                (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
              ) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => paginate(pageNumber)}
                    disabled={isLoading}
                    className={`px-3 py-1 rounded-md text-sm ${
                      currentPage === pageNumber
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    } disabled:opacity-50`}
                  >
                    {pageNumber}
                  </button>
                );
              }
              // Mostrar elipsis para indicar páginas omitidas
              if (
                (pageNumber === 2 && currentPage > 4) ||
                (pageNumber === totalPages - 1 && currentPage < totalPages - 3)
              ) {
                return <span key={pageNumber} className="px-2 py-1">...</span>;
              }
              return null;
            })}
            <button
              onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
              disabled={currentPage === totalPages || isLoading}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 