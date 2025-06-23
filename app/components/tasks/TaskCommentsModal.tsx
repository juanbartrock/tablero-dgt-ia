'use client';

import React, { useState, useEffect } from 'react';
import { TaskComment } from '@/app/lib/types';

interface TaskCommentsModalProps {
  taskId: number;
  taskDescription: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskCommentsModal({ 
  taskId, 
  taskDescription, 
  isOpen, 
  onClose 
}: TaskCommentsModalProps) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [author, setAuthor] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar comentarios cuando se abre el modal
  useEffect(() => {
    if (isOpen && taskId) {
      loadComments();
    }
  }, [isOpen, taskId]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`);
      const data = await response.json();
      
      if (data.success) {
        setComments(data.data || []);
      } else {
        console.error('Error al cargar comentarios:', data.error);
      }
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !author.trim()) {
      alert('Por favor, completa todos los campos');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: newComment.trim(),
          createdBy: author.trim()
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setNewComment('');
        await loadComments(); // Recargar comentarios
      } else {
        alert('Error al agregar comentario: ' + data.error);
      }
    } catch (error) {
      console.error('Error al agregar comentario:', error);
      alert('Error al agregar comentario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}/comments?commentId=${commentId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        await loadComments(); // Recargar comentarios
      } else {
        alert('Error al eliminar comentario: ' + data.error);
      }
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      alert('Error al eliminar comentario');
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Historial de Seguimiento
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Tarea: {taskDescription}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Formulario para agregar nuevo comentario */}
          <form onSubmit={handleAddComment} className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Agregar Nueva Acción
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tu nombre
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Juan Pérez"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción de la acción
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Se habló con el sector de IT para coordinar el despliegue..."
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Agregando...' : 'Agregar Acción'}
              </button>
            </div>
          </form>

          {/* Lista de comentarios */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Historial de Acciones ({comments.length})
            </h3>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Cargando historial...</div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">No hay acciones registradas aún</div>
                <div className="text-sm text-gray-400 mt-1">
                  Agrega la primera acción usando el formulario de arriba
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium text-gray-900">{comment.createdBy}</span>
                        <span className="mx-2">•</span>
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                    <div className="text-gray-900 whitespace-pre-wrap">
                      {comment.comment}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 