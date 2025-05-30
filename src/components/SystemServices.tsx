"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusIndicator from "@/components/ui/status-indicator";

type ServiceType = {
  name: string;
  status: string;
  description?: string;
  isRunning: boolean;
};

type ServicesProps = {
  onRefresh: () => void;
  services: ServiceType[];
  count: number;
  runningCount: number;
  loading?: boolean;
};

const SystemServices = ({ services, count, runningCount, onRefresh, loading = false }: ServicesProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredServices, setFilteredServices] = useState<ServiceType[]>(services || []);

  useEffect(() => {
    if (!services) {
      setFilteredServices([]);
      return;
    }
    
    setFilteredServices(
      services.filter(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
  }, [searchTerm, services]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">System Services</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Total Services: {count}</span>
          <span>Running: {runningCount}</span>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-[400px]">
          {loading ? (
            <div className="text-center py-4">Loading services...</div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-4">No services found</div>
          ) : (
            <div className="space-y-2">
              {filteredServices.map((service) => (
                <div 
                  key={service.name}
                  className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div>
                    <div className="font-medium">{service.name}</div>
                    {service.description && <div className="text-xs text-gray-500">{service.description}</div>}
                  </div>
                  <StatusIndicator 
                    status={service.isRunning ? 'healthy' : 'warning'} 
                    label={service.status}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemServices;
