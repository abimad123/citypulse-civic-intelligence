import React, { useState } from 'react';
import {
  Megaphone,
  ShieldCheck,
  MapPin,
  Wrench,
  ArrowLeft,
  LogOut,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  FileCheck2,
  UserCog,
} from 'lucide-react';
import type { CivicComplaint } from '../../types/civic';
import { useAuth } from '../../context/AuthContext';
import { CitizenPortal } from '../../pages/CitizenPortal';
import { CitizenProfile } from '../../pages/CitizenProfile';

export type TabKey = 'authority' | 'map' | 'citizen' | 'worker';
export type CitizenSubRoute = 'report' | 'submission' | 'profile';

interface AppShellProps {
  complaints: CivicComplaint[];
  activeTab: TabKey;
  subRoute?: CitizenSubRoute;
  onTabChange: (tab: TabKey) => void;
  onNavigateHome: () => void;
  onNavigateSubRoute?: (subRoute: CitizenSubRoute) => void;
  onAddComplaint?: (newComplaint: CivicComplaint) => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  complaints,
  activeTab,
  subRoute = 'report',
  onTabChange,
  onNavigateHome,
  onNavigateSubRoute,
  onAddComplaint,
}) => {
  const { user, logout, canAccessPortal } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  const isCitizenMode = activeTab === 'citizen';

  const renderContent = () => {
    switch (activeTab) {
      case 'citizen':
        if (subRoute === 'profile') {
          return <CitizenProfile complaints={complaints} />;
        }
        return (
          <CitizenPortal
            complaints={complaints}
            onAddComplaint={onAddComplaint}
            userName={user?.name}
            userWard={user?.ward}
            userPhone={user?.phone}
            defaultSubTab={subRoute === 'submission' ? 'submission' : 'report'}
            onNavigateSubRoute={(sub) => {
              if (onNavigateSubRoute) {
                onNavigateSubRoute(sub);
              }
            }}
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
      <header className="flex h-14 items-center justify-between px-4 sm:px-6 border-b border-[#E3E8EE] bg-white shrink-0 z-20">
        <div className="flex items-center gap-3">
          {/* Toggle sidebar button when collapsed */}
          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              title="Expand sidebar"
              className="p-1.5 rounded-lg border border-[#E3E8EE] text-[#5B6B7C] hover:text-[#0F1B2A] hover:bg-[#F5F7FA] transition-colors cursor-pointer"
            >
              <PanelLeftOpen className="w-4 h-4" strokeWidth={1.75} />
            </button>
          )}

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
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/70 px-3 py-1 text-xs font-semibold text-emerald-800">
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

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            isCollapsed ? 'w-[68px]' : 'w-64'
          } border-r border-[#E3E8EE] bg-white flex flex-col justify-between shrink-0 transition-[width] duration-200 ease-in-out`}
        >
          <div className="p-3 space-y-1">
            {/* Home Link & Sidebar Collapse Toggle */}
            <div className="flex items-center justify-between gap-1 mb-2">
              {!isCollapsed ? (
                <>
                  <button
                    onClick={onNavigateHome}
                    className="flex-1 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#5B6B7C] hover:bg-[#F5F7FA] hover:text-[#0F1B2A] transition-colors border border-dashed border-[#CBD3DD] cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowLeft className="w-3.5 h-3.5 text-[#7A8999]" strokeWidth={1.75} />
                      <span>Home & Overview</span>
                    </div>
                    <span className="text-[10px] text-[#7A8999] font-mono">ESC</span>
                  </button>

                  <button
                    onClick={() => setIsCollapsed(true)}
                    title="Collapse sidebar"
                    className="p-2 rounded-lg text-[#7A8999] hover:text-[#0F1B2A] hover:bg-[#F5F7FA] transition-colors cursor-pointer shrink-0"
                  >
                    <PanelLeftClose className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                </>
              ) : (
                <button
                  onClick={onNavigateHome}
                  title="Return to Home"
                  className="w-full flex items-center justify-center p-2 rounded-lg text-[#5B6B7C] hover:bg-[#F5F7FA] hover:text-[#0F1B2A] transition-colors border border-dashed border-[#CBD3DD] cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-[#7A8999]" strokeWidth={1.75} />
                </button>
              )}
            </div>

            {/* Citizen Sub-Navigation when on Citizen Workspace */}
            {isCitizenMode ? (
              <div className="space-y-1">
                {!isCollapsed && (
                  <div className="px-3 pt-2 pb-1 text-[11px] font-bold text-[#7A8999] uppercase tracking-wider">
                    Citizen Services
                  </div>
                )}

                {/* Sub Tab: Report Incident */}
                <button
                  onClick={() => onNavigateSubRoute?.('report')}
                  title="Report Incident"
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                  } py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    subRoute === 'report'
                      ? 'bg-[#F5F7FA] text-[#0F1B2A] border border-[#DDE3EA] shadow-2xs'
                      : 'text-[#44546A] hover:bg-[#F5F7FA]/70 hover:text-[#0F1B2A]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={subRoute === 'report' ? 'text-[#1F4FE0]' : 'text-[#7A8999]'}>
                      <PlusCircle className="w-4 h-4" strokeWidth={1.75} />
                    </span>
                    {!isCollapsed && <span>Report Incident</span>}
                  </div>
                  {!isCollapsed && subRoute === 'report' && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1F4FE0]"></span>
                  )}
                </button>

                {/* Sub Tab: My Submissions */}
                <button
                  onClick={() => onNavigateSubRoute?.('submission')}
                  title="My Submissions"
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                  } py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    subRoute === 'submission'
                      ? 'bg-[#F5F7FA] text-[#0F1B2A] border border-[#DDE3EA] shadow-2xs'
                      : 'text-[#44546A] hover:bg-[#F5F7FA]/70 hover:text-[#0F1B2A]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={subRoute === 'submission' ? 'text-[#1F4FE0]' : 'text-[#7A8999]'}>
                      <FileCheck2 className="w-4 h-4" strokeWidth={1.75} />
                    </span>
                    {!isCollapsed && <span>My Submissions</span>}
                  </div>
                  {!isCollapsed && (
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-[#E3E8EE] text-[#0F1B2A] font-bold">
                      {complaintCount}
                    </span>
                  )}
                </button>

                {/* Sub Tab: My Profile */}
                <button
                  onClick={() => onNavigateSubRoute?.('profile')}
                  title="Citizen Profile"
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                  } py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    subRoute === 'profile'
                      ? 'bg-[#F5F7FA] text-[#0F1B2A] border border-[#DDE3EA] shadow-2xs'
                      : 'text-[#44546A] hover:bg-[#F5F7FA]/70 hover:text-[#0F1B2A]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={subRoute === 'profile' ? 'text-[#1F4FE0]' : 'text-[#7A8999]'}>
                      <UserCog className="w-4 h-4" strokeWidth={1.75} />
                    </span>
                    {!isCollapsed && <span>Citizen Profile</span>}
                  </div>
                  {!isCollapsed && subRoute === 'profile' && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1F4FE0]"></span>
                  )}
                </button>

                {/* Other Authorized Portals for Authority users viewing Citizen workspace */}
                {visibleTabs.filter((t) => t.key !== 'citizen').length > 0 && (
                  <div className="pt-3">
                    {!isCollapsed && (
                      <div className="px-3 pt-2 pb-1 text-[11px] font-bold text-[#7A8999] uppercase tracking-wider">
                        Other Workspaces
                      </div>
                    )}
                    {visibleTabs
                      .filter((t) => t.key !== 'citizen')
                      .map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => onTabChange(tab.key)}
                          title={tab.label}
                          className={`w-full flex items-center ${
                            isCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                          } py-2 rounded-lg text-xs font-medium text-[#5B6B7C] hover:bg-[#F5F7FA] hover:text-[#0F1B2A] transition-colors cursor-pointer`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-[#7A8999]">{tab.icon}</span>
                            {!isCollapsed && <span>{tab.label}</span>}
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            ) : (
              /* Non-Citizen Workspaces (Authority, Map, Worker) */
              <div className="space-y-1">
                {!isCollapsed && (
                  <div className="px-3 pt-2 pb-1 text-[11px] font-bold text-[#7A8999] uppercase tracking-wider">
                    Authorized Portals
                  </div>
                )}

                {visibleTabs.map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => onTabChange(tab.key)}
                      title={tab.label}
                      className={`w-full flex items-center ${
                        isCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                      } py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#F5F7FA] text-[#0F1B2A] border border-[#DDE3EA] shadow-2xs'
                          : 'text-[#44546A] hover:bg-[#F5F7FA]/70 hover:text-[#0F1B2A]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive ? 'text-[#1F4FE0]' : 'text-[#7A8999]'}>
                          {tab.icon}
                        </span>
                        {!isCollapsed && <span>{tab.label}</span>}
                      </div>
                      {!isCollapsed && isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#1F4FE0]"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* User Profile Card & Sign Out */}
          <div className="p-3 border-t border-[#E3E8EE] bg-[#F5F7FA]/60 space-y-2">
            {user ? (
              <>
                {!isCollapsed ? (
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-[#0F1B2A] truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-[#5B6B7C] capitalize truncate">
                        {user.role} {user.ward ? `• ${user.ward}` : ''}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-[#DDE3EA] bg-white text-[#44546A] font-medium shrink-0">
                      {user.badgeId}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-center" title={`${user.name} (${user.badgeId})`}>
                    <div className="h-8 w-8 rounded-lg bg-[#0F1B2A] text-white flex items-center justify-center font-bold text-xs">
                      {user.name.slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    logout();
                    onNavigateHome();
                  }}
                  title="Sign out"
                  className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md border border-[#CBD3DD] bg-white text-xs font-semibold text-[#C23B22] hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer ${
                    isCollapsed ? 'px-0' : 'px-2'
                  }`}
                >
                  <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
                  {!isCollapsed && <span>Sign out</span>}
                </button>
              </>
            ) : (
              <div className="flex items-center justify-between text-xs text-[#5B6B7C]">
                {!isCollapsed ? (
                  <>
                    <span>Guest Viewer</span>
                    <span className="font-mono text-[11px] text-[#7A8999]">#IND-2026</span>
                  </>
                ) : (
                  <div className="w-full text-center font-mono text-[10px] text-[#7A8999]">
                    GUEST
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Content View with ZERO horizontal overflow */}
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};
