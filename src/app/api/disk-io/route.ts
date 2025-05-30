import { NextResponse } from 'next/server';
import si from 'systeminformation';

export async function GET() {
    try {
        // Get disk I/O information
        const diskIO = await si.disksIO().catch(error => {
            console.error("Error getting disk I/O stats:", error);
            return { rIO: 0, wIO: 0, tIO: 0, rIO_sec: 0, wIO_sec: 0, tIO_sec: 0 };
        });

        // Get disk I/O per disk
        const fsStats = await si.fsStats().catch(error => {
            console.error("Error getting filesystem stats:", error);
            return { rx: 0, wx: 0, tx: 0, rx_sec: 0, wx_sec: 0, tx_sec: 0 };
        });

        return NextResponse.json({
            totalIO: {
                readIO: diskIO.rIO,
                writeIO: diskIO.wIO,
                totalIO: diskIO.tIO,
                readIO_sec: diskIO.rIO_sec,
                writeIO_sec: diskIO.wIO_sec,
                totalIO_sec: diskIO.tIO_sec
            },
            fileSystemStats: {
                rx: fsStats.rx,
                wx: fsStats.wx,
                tx: fsStats.tx,
                rx_sec: fsStats.rx_sec,
                wx_sec: fsStats.wx_sec,
                tx_sec: fsStats.tx_sec
            }
        });
    } catch (error) {
        console.error('Error fetching disk I/O information:', error);
        return NextResponse.json(
            { error: 'Failed to fetch disk I/O information' },
            { status: 500 }
        );
    }
}
