import { NextResponse } from 'next/server';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execCallback);

interface ServiceInfo {
    name: string;
    status: string;
    description?: string;
    isRunning: boolean;
}

export async function GET() {
    try {
        let services: ServiceInfo[] = [];
        try {
            // Try to get services using systemctl
            const { stdout } = await exec("systemctl list-units --type=service --all --plain --no-legend");

            services = stdout
                .split('\n')
                .filter(line => line.trim() !== '')
                .map(line => {
                    const parts = line.split(/\s+/);
                    const name = parts[0].replace('.service', '');

                    // Get more detailed status
                    const status = parts[3] || 'unknown';
                    const description = parts.slice(4).join(' ');
                    const isRunning = status === 'running';

                    return {
                        name,
                        status,
                        description,
                        isRunning
                    };
                })
                .sort((a, b) => a.name.localeCompare(b.name));
        } catch (error) {
            console.error("Error getting systemd services:", error);

            // Try service command as fallback
            try {
                const { stdout } = await exec("service --status-all");

                services = stdout
                    .split('\n')
                    .filter(line => line.trim() !== '')
                    .map(line => {
                        const match = line.match(/\[ ([+-?])\s*\]\s+(\S+)/);
                        if (!match) return null;

                        const statusSymbol = match[1];
                        const name = match[2];

                        const isRunning = statusSymbol === '+';
                        const status = isRunning ? 'running' : statusSymbol === '-' ? 'stopped' : 'unknown';

                        return {
                            name,
                            status,
                            isRunning
                        };
                    })
                    .filter((service): service is ServiceInfo => service !== null)
                    .sort((a, b) => a.name.localeCompare(b.name));
            } catch (error) {
                console.error("Error getting services with service command:", error);
            }
        }

        return NextResponse.json({
            services,
            count: services.length,
            runningCount: services.filter(s => s.isRunning).length
        });
    } catch (error) {
        console.error('Error fetching system services information:', error);
        return NextResponse.json(
            { error: 'Failed to fetch service information', services: [] },
            { status: 500 }
        );
    }
}
