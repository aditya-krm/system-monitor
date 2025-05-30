"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';

type NetworkStatType = {
  interface: string;
  operstate: string;
  rx_bytes: number;
  rx_dropped: number;
  rx_errors: number;
  tx_bytes: number;
  tx_dropped: number;
  tx_errors: number;
  rx_sec: number;
  tx_sec: number;
};

type NetworkTrafficProps = {
  networkStats: NetworkStatType[];
};

// Helper function to format bytes
const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

const formatBytesPerSecond = (bytes: number): string => {
  return `${formatBytes(bytes)}/s`;
};

const NetworkTraffic = ({ networkStats }: NetworkTrafficProps) => {
  if (!networkStats || networkStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Network Traffic</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No network statistics available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Network Traffic</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {networkStats.map((stat, index) => (
            <div key={index} className="border rounded-md p-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">
                  {stat.interface} <span className={`text-xs px-1.5 py-0.5 rounded-full ${stat.operstate === 'up' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                    {stat.operstate}
                  </span>
                </h4>
              </div>
              
              <div className="flex justify-between items-center mb-1 text-sm">
                <div className="flex items-center">
                  <ArrowDown className="h-4 w-4 text-blue-500 mr-1" /> 
                  <span>Download</span>
                </div>
                <span className="font-medium">{formatBytesPerSecond(stat.rx_sec)}</span>
              </div>
              
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-3">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${Math.min((stat.rx_sec / (1024 * 1024)) * 10, 100)}%` }} 
                />
              </div>
              
              <div className="flex justify-between items-center mb-1 text-sm">
                <div className="flex items-center">
                  <ArrowUp className="h-4 w-4 text-green-500 mr-1" /> 
                  <span>Upload</span>
                </div>
                <span className="font-medium">{formatBytesPerSecond(stat.tx_sec)}</span>
              </div>
              
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-3">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${Math.min((stat.tx_sec / (1024 * 1024)) * 10, 100)}%` }} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Total Received:</span> {formatBytes(stat.rx_bytes)}
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Receive Errors:</span> {stat.rx_errors}
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Total Sent:</span> {formatBytes(stat.tx_bytes)}
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Send Errors:</span> {stat.tx_errors}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NetworkTraffic;
