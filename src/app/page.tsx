"use client";

import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled for the SystemDashboard component
// This ensures that window and other browser APIs are only accessed on the client
const TabbedSystemDashboard = dynamic(() => import('@/components/TabbedSystemDashboard'), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <TabbedSystemDashboard />
    </div>
  );
}
