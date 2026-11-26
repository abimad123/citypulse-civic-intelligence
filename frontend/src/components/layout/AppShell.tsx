import React from 'react';
import {
  Megaphone,
  ShieldCheck,
  MapPin,
  Wrench,
  ArrowLeft,
  Activity,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import type { CivicComplaint } from '../../types/civic';
import { useAuth } from '../../context/AuthContext';
import { CitizenPortal } from '../../pages/CitizenPortal';

export type TabKey = 'authority' | 'map' | 'citizen' | 'worker';

interface AppShellProps {
  complaints: CivicComplaint[];
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onNavigateHome: () => void;
  onAddComplaint?: (newComplaint: CivicComplaint) => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  complaints,
  activeTab,
  onTabChange,
  onNavigateHome,
  onAddComplaint,
}) => {
  const { user, logout, canAccessPortal } = useAuth();
  const complaintCount = complaints.length;

  const allTabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    {
      key: 'citizen',
      label: 'Citizen Portal',
      icon: <Megaphone className="w-4 h-4" strokeWidth={1.75} />,
    },
    {
      key: 'authority',
      label: 'Authority Command',
      icon: <ShieldCheck className="w-4 h-4" strokeWidth={1.75} />,
    },
    {
      key: 'map',
      label: 'GIS Hotspot Map',
      icon: <MapPin className="w-4 h-4" strokeWidth={1.75} />,
    },
    {
      key: 'worker',
      label: 'Field Worker App',
      icon: <Wrench className="w-4 h-4" strokeWidth={1.75} />,
    },
  ];

  // Filter tabs strictly by user's authorized access
  const visibleTabs = allTabs.filter((tab) => canAccessPortal(tab.key));

  const renderContent = () => {
    switch (activeTab) {
      case 'citizen':
        return (
          <CitizenPortal
            complaints={complaints}
            onAddComplaint={onAddComplaint}
            userName={user?.name}
            userWard={user?.ward}
          />
        );

      case 'authority':
        return (
          <div className="rounded-xl border border-[#DDE3EA] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E3E8EE]">
              <div>
                <h2 className="text-xl font-bold text-[#0F1B2A]">Authority Command Center</h2>
                <p className="text-sm text-[#5B6B7C]">Human-In-The-Loop AI triage & SLA oversight</p>
              </div>
              <span className="font-mono text-xs px-3 py-1 bg-[#F5F7FA] text-[#0F1B2A] rounded-md border border-[#E3E8EE] tabular-nums font-semibold">
                Total: {complaintCount} Complaints
              </span>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-[#F5F7FA] border border-[#E3E8EE]">
                <p className="text-xs text-[#5B6B7C] font-semibold uppercase tracking-wider">Active Wards</p>
                <p className="text-2xl font-bold text-[#0F1B2A] mt-1">6 Wards</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50/60 border border-amber-200">
                <p className="text-xs text-amber-800 font-semibold uppercase tracking-wider">Pending Review</p>
                <p className="text-2xl font-bold font-mono text-amber-900 mt-1 tabular-nums">{complaintCount}</p>
              </div>
              <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200">
                <p className="text-xs text-emerald-800 font-semibold uppercase tracking-wider">SLA Compliance</p>
                <p className="text-2xl font-bold font-mono text-emerald-900 mt-1 tabular-nums">98.4%</p>
              </div>
            </div>
          </div>
        );

      case 'map':
        return (
          <div className="rounded-xl border border-[#DDE3EA] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E3E8EE]">
              <div>
                <h2 className="text-xl font-bold text-[#0F1B2A]">GIS Hotspot Map</h2>
                <p className="text-sm text-[#5B6B7C]">Geospatial cluster analysis across active municipal zones</p>
              </div>
              <span className="font-mono text-xs px-3 py-1 bg-[#F5F7FA] text-[#0F1B2A] rounded-md border border-[#E3E8EE] tabular-nums font-semibold">
                {complaintCount} Geocoded Points
              </span>
            </div>
            <div className="mt-6 h-96 rounded-xl border border-dashed border-[#CBD3DD] bg-[#F5F7FA] flex flex-col items-center justify-center text-[#5B6B7C] p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-[#E3E8EE] mb-3 text-[#1F4FE0]">
                <MapPin className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <p className="font-semibold text-sm text-[#0F1B2A]">Pan-India Geospatial Hotspot Map</p>
              <p className="text-xs text-[#5B6B7C] mt-1 max-w-md">
                Showing {complaintCount} geocoded municipal defects with DBSCAN clustering across Ludhiana and regional smart city pilot sectors.
              </p>
            </div>
          </div>
        );

      case 'worker':
        return (
          <div className="rounded-xl border border-[#DDE3EA] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E3E8EE]">
              <div>
                <h2 className="text-xl font-bold text-[#0F1B2A]">Field Worker Mobile Queue</h2>
                <p className="text-sm text-[#5B6B7C]">Field repair inspection, status progression, and photographic resolution proof</p>
              </div>
              <span className="font-mono text-xs px-3 py-1 bg-[#F5F7FA] text-[#0F1B2A] rounded-md border border-[#E3E8EE] tabular-nums font-semibold">
                Assigned: {complaintCount} Tasks
              </span>
            </div>
            <div className="mt-6 p-6 rounded-xl bg-[#F5F7FA] border border-[#E3E8EE] text-[#44546A]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-[#E3E8EE] text-[#1F4FE0]">
                  <Wrench className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#0F1B2A]">Work Queue Active</p>
                  <p className="text-xs text-[#5B6B7C] mt-0.5">
                    {complaintCount} work orders queued by deadline priority for crew dispatch and photographic verification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] text-[#0F1B2A] antialiased selection:bg-[#1F4FE0] selection:text-white">
      {/* Top Header */}
      <header className="flex h-14 items-center justify-between px-6 border-b border-[#E3E8EE] bg-white shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            title="Return to Home Landing"
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0F1B2A] text-white font-bold text-xs group-hover:bg-[#1F4FE0] transition-colors">
              CP
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold tracking-tight text-[#0F1B2A] group-hover:text-[#1F4FE0] transition-colors">
                  CityPulse AI
                </h1>
                <ChevronRight className="w-3.5 h-3.5 text-[#7A8999]" strokeWidth={1.75} />
              </div>
              <p className="text-[10px] text-[#5B6B7C] leading-none">Smart Cities Mission • India</p>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/70 px-3 py-1 text-xs font-semibold text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1E9E6A] animate-pulse"></span>
            <span>AI Pipeline: Online • 98.4% SLA</span>
          </div>

          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 text-[#44546A] hover:text-[#0F1B2A] hover:bg-[#F5F7FA] rounded-lg border border-[#E3E8EE] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#5B6B7C]" strokeWidth={1.75} />
            <span>Home</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-[#E3E8EE] bg-white flex flex-col justify-between shrink-0">
          <div className="p-3 space-y-1">
            {/* Home Navigation Button */}
            <button
              onClick={onNavigateHome}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#5B6B7C] hover:bg-[#F5F7FA] hover:text-[#0F1B2A] transition-colors mb-2 border border-dashed border-[#CBD3DD] cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ArrowLeft className="w-4 h-4 text-[#7A8999]" strokeWidth={1.75} />
                <span>Home & Overview</span>
              </div>
              <span className="text-[10px] text-[#7A8999] font-mono">ESC</span>
            </button>

            <div className="px-3 pt-2 pb-1 text-[11px] font-bold text-[#7A8999] uppercase tracking-wider">
              Authorized Portals
            </div>

            {visibleTabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => onTabChange(tab.key)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#F5F7FA] text-[#0F1B2A] border border-[#DDE3EA] shadow-2xs'
                      : 'text-[#44546A] hover:bg-[#F5F7FA]/70 hover:text-[#0F1B2A]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-[#1F4FE0]' : 'text-[#7A8999]'}>
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </div>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1F4FE0]"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* User Profile Card & Sign Out */}
          <div className="p-3.5 border-t border-[#E3E8EE] bg-[#F5F7FA]/60 space-y-2">
            {user ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-[#0F1B2A] truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-[#5B6B7C] capitalize">
                      {user.role} {user.ward ? `• ${user.ward}` : ''}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-[#DDE3EA] bg-white text-[#44546A] font-medium">
                    {user.badgeId}
                  </span>
                </div>

                <button
                  onClick={() => {
                    logout();
                    onNavigateHome();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md border border-[#CBD3DD] bg-white text-xs font-semibold text-[#C23B22] hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>Sign out</span>
                </button>
              </>
            ) : (
              <div className="flex items-center justify-between text-xs text-[#5B6B7C]">
                <span>Guest Viewer</span>
                <span className="font-mono text-[11px] text-[#7A8999]">#IND-2026</span>
              </div>
            )}
          </div>
        </aside>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};
