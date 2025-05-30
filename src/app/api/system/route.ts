import { NextResponse } from 'next/server';
import si from 'systeminformation';
import { promises as fs } from 'fs';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execCallback);

type GPIOStatus = {
    pin: string;
    mode: string;
    value: string;
};

// Function to get Raspberry Pi specific information
const getRaspberryPiInfo = async () => {
    try {
        // Check if this is a Raspberry Pi by trying to read the model file
        try {
            const modelInfo = await fs.readFile('/proc/device-tree/model', 'utf8');
            if (modelInfo.includes('Raspberry Pi')) {
                let voltage: string | null = null;
                let throttled: string | null = null;
                let gpioStatus: GPIOStatus[] = [];

                // Get voltage information
                try {
                    const { stdout: vcgencmdPath } = await exec('which vcgencmd');
                    if (vcgencmdPath.trim()) {
                        const { stdout: voltageOutput } = await exec('vcgencmd measure_volts core');
                        voltage = voltageOutput.trim().replace('volt=', '').replace('V', '');

                        // Get throttling status
                        const { stdout: throttledOutput } = await exec('vcgencmd get_throttled');
                        throttled = throttledOutput.trim().replace('throttled=', '');
                    }
                } catch (error) {
                    console.error("Error getting Raspberry Pi voltage info:", error);
                }

                // Attempt to get GPIO info (simplified, would need proper GPIO library for complete functionality)
                try {
                    const { stdout: gpioOutput } = await exec('gpio readall 2>/dev/null || echo "GPIO command not available"');
                    if (!gpioOutput.includes("not available")) {
                        // Parse gpio output - this is a simplified version
                        gpioStatus = gpioOutput.split('\n')
                            .filter(line => line.includes('|'))
                            .map(line => {
                                const parts = line.split('|').map(p => p.trim()).filter(p => p);
                                if (parts.length >= 7) {
                                    return {
                                        pin: parts[0] || parts[6],
                                        mode: parts[1] || parts[5],
                                        value: parts[2] || parts[4]
                                    };
                                }
                                return null;
                            })
                            .filter((item): item is GPIOStatus => item !== null);
                    }
                } catch (error) {
                    console.error("Error getting GPIO status:", error);
                }

                return {
                    isRaspberryPi: true,
                    model: modelInfo.trim(),
                    voltage,
                    throttled,
                    throttledHuman: throttled ? interpretThrottledValue(throttled) : null,
                    gpioStatus,
                };
            }
        } catch (error) {
            // Not a Raspberry Pi or can't access the model file
        }
    } catch (error) {
        console.error("Error determining if system is Raspberry Pi:", error);
    }

    return { isRaspberryPi: false };
};

// Helper to interpret throttled values
const interpretThrottledValue = (throttledHex: string): string[] => {
    const binary = parseInt(throttledHex, 16).toString(2).padStart(32, '0');
    const result: string[] = [];

    if (binary[31] === '1') result.push('Under-voltage detected');
    if (binary[30] === '1') result.push('Frequency capped');
    if (binary[29] === '1') result.push('Throttling active');
    if (binary[28] === '1') result.push('Soft temperature limit active');
    if (binary[27] === '1') result.push('Under-voltage has occurred');
    if (binary[26] === '1') result.push('Frequency capping has occurred');
    if (binary[25] === '1') result.push('Throttling has occurred');
    if (binary[24] === '1') result.push('Soft temperature limit has occurred');

    return result;
};

export async function GET() {
    try {
        // Handle potential differences between ARM (Raspberry Pi) and x64 (Ubuntu) systems
        const getCpuTemp = async () => {
            try {
                return await si.cpuTemperature();
            } catch (error) {
                console.error("Error getting CPU temperature:", error);
                return { main: null, cores: [], max: null };
            }
        };

        const [
            cpuInfo,
            memInfo,
            diskInfo,
            osInfo,
            tempInfo,
            networkInterfaces,
            batteryInfo,
            timeInfo,
            processesInfo,
            networkStats,
            graphicsInfo,
            piInfo
        ] = await Promise.all([
            si.cpu(),
            si.mem(),
            si.fsSize(),
            si.osInfo(),
            getCpuTemp(),
            si.networkInterfaces(),
            si.battery().catch(() => ({ hasBattery: false })),
            si.time(),
            si.processes().catch(error => {
                console.error("Error getting processes:", error);
                return { all: 0, running: 0, blocked: 0, sleeping: 0, list: [] };
            }),
            si.networkStats().catch(error => {
                console.error("Error getting network stats:", error);
                return [];
            }),
            si.graphics().catch(error => {
                console.error("Error getting graphics info:", error);
                return { controllers: [], displays: [] };
            }),
            getRaspberryPiInfo()
        ]);

        // Calculate CPU load
        const currentLoad = await si.currentLoad().catch(error => {
            console.error("Error getting CPU load:", error);
            return { currentLoad: 0, cpus: [] };
        });

        const systemInfo = {
            cpu: {
                model: cpuInfo.brand || cpuInfo.manufacturer + ' ' + cpuInfo.family,
                cores: {
                    physical: cpuInfo.physicalCores,
                    logical: cpuInfo.cores
                },
                speed: `${cpuInfo.speed} GHz`,
                load: {
                    currentLoad: currentLoad.currentLoad || 0,
                    coresLoad: currentLoad.cpus ? currentLoad.cpus.map((core) => core.load) : []
                }
            },
            memory: {
                total: memInfo.total,
                used: memInfo.used,
                free: memInfo.free,
                usedPercent: (memInfo.used / memInfo.total) * 100
            },
            disks: diskInfo.map((disk) => ({
                fs: disk.fs,
                type: disk.type,
                size: disk.size,
                used: disk.used,
                available: disk.available,
                usePercent: disk.use
            })),
            os: {
                platform: osInfo.platform,
                distro: osInfo.distro,
                release: osInfo.release,
                kernel: osInfo.kernel,
                arch: osInfo.arch,
                uptime: timeInfo.uptime
            },
            temperature: {
                main: tempInfo.main,
                cores: tempInfo.cores || [],
                max: tempInfo.max
            },
            network: {
                interfaces: networkInterfaces
                    .filter((iface) => !iface.internal)
                    .map((iface) => ({
                        name: iface.iface,
                        mac: iface.mac,
                        ipv4: iface.ip4,
                        ipv6: iface.ip6
                    })),
                stats: networkStats.map(stat => ({
                    interface: stat.iface,
                    operstate: stat.operstate,
                    rx_bytes: stat.rx_bytes,
                    rx_dropped: stat.rx_dropped,
                    rx_errors: stat.rx_errors,
                    tx_bytes: stat.tx_bytes,
                    tx_dropped: stat.tx_dropped,
                    tx_errors: stat.tx_errors,
                    rx_sec: stat.rx_sec,
                    tx_sec: stat.tx_sec
                }))
            },
            processes: {
                all: processesInfo.all,
                running: processesInfo.running,
                blocked: processesInfo.blocked,
                sleeping: processesInfo.sleeping,
                list: (processesInfo.list || []).slice(0, 50).map(process => ({
                    pid: process.pid,
                    name: process.name,
                    cpu: process.cpu,
                    mem: process.mem,
                    priority: process.priority,
                    command: process.command
                }))
            },
            graphics: {
                controllers: graphicsInfo.controllers?.map(controller => ({
                    model: controller.model,
                    vendor: controller.vendor,
                    vram: controller.vram,
                    driverVersion: controller.driverVersion
                })) || [],
                displays: graphicsInfo.displays?.map(display => ({
                    model: display.model,
                    main: display.main,
                    builtin: display.builtin,
                    connection: display.connection,
                    sizeX: display.sizeX,
                    sizeY: display.sizeY,
                    currentResX: display.currentResX,
                    currentResY: display.currentResY
                })) || []
            },
            battery: batteryInfo,
            raspberryPi: piInfo
        };

        return NextResponse.json(systemInfo);
    } catch (error) {
        console.error('Error fetching system information:', error);
        return NextResponse.json(
            { error: 'Failed to fetch system information' },
            { status: 500 }
        );
    }
}
