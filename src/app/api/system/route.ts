import { NextResponse } from 'next/server';
import si from 'systeminformation';

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
            timeInfo
        ] = await Promise.all([
            si.cpu(),
            si.mem(),
            si.fsSize(),
            si.osInfo(),
            getCpuTemp(),
            si.networkInterfaces(),
            si.battery().catch(() => ({ hasBattery: false })),
            si.time()
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
            network: networkInterfaces
                .filter((iface) => !iface.internal)
                .map((iface) => ({
                    name: iface.iface,
                    mac: iface.mac,
                    ipv4: iface.ip4,
                    ipv6: iface.ip6
                })),
            battery: batteryInfo
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
