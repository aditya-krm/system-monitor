"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';

type Process = {
  pid: number;
  name: string;
  cpu: number;
  mem: number;
  priority: number;
  command: string;
};

type ProcessesProps = {
  processes: Process[];
  onRefresh: () => void;
  loading?: boolean;
};

const ProcessTable = ({ processes, onRefresh, loading = false }: ProcessesProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Process; direction: 'asc' | 'desc' }>({ 
    key: 'cpu', 
    direction: 'desc' 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const handleSort = (key: keyof Process) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredProcesses = processes.filter(process => 
    process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(process.pid).includes(searchTerm)
  );

  const sortedProcesses = [...filteredProcesses].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedProcesses.length / rowsPerPage);
  const paginatedProcesses = sortedProcesses.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const getSortIcon = (key: keyof Process) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Running Processes</CardTitle>
            <CardDescription>
              {filteredProcesses.length} processes | Sorted by {sortConfig.key} ({sortConfig.direction})
            </CardDescription>
          </div>
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
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search processes by name, command or PID..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-[400px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left font-medium p-2 cursor-pointer" onClick={() => handleSort('pid')}>
                  <div className="flex items-center">
                    PID {getSortIcon('pid')}
                  </div>
                </th>
                <th className="text-left font-medium p-2 cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center">
                    Process {getSortIcon('name')}
                  </div>
                </th>
                <th className="text-right font-medium p-2 cursor-pointer" onClick={() => handleSort('cpu')}>
                  <div className="flex items-center justify-end">
                    CPU% {getSortIcon('cpu')}
                  </div>
                </th>
                <th className="text-right font-medium p-2 cursor-pointer" onClick={() => handleSort('mem')}>
                  <div className="flex items-center justify-end">
                    MEM% {getSortIcon('mem')}
                  </div>
                </th>
                <th className="text-right font-medium p-2 cursor-pointer" onClick={() => handleSort('priority')}>
                  <div className="flex items-center justify-end">
                    Priority {getSortIcon('priority')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">Loading...</td>
                </tr>
              ) : paginatedProcesses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">No processes found</td>
                </tr>
              ) : (
                paginatedProcesses.map((process) => (
                  <tr key={process.pid} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-2">{process.pid}</td>
                    <td className="p-2 max-w-[200px] truncate" title={process.command}>{process.name}</td>
                    <td className="p-2 text-right">{process.cpu.toFixed(1)}%</td>
                    <td className="p-2 text-right">{process.mem.toFixed(1)}%</td>
                    <td className="p-2 text-right">{process.priority}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {!loading && filteredProcesses.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {Math.min(filteredProcesses.length, (currentPage - 1) * rowsPerPage + 1)} to {Math.min(filteredProcesses.length, currentPage * rowsPerPage)} of {filteredProcesses.length}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous Page</span>
              </Button>
              <span className="text-sm">Page {currentPage} of {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next Page</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProcessTable;
