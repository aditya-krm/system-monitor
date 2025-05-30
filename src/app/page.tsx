"use client";

import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled for the SystemDashboard component
// This ensures that window and other browser APIs are only accessed on the client
const SystemDashboard = dynamic(() => import('@/components/SystemDashboard'), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SystemDashboard />
    </div>
  );
}
