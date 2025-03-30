'use client';

import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority } from '@/app/lib/types';

interface TaskFormProps {
  task?: Task;
  onSubmit: (task: Omit<Task, 'id'> | Task) => Promise<void>;
  onCancel: () => void;
}

export default function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState<Omit<Task, 'id'>>({
    description: task?.description || '',
    status: task?.status || 'Pendiente',
    responsible: task?.responsible || '',
    linkedAreas: task?.linkedAreas || [],
    importantDate: task?.importantDate || '',
    priority: task?.priority || 'Media',
    highlighted: task?.highlighted || false,
    comment: task?.comment || ''
  });
  
  const [linkedAreaInput, setLinkedAreaInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleAddLinkedArea = () => {
    if (linkedAreaInput.trim() !== '' && !formData.linkedAreas.includes(linkedAreaInput.trim())) {
      setFormData(prev => ({
        ...prev,
        linkedAreas: [...prev.linkedAreas, linkedAreaInput.trim()]
      }));
      setLinkedAreaInput('');
    }
  };
  
  const handleRemoveLinkedArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      linkedAreas: prev.linkedAreas.filter(a => a !== area)
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const taskToSubmit = task?.id 
        ? { ...formData, id: task.id } 
        : formData;
      
      console.log('Enviando tarea para guardar:', taskToSubmit);
      await onSubmit(taskToSubmit);
    } catch (error) {
      console.error('Error al guardar la tarea:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          required
          value={formData.description}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
          Comentario
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={3}
          value={formData.comment || ''}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Añade notas o comentarios adicionales sobre esta tarea..."
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            id="status"
            name="status"
            required
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Pendiente">Pendiente</option>
            <option value="En Progreso">En Progreso</option>
            <option value="Bloqueada">Bloqueada</option>
            <option value="Terminada">Terminada</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="responsible" className="block text-sm font-medium text-gray-700 mb-1">
            Responsable
          </label>
          <input
            type="text"
            id="responsible"
            name="responsible"
            required
            value={formData.responsible}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Prioridad
          </label>
          <select
            id="priority"
            name="priority"
            required
            value={formData.priority}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="importantDate" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Importante
          </label>
          <input
            type="date"
            id="importantDate"
            name="importantDate"
            value={formData.importantDate || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="highlighted"
            name="highlighted"
            checked={formData.highlighted || false}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="highlighted" className="ml-2 block text-sm text-gray-700">
            Marcar como tarea destacada
          </label>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Áreas Vinculadas
        </label>
        <div className="flex items-center">
          <input
            type="text"
            value={linkedAreaInput}
            onChange={(e) => setLinkedAreaInput(e.target.value)}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleAddLinkedArea}
            className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
          >
            Agregar
          </button>
        </div>
        
        <div className="mt-2 flex flex-wrap gap-2">
          {formData.linkedAreas.map((area, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 bg-gray-100 text-sm rounded"
            >
              {area}
              <button
                type="button"
                onClick={() => handleRemoveLinkedArea(area)}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isSubmitting ? 'Guardando...' : task ? 'Actualizar Tarea' : 'Crear Tarea'}
        </button>
      </div>
    </form>
  );
} 