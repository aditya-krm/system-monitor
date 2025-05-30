"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Cpu, Server, HardDrive, Thermometer, Wifi, LineChart, Activity, List } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CPULoadChart from "./CPULoadChart";
import CPUCoreDetails from "./CPUCoreDetails";
import NetworkTraffic from "./NetworkTraffic";
import ProcessTable from "./ProcessTable";
import RaspberryPiInfo from "./RaspberryPiInfo";
import SystemServices from "./SystemServices";
import StatusIndicator from "./ui/status-indicator";
import { getCpuStatus, getMemoryStatus, getDiskStatus, getTemperatureStatus, getStatusLabel } from "@/lib/system-health";

type GPIOStatus = {
  pin: string;
  mode: string;
  value: string;
};

type NetworkInterfaceType = {
  name: string;
  mac: string;
  ipv4: string;
  ipv6: string;
};

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

type ProcessType = {
  pid: number;
  name: string;
  cpu: number;
  mem: number;
  priority: number;
  command: string;
};

type GraphicsControllerType = {
  model: string;
  vendor: string;
  vram: number;
  driverVersion: string;
};

type GraphicsDisplayType = {
  model: string;
  main: boolean;
  builtin: boolean;
  connection: string;
  sizeX: number;
  sizeY: number;
  currentResX: number;
  currentResY: number;
};

type RaspberryPiType = {
  isRaspberryPi: boolean;
  model?: string;
  voltage?: string | null;
  throttled?: string | null;
  throttledHuman?: string[] | null;
  gpioStatus?: GPIOStatus[];
};

type SystemInfoType = {
  cpu: {
    model: string;
    cores: {
      physical: number;
      logical: number;
    };
    speed: string;
    load: {
      currentLoad: number;
      coresLoad: number[];
    };
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usedPercent: number;
  };
  disks: {
    fs: string;
    type: string;
    size: number;
    used: number;
    available: number;
    usePercent: number;
  }[];
  os: {
    platform: string;
    distro: string;
    release: string;
    kernel: string;
    arch: string;
    uptime: number;
  };
  temperature: {
    main: number;
    cores: number[];
    max: number;
  };
  network: {
    interfaces: NetworkInterfaceType[];
    stats: NetworkStatType[];
  };
  processes?: {
    all: number;
    running: number;
    blocked: number;
    sleeping: number;
    list: ProcessType[];
  };
  graphics?: {
    controllers: GraphicsControllerType[];
    displays: GraphicsDisplayType[];
  };
  battery: {
    hasBattery: boolean;
    isCharging?: boolean;
    percent?: number;
    timeRemaining?: number;
  };
  raspberryPi?: RaspberryPiType;
};

// Service info type
type ServiceInfoType = {
  name: string;
  status: string;
  description?: string;
  isRunning: boolean;
};

// Services response type
type ServicesResponseType = {
  services: ServiceInfoType[];
  count: number;
  runningCount: number;
};

export default function TabbedSystemDashboard() {
  const [systemInfo, setSystemInfo] = useState<SystemInfoType | null>(null);
  const [services, setServices] = useState<ServicesResponseType | null>(null);
  const [diskIO, setDiskIO] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [diskIOLoading, setDiskIOLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cpuHistory, setCpuHistory] = useState<Array<{time: string, load: number}>>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("overview");

  const fetchSystemInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/system');
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setSystemInfo(data);
      setLastRefresh(new Date());
      
      // Fetch services information
      try {
        setServicesLoading(true);
        const servicesResponse = await fetch('/api/services');
        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json();
          setServices(servicesData);
        }
      } catch (err) {
        console.error('Error fetching services:', err);
      } finally {
        setServicesLoading(false);
      }
      
      // Fetch disk I/O information
      try {
        setDiskIOLoading(true);
        const diskIOResponse = await fetch('/api/disk-io');
        if (diskIOResponse.ok) {
          const diskIOData = await diskIOResponse.json();
          setDiskIO(diskIOData);
        }
      } catch (err) {
        console.error('Error fetching disk I/O:', err);
      } finally {
        setDiskIOLoading(false);
      }
      
      // Add current CPU load to history
      if (data && data.cpu && data.cpu.load) {
        const now = new Date();
        const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        setCpuHistory(prev => {
          // Keep only the last 20 data points for the chart
          const newHistory = [...prev, { time: timeString, load: data.cpu.load.currentLoad }];
          if (newHistory.length > 20) {
            return newHistory.slice(newHistory.length - 20);
          }
          return newHistory;
        });
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch system information');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemInfo();

    // Auto-refresh every 10 seconds
    const intervalId = setInterval(() => {
      fetchSystemInfo();
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  if (loading && !systemInfo) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading system information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchSystemInfo}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!systemInfo) return null;

  // Format bytes to a readable format
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Format seconds to days, hours, minutes, seconds
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
        <h1 className="text-3xl font-bold">System Dashboard</h1>
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <div className="text-sm text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()} {lastRefresh.toLocaleDateString()}
          </div>
          <Button
            onClick={fetchSystemInfo}
            className="flex items-center gap-2"
            variant="outline"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview - Always visible */}
      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-semibold">OS:</span> {systemInfo.os.distro} {systemInfo.os.release}
            </div>
            <div>
              <span className="font-semibold">Architecture:</span> {systemInfo.os.arch}
            </div>
            <div>
              <span className="font-semibold">Kernel:</span> {systemInfo.os.kernel}
            </div>
            <div>
              <span className="font-semibold">Uptime:</span> {formatUptime(systemInfo.os.uptime)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatusIndicator 
              status={getCpuStatus(systemInfo.cpu.load.currentLoad)}
              label={`CPU: ${getStatusLabel(getCpuStatus(systemInfo.cpu.load.currentLoad))}`}
            />
            
            <StatusIndicator 
              status={getMemoryStatus(systemInfo.memory.usedPercent)}
              label={`Memory: ${getStatusLabel(getMemoryStatus(systemInfo.memory.usedPercent))}`}
            />
            
            <StatusIndicator 
              status={getTemperatureStatus(systemInfo.temperature.main)}
              label={`Temperature: ${getStatusLabel(getTemperatureStatus(systemInfo.temperature.main))}`}
            />
            
            {systemInfo.disks.length > 0 && (
              <StatusIndicator 
                status={getDiskStatus(systemInfo.disks[0].usePercent)}
                label={`Primary Disk: ${getStatusLabel(getDiskStatus(systemInfo.disks[0].usePercent))}`}
              />
            )}
          </CardContent>
        </Card>
      </section>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full mb-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            <span className="hidden md:inline">Hardware</span>
          </TabsTrigger>
          <TabsTrigger value="network" className="flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            <span className="hidden md:inline">Network</span>
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            <span className="hidden md:inline">Storage</span>
          </TabsTrigger>
          <TabsTrigger value="processes" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden md:inline">Processes</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            <span className="hidden md:inline">Services</span>
          </TabsTrigger>
        </TabsList>

        {/* Hardware Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* CPU Information */}
          <Card>
            <CardHeader>
              <CardTitle>CPU Information</CardTitle>
              <CardDescription>{systemInfo.cpu.model}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-semibold">Cores:</span> {systemInfo.cpu.cores.physical} Physical / {systemInfo.cpu.cores.logical} Logical
              </div>
              <div>
                <span className="font-semibold">Speed:</span> {systemInfo.cpu.speed}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>CPU Load</span>
                  <span>{systemInfo.cpu.load.currentLoad.toFixed(2)}%</span>
                </div>
                <Progress value={systemInfo.cpu.load.currentLoad} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Memory */}
          <Card>
            <CardHeader>
              <CardTitle>Memory Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Used Memory</span>
                  <span>{formatBytes(systemInfo.memory.used)} / {formatBytes(systemInfo.memory.total)} ({systemInfo.memory.usedPercent.toFixed(2)}%)</span>
                </div>
                <Progress value={systemInfo.memory.usedPercent} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold">Free Memory:</span> {formatBytes(systemInfo.memory.free)}
                </div>
                <div>
                  <span className="font-semibold">Total Memory:</span> {formatBytes(systemInfo.memory.total)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CPU Load Chart */}
          <CPULoadChart data={cpuHistory} title="CPU Load History" />
          
          {/* CPU Core Details */}
          {systemInfo.cpu.load.coresLoad && systemInfo.cpu.load.coresLoad.length > 0 && (
            <CPUCoreDetails coreLoads={systemInfo.cpu.load.coresLoad} />
          )}

          {/* Temperature */}
          <Card>
            <CardHeader>
              <CardTitle>CPU Temperature</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemInfo.temperature.main !== null ? (
                  <>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Main Temperature</span>
                        <span>{systemInfo.temperature.main}°C</span>
                      </div>
                      <Progress 
                        value={Math.min((systemInfo.temperature.main / 100) * 100, 100)} 
                        className={`h-2 ${systemInfo.temperature.main > 70 ? 'bg-red-500' : systemInfo.temperature.main > 50 ? 'bg-yellow-500' : ''}`} 
                      />
                    </div>
                    
                    {systemInfo.temperature.cores && systemInfo.temperature.cores.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Core Temperatures</h4>
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                          {systemInfo.temperature.cores.map((temp, i) => (
                            <div key={i} className="text-sm">
                              Core {i}: {temp}°C
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p>Temperature data not available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Battery */}
          {systemInfo.battery && systemInfo.battery.hasBattery && (
            <Card>
              <CardHeader>
                <CardTitle>Battery Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Battery Level</span>
                      <span>{systemInfo.battery.percent}%</span>
                    </div>
                    <Progress value={systemInfo.battery.percent} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-semibold">Status:</span> {systemInfo.battery.isCharging ? 'Charging' : 'Discharging'}
                    </div>
                    {systemInfo.battery.timeRemaining !== undefined && (
                      <div className="text-sm">
                        <span className="font-semibold">Time Remaining:</span> {Math.round(systemInfo.battery.timeRemaining / 60)} minutes
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Raspberry Pi Information */}
          {systemInfo.raspberryPi && systemInfo.raspberryPi.isRaspberryPi && (
            <RaspberryPiInfo data={systemInfo.raspberryPi} />
          )}
        </TabsContent>

        {/* Network Tab */}
        <TabsContent value="network" className="space-y-6">
          {/* Network Interfaces */}
          <Card>
            <CardHeader>
              <CardTitle>Network Interfaces</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemInfo.network.interfaces.length > 0 ? (
                  systemInfo.network.interfaces.map((iface, index) => (
                    <div key={index} className="border p-4 rounded-md">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{iface.name}</h4>
                        <div className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs">
                          Active
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <div className="text-sm">
                          <span className="font-semibold">IPv4:</span> {iface.ipv4 || 'N/A'}
                        </div>
                        <div className="text-sm">
                          <span className="font-semibold">IPv6:</span> {iface.ipv6 || 'N/A'}
                        </div>
                        <div className="text-sm">
                          <span className="font-semibold">MAC:</span> {iface.mac || 'N/A'}
                        </div>
                        <div className="text-sm">
                          <span className="font-semibold">Type:</span> {iface.name.startsWith('wl') ? 'Wireless' : iface.name.startsWith('eth') || iface.name.startsWith('en') ? 'Ethernet' : 'Other'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No network interfaces found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Network Traffic */}
          {systemInfo.network.stats && systemInfo.network.stats.length > 0 && (
            <NetworkTraffic networkStats={systemInfo.network.stats} />
          )}
        </TabsContent>

        {/* Storage Tab */}
        <TabsContent value="storage" className="space-y-6">
          {/* Disk Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Disk Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {systemInfo.disks.map((disk, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{disk.fs} ({disk.type})</span>
                    <span className="text-sm">{formatBytes(disk.used)} / {formatBytes(disk.size)} ({disk.usePercent.toFixed(1)}%)</span>
                  </div>
                  <Progress value={disk.usePercent} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Disk I/O - If you have this data */}
          {diskIO && (
            <Card>
              <CardHeader>
                <CardTitle>Disk I/O</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {diskIO.totalIO ? (
                    <div className="border p-3 rounded-md">
                      <div className="font-medium mb-2">Overall Disk I/O</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Read:</span> {formatBytes(diskIO.totalIO.readIO_sec || 0)}/s
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Write:</span> {formatBytes(diskIO.totalIO.writeIO_sec || 0)}/s
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Total:</span> {formatBytes(diskIO.totalIO.totalIO_sec || 0)}/s
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Cumulative Read:</span> {formatBytes(diskIO.totalIO.readIO || 0)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p>No disk I/O data available</p>
                  )}
                  
                  {diskIO.fileSystemStats && (
                    <div className="border p-3 rounded-md">
                      <div className="font-medium mb-2">File System I/O</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Read:</span> {formatBytes(diskIO.fileSystemStats.rx_sec || 0)}/s
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Write:</span> {formatBytes(diskIO.fileSystemStats.wx_sec || 0)}/s
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Transfer:</span> {formatBytes(diskIO.fileSystemStats.tx_sec || 0)}/s
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Processes Tab */}
        <TabsContent value="processes" className="space-y-6">
          {/* Process Table */}
          {systemInfo.processes && systemInfo.processes.list ? (
            <ProcessTable 
              processes={systemInfo.processes.list} 
              onRefresh={fetchSystemInfo}
              loading={loading} 
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Processes</CardTitle>
              </CardHeader>
              <CardContent>
                <p>No process information available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          {/* System Services */}
          {services ? (
            <SystemServices
              services={services.services}
              count={services.count}
              runningCount={services.runningCount}
              onRefresh={fetchSystemInfo}
              loading={servicesLoading}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>System Services</CardTitle>
              </CardHeader>
              <CardContent>
                <p>No services information available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Footer information */}
      <footer className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
        <p>System Monitor Dashboard</p>
        <p className="mt-2">Built for cross-platform monitoring (Raspberry Pi OS and Ubuntu)</p>
        <p className="mt-1">Using Next.js, Tailwind CSS, ShadCN UI, and systeminformation package</p>
      </footer>
    </div>
  );
}
