"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getCpuStatus } from "@/lib/system-health";

type CPUDataPoint = {
  time: string;
  load: number;
};

type CPUChartProps = {
  data: CPUDataPoint[];
  title: string;
};

const CPULoadChart = ({ data, title }: CPUChartProps) => {
  const currentLoad = data.length > 0 ? data[data.length - 1].load : 0;
  const avgLoad = data.length > 0 
    ? data.reduce((sum, point) => sum + point.load, 0) / data.length 
    : 0;
  const maxLoad = data.length > 0 
    ? Math.max(...data.map(point => point.load)) 
    : 0;
    
  // Get color based on current CPU load status
  const getChartColor = () => {
    const status = getCpuStatus(currentLoad);
    switch(status) {
      case 'critical': return "#ef4444";
      case 'warning': return "#f59e0b";
      default: return "#8884d8";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Current: {currentLoad.toFixed(2)}% | Average: {avgLoad.toFixed(2)}% | Peak: {maxLoad.toFixed(2)}%
        </CardDescription>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              label={{ value: 'Load %', angle: -90, position: 'insideLeft', fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(2)}%`, 'CPU Load']}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <ReferenceLine y={75} label={{ value: "Warning", position: "right" }} stroke="#f59e0b" strokeDasharray="3 3" />
            <ReferenceLine y={90} label={{ value: "Critical", position: "right" }} stroke="#ef4444" strokeDasharray="3 3" />
            <Line 
              type="monotone" 
              dataKey="load" 
              stroke={getChartColor()} 
              strokeWidth={2}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CPULoadChart;
