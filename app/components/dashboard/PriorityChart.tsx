'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PriorityChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

export default function PriorityChart({ data }: PriorityChartProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow h-64">
      <h3 className="text-lg font-semibold mb-4">Prioridad de Tareas</h3>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 5,
            right: 30,
            left: 50,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" />
          <Tooltip />
          {data.map((entry, index) => (
            <Bar 
              key={`bar-${index}`} 
              dataKey="value" 
              fill={entry.color} 
              name={entry.name} 
              legendType="circle"
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 