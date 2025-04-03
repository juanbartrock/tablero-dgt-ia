'use client';

import React, { useState } from 'react';
import Calendar from './Calendar';
import CalendarModal from './CalendarModal';
import { Task } from '@/app/lib/types';

interface CalendarContainerProps {
  tasks: Task[];
}

const CalendarContainer: React.FC<CalendarContainerProps> = ({ tasks }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEventClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="w-full">
      <Calendar tasks={tasks} onEventClick={handleEventClick} />
      <CalendarModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default CalendarContainer; 