"use client";

import React from 'react';
import { cn } from '@/lib/utils';

type StatusIndicatorProps = {
  status: 'healthy' | 'warning' | 'critical';
  label: string;
  className?: string;
}

const StatusIndicator = ({ status, label, className }: StatusIndicatorProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("w-3 h-3 rounded-full animate-pulse", getStatusColor())} />
      <span className="text-sm">{label}</span>
    </div>
  );
};

export default StatusIndicator;
