import React from 'react';
import type { CivicComplaint } from '../../types/civic';
import { useAuth } from '../../context/AuthContext';

export type TabKey = 'authority' | 'map' | 'citizen' | 'worker';

interface AppShellProps {
  complaints: CivicComplaint[];
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onNavigateHome: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  complaints,
  activeTab,
  onTabChange,
  onNavigateHome,
}) => {
  const { user, logout, canAccessPortal } = useAuth();
  const complaintCount = complaints.length;

  const allTabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'authority', label: 'Authority Command', icon: '🏛️' },
    { key: 'map', label: 'GIS Hotspot Map', icon: '🗺️' },
    { key: 'citizen', label: 'Citizen Portal', icon: '📢' },
    { key: 'worker', label: 'Field Worker App', icon: '👷' },
  ];

  // Filter tabs strictly by user's authorized access
  const visibleTabs = allTabs.filter((tab) => canAccessPortal(tab.key));

  const renderContent = () => {
    switch (activeTab) {
      case 'authority':
        return (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Authority Command Center</h2>
                <p className="text-sm text-slate-500">Human-In-The-Loop AI triage & SLA oversight</p>
              </div>
              <span className="font-mono text-sm px-3 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200 tabular-nums">
                Total: {complaintCount} Complaints
              </span>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Active Wards</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">6 Wards</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-700 font-medium uppercase tracking-wider">Pending Review</p>
                <p className="text-2xl font-bold font-mono text-amber-900 mt-1 tabular-nums">{complaintCount}</p>
              </div>
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                <p className="text-xs text-emerald-700 font-medium uppercase tracking-wider">SLA Compliance</p>
                <p className="text-2xl font-bold font-mono text-emerald-900 mt-1 tabular-nums">98.4%</p>
              </div>
            </div>
          </div>
        );
      case 'map':
        return (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">GIS Hotspot Map</h2>
                <p className="text-sm text-slate-500">Geospatial cluster analysis across Ludhiana wards</p>
              </div>
              <span className="font-mono text-sm px-3 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200 tabular-nums">
                {complaintCount} Geocoded Points
              </span>
            </div>
            <div className="mt-6 h-80 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
              <span className="text-3xl mb-2">🗺️</span>
              <p className="font-medium text-slate-600">Pan-India Geospatial Hotspot Map</p>
              <p className="text-xs text-slate-400 mt-1">Showing {complaintCount} geocoded municipal defects across active wards</p>
            </div>
          </div>
        );
      case 'citizen':
        return (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Citizen Reporting Portal</h2>
                <p className="text-sm text-slate-500">Public incident reporting with AI-assisted classification</p>
              </div>
              <span className="font-mono text-sm px-3 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200 tabular-nums">
                Active Reports: {complaintCount}
              </span>
            </div>
            <div className="mt-6 p-6 rounded-lg bg-blue-50 border border-blue-200 text-blue-900">
              <p className="font-medium">File a New Complaint</p>
              <p className="text-sm text-blue-700 mt-1">
                Report potholes, garbage, streetlights, water leaks, or drainage issues in English or Hinglish.
              </p>
            </div>
          </div>
        );
      case 'worker':
        return (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Field Worker Mobile App</h2>
                <p className="text-sm text-slate-500">Field verification, status progression, and after-photo uploads</p>
              </div>
              <span className="font-mono text-sm px-3 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200 tabular-nums">
                Assigned: {complaintCount} Tasks
              </span>
            </div>
            <div className="mt-6 p-6 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
              <p className="font-medium">Work Queue</p>
              <p className="text-sm text-amber-700 mt-1">
                {complaintCount} tickets awaiting field inspection and resolution verification.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800">
      {/* Top Header */}
      <header className="flex h-14 items-center justify-between px-6 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            title="Return to Home Landing"
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-xs group-hover:bg-slate-800 transition-colors">
              CP
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-semibold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  CityPulse AI
                </h1>
                <span className="text-[10px] text-slate-400">↗</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none">Smart Cities Mission • India</p>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-medium text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>AI Pipeline: Online • 98.4% SLA</span>
          </div>

          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
          >
            <span>🏠 Home</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0">
          <div className="p-3 space-y-1">
            {/* Home Navigation Button */}
            <button
              onClick={onNavigateHome}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors mb-2 border border-dashed border-slate-200"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">🏠</span>
                <span>Home & Overview</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">ESC</span>
            </button>

            <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Authorized Portals
            </div>

            {visibleTabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => onTabChange(tab.key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </div>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* User Profile Card & Sign Out */}
          <div className="p-3.5 border-t border-slate-200 bg-slate-50/70 space-y-2">
            {user ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-slate-500 capitalize">
                      {user.role} {user.ward ? `• ${user.ward}` : ''}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-slate-200 bg-white text-slate-700">
                    {user.badgeId}
                  </span>
                </div>

                <button
                  onClick={() => {
                    logout();
                    onNavigateHome();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                >
                  <span>Sign out</span>
                  <span className="text-[10px]">↳</span>
                </button>
              </>
            ) : (
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Guest Viewer</span>
                <span className="font-mono text-[11px] text-slate-400">#IND-2026</span>
              </div>
            )}
          </div>
        </aside>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};
