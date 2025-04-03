import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { ChartData } from '../../types';

interface TimeTrackingChartProps {
  data: ChartData[];
  type: 'bar' | 'pie';
  title: string;
  dataKey?: string;
  colors?: string[];
}

const TimeTrackingChart: React.FC<TimeTrackingChartProps> = ({
  data,
  type,
  title,
  dataKey = 'value',
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
}) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-0">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'bar' ? (
              <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} hours`, 'Time Spent']}
                  labelFormatter={(label) => `${label}`}
                />
                <Legend />
                <Bar dataKey={dataKey} fill={colors[0]} />
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey={dataKey}
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} hours`, 'Time Spent']} />
                <Legend />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeTrackingChart;
