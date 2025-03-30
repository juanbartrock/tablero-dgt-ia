'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface StatusChartProps {
  data: {
    name: string;
    value: number;
  }[];
}

// Colores actualizados para combinar con nuestro esquema de diseño
const COLORS = ['#0056b3', '#17a2b8', '#dc3545', '#28a745'];
const RADIAN = Math.PI / 180;

export default function StatusChart({ data }: StatusChartProps) {
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontWeight="bold"
        fontSize="12"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Customizar la tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-lg border border-gray-200">
          <p className="font-medium text-gray-800">{payload[0].name}</p>
          <p className="text-primary font-bold">{payload[0].value} tareas</p>
        </div>
      );
    }
  
    return null;
  };

  return (
    <div className="h-64 w-full bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">Distribución por Estado</h3>
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            innerRadius={30}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={4}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                stroke="#ffffff" 
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            formatter={(value) => <span className="text-sm font-medium text-gray-800">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
} 