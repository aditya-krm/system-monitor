"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusIndicator from "@/components/ui/status-indicator";

type GPIOPinType = {
  pin: string;
  mode: string;
  value: string;
};

type RaspberryPiInfoProps = {
  data: {
    isRaspberryPi: boolean;
    model?: string;
    voltage?: string | null;
    throttled?: string | null;
    throttledHuman?: string[] | null;
    gpioStatus?: GPIOPinType[];
  };
};

const RaspberryPiInfo = ({ data }: RaspberryPiInfoProps) => {
  if (!data?.isRaspberryPi) {
    return null;
  }

  const getThrottleStatus = (): 'healthy' | 'warning' | 'critical' => {
    if (!data.throttledHuman || data.throttledHuman.length === 0) {
      return 'healthy';
    }
    
    const criticalIssues = data.throttledHuman.filter(issue => 
      issue.includes('Under-voltage') || 
      issue.includes('Throttling')
    );
    
    const warningIssues = data.throttledHuman.filter(issue => 
      issue.includes('has occurred') ||
      issue.includes('Frequency capped')
    );
    
    if (criticalIssues.length > 0) {
      return 'critical';
    } else if (warningIssues.length > 0) {
      return 'warning';
    }
    
    return 'healthy';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Raspberry Pi Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="font-semibold mb-1">Model</div>
          <div>{data.model}</div>
        </div>
        
        {data.voltage && (
          <div>
            <div className="font-semibold mb-1">Core Voltage</div>
            <div>{data.voltage}V</div>
          </div>
        )}
        
        {data.throttledHuman && data.throttledHuman.length > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="font-semibold">System Status</div>
              <StatusIndicator 
                status={getThrottleStatus()} 
                label={getThrottleStatus() === 'healthy' ? 'Normal' : getThrottleStatus() === 'warning' ? 'Warning' : 'Issue Detected'} 
              />
            </div>
            <ul className="list-disc list-inside text-sm space-y-1">
              {data.throttledHuman.map((issue, i) => (
                <li key={i} className="text-red-500">{issue}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="font-semibold">System Status</div>
              <StatusIndicator status="healthy" label="Normal" />
            </div>
            <div className="text-sm text-green-600">No throttling issues detected</div>
          </div>
        )}
        
        {data.gpioStatus && data.gpioStatus.length > 0 && (
          <div>
            <div className="font-semibold mb-2">GPIO Pins</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {data.gpioStatus.map((pin, index) => (
                <div key={index} className="border rounded p-1 text-xs flex justify-between">
                  <span>{pin.pin}</span>
                  <span className={`px-1 rounded ${
                    pin.value === "1" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}>{pin.value === "1" ? "HIGH" : "LOW"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RaspberryPiInfo;
