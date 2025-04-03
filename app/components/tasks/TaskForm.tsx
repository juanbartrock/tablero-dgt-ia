'use client';

import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority } from '@/app/lib/types';

interface TaskFormProps {
  task?: Task;
  onSubmit: (task: Omit<Task, 'id'> | Task) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export default function TaskForm({ task, onSubmit, onCancel, isLoading }: TaskFormProps) {
  const [formData, setFormData] = useState<Omit<Task, 'id'>>({
    description: task?.description || '',
    status: task?.status || 'Pendiente',
    responsible: task?.responsible || '',
    linkedAreas: task?.linkedAreas || [],
    importantDate: task?.importantDate || '',
    priority: task?.priority || 'Media',
    highlighted: task?.highlighted || false,
    comment: task?.comment || '',
    fileUrl: task?.fileUrl || '',
    fileName: task?.fileName || ''
  });
  
  const [linkedAreaInput, setLinkedAreaInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
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
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let fileUrl = formData.fileUrl;
      let fileName = formData.fileName;

      if (file) {
        setIsUploading(true);
        const formDataFile = new FormData();
        formDataFile.append('file', file);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formDataFile
        });

        if (!uploadResponse.ok) {
          throw new Error('Error al subir el archivo');
        }

        const { url, name } = await uploadResponse.json();
        fileUrl = url;
        fileName = name;
      }

      const taskToSubmit = task?.id 
        ? { ...formData, id: task.id, fileUrl, fileName } 
        : { ...formData, fileUrl, fileName };
      
      console.log('Enviando tarea para guardar:', taskToSubmit);
      await onSubmit(taskToSubmit);
    } catch (error) {
      console.error('Error en el submit del formulario (TaskForm):', error);
    } finally {
      setIsUploading(false);
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
      
      <div className="mb-4">
        <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
          Archivo Adjunto
        </label>
        <input
          type="file"
          id="file"
          name="file"
          onChange={handleFileChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {formData.fileUrl && (
          <div className="mt-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-gray-600">{formData.fileName}</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Guardando...' : task ? 'Actualizar Tarea' : 'Crear Tarea'}
        </button>
      </div>
    </form>
  );
} 