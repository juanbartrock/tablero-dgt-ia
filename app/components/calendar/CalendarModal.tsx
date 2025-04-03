'use client';

import React from 'react';
import { Task } from '@/app/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CalendarModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ task, isOpen, onClose }) => {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Detalles de la Tarea</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700">Descripción</h3>
            <p className="mt-1">{task.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-700">Estado</h3>
              <p className="mt-1">{task.status}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Prioridad</h3>
              <p className="mt-1">{task.priority}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-700">Fecha Importante</h3>
            <p className="mt-1">
              {task.importantDate
                ? format(new Date(task.importantDate), 'PPP', { locale: es })
                : 'No especificada'}
            </p>
          </div>

          {task.responsible && (
            <div>
              <h3 className="font-medium text-gray-700">Responsable</h3>
              <p className="mt-1">{task.responsible}</p>
            </div>
          )}

          {task.linkedAreas && task.linkedAreas.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-700">Áreas Relacionadas</h3>
              <div className="mt-1 flex flex-wrap gap-2">
                {task.linkedAreas.map((area, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {task.comment && (
            <div>
              <h3 className="font-medium text-gray-700">Comentarios</h3>
              <p className="mt-1">{task.comment}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarModal; 