'use client';

import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Task } from '@/app/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CalendarProps {
  tasks: Task[];
  onEventClick?: (task: Task) => void;
}

const Calendar: React.FC<CalendarProps> = ({ tasks, onEventClick }) => {
  // Convertir las tareas a eventos del calendario
  const events = tasks
    .filter(task => task.importantDate) // Solo tareas con fecha
    .map(task => ({
      id: task.id.toString(),
      title: task.description,
      start: task.importantDate,
      backgroundColor: getStatusColor(task.status),
      extendedProps: { task }
    }));

  // Función para obtener el color según el estado
  function getStatusColor(status: string): string {
    switch (status) {
      case 'Pendiente':
        return '#FCD34D'; // Amarillo
      case 'En Progreso':
        return '#60A5FA'; // Azul
      case 'Terminada':
        return '#34D399'; // Verde
      case 'Bloqueada':
        return '#EF4444'; // Rojo
      default:
        return '#CBD5E1'; // Gris por defecto
    }
  }

  return (
    <div className="h-[700px] bg-white p-4 rounded-lg shadow">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek'
        }}
        locale="es" // Calendario en español
        events={events}
        eventClick={(info) => {
          const task = info.event.extendedProps.task as Task;
          onEventClick?.(task);
        }}
        height="100%"
        buttonText={{
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana'
        }}
      />
    </div>
  );
};

export default Calendar; 