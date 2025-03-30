'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ResponsibleChartProps {
  data: {
    name: string;
    value: number;
  }[];
}

export default function ResponsibleChart({ data }: ResponsibleChartProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow h-64">
      <h3 className="text-lg font-semibold mb-4">Carga por Responsable</h3>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#3182CE" name="Tareas Asignadas" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 