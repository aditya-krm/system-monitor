"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type CPUCoreDetailsProps = {
  coreLoads: number[];
}

const CPUCoreDetails = ({ coreLoads }: CPUCoreDetailsProps) => {
  if (!coreLoads || coreLoads.length === 0) {
    return <p>No core data available</p>;
  }

  const getLoadColor = (load: number) => {
    if (load >= 80) return "bg-red-500";
    if (load >= 60) return "bg-yellow-500";
    return "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>CPU Core Loads</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {coreLoads.map((load, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Core {index}</span>
                <span>{load.toFixed(1)}%</span>
              </div>
              <Progress 
                value={load} 
                className={`h-2 ${getLoadColor(load)}`}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CPUCoreDetails;
