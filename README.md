# System Monitor Dashboard

A full-stack Next.js application that provides real-time system monitoring for both Raspberry Pi OS (ARM) and Ubuntu (x64) systems.

## Features

- **CPU Information**
  - Model, cores, speed
  - Real-time CPU load with historical chart
  - CPU temperature (core-specific where available)

- **Memory Usage**
  - Total, used, and free memory
  - Memory usage percentage

- **Disk Information**
  - Per-disk usage statistics
  - File system type
  - Available space and usage percentage

- **System Overview**
  - OS details (distro, version, kernel)
  - System architecture
  - System uptime

- **Network Information**
  - Available network interfaces
  - IP addresses (IPv4 and IPv6)
  - MAC addresses

- **Battery Information** (if available)
  - Charge percentage
  - Charging status
  - Estimated time remaining

## Technical Details

- **Frontend**
  - Next.js with App Router
  - TypeScript
  - Tailwind CSS for styling
  - ShadCN UI components
  - Recharts for data visualization

- **Backend**
  - Next.js API Routes
  - `systeminformation` npm package for cross-platform system metrics

## Getting Started

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the system dashboard.

## Cross-Platform Compatibility

This application is designed to run on:
- Raspberry Pi OS (Debian-based ARM)
- Ubuntu (x64)
- Other Linux distributions (with varying levels of information available)

## Auto-Refresh

The dashboard automatically refreshes system information every 10 seconds to provide real-time monitoring without manual page refreshes.

## Note

This application requires access to system information and may need appropriate permissions to run correctly.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
