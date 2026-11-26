import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, KeyRound } from 'lucide-react';
import { MOCK_COMPLAINTS } from './data/mockComplaints';
import { AppShell, type TabKey } from './components/layout/AppShell';
import { HomeLanding, type PortalKey } from './pages/HomeLanding';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import type { CivicComplaint } from './types/civic';
import { ROLE_LABELS, type UserRole } from './types/auth';

// Helper for portal descriptive names and role requirements
const PORTAL_META: Record<TabKey, { name: string; requiredRole: string; description: string }> = {
  authority: {
    name: 'Authority Command Center',
    requiredRole: 'Municipal Authority (Commissioners & Department Heads)',
    description: 'Human-in-the-Loop AI triage queue, confidence scoring inspection, and SLA oversight.',
  },
  map: {
    name: 'GIS Hotspot & Predictive Map',
    requiredRole: 'Municipal Authority / Urban Analyst',
    description: 'Spatial density clustering, DBSCAN hotspot analysis, and 7-day predictive maintenance forecasts.',
  },
  worker: {
    name: 'Field Worker Mobile Queue',
    requiredRole: 'Field Repair Crew',
    description: 'Work order dispatch, route guidance, and before/after photo verification.',
  },
  citizen: {
    name: 'Citizen Incident Portal',
    requiredRole: 'Citizen Reporter or Municipal Officer',
    description: 'Civic issue filing with automated YOLOv11 defect detection and progress tracking.',
  },
};

// Protected Portal View Wrapper
interface PortalViewProps {
  complaints: CivicComplaint[];
  onAddComplaint: (newComplaint: CivicComplaint) => void;
}

const PortalView: React.FC<PortalViewProps> = ({ complaints, onAddComplaint }) => {
  const { portalId } = useParams<{ portalId: string }>();
  const navigate = useNavigate();
  const { user, canAccessPortal } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const validPortals: TabKey[] = ['authority', 'map', 'citizen', 'worker'];
  const activeTab: TabKey = validPortals.includes(portalId as TabKey)
    ? (portalId as TabKey)
    : 'authority';

  const portalInfo = PORTAL_META[activeTab] || PORTAL_META.authority;

  // If user is not authenticated or lacks permission, show guard dialog / prompt
  if (!user || !canAccessPortal(activeTab)) {
    const isRoleMismatch = !!user && !canAccessPortal(activeTab);

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] p-6 text-left selection:bg-[#1F4FE0] selection:text-white">
        <div className="max-w-[480px] w-full bg-white border border-[#DDE3EA] rounded-2xl p-7 sm:p-8 shadow-[0_4px_24px_rgba(15,27,42,0.06)] space-y-6">
          {/* Top Status Header */}
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-200/80 text-amber-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-amber-100/70 text-amber-800 border border-amber-200">
                Restricted Municipal Portal
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[#0F1B2A]">
                {isRoleMismatch ? 'Access Level Insufficient' : 'Authentication Required'}
              </h2>
            </div>
          </div>

          {/* Context Notice Box */}
          <div className="rounded-xl border border-[#E3E8EE] bg-[#F5F7FA] p-4 space-y-2.5 text-xs text-[#44546A] leading-relaxed">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EE]">
              <span className="font-semibold text-[#0F1B2A]">Target Workspace:</span>
              <span className="font-semibold text-[#1F4FE0]">{portalInfo.name}</span>
            </div>

            <p>
              {isRoleMismatch ? (
                <>
                  You are signed in as{' '}
                  <strong className="text-[#0F1B2A]">
                    {user?.name} ({ROLE_LABELS[user?.role as UserRole] || user?.role})
                  </strong>
                  . This workspace requires <strong className="text-[#0F1B2A]">{portalInfo.requiredRole}</strong> credentials.
                </>
              ) : (
                <>
                  This municipal workspace is restricted. Please sign in with appropriate authority credentials to access live triage and operational records.
                </>
              )}
            </p>

            <p className="text-[11px] text-[#7A8999]">
              {portalInfo.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1F4FE0] py-3 text-sm font-semibold text-white hover:bg-[#1840B8] active:bg-[#14338F] transition-colors cursor-pointer shadow-sm shadow-[#1F4FE0]/25"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isRoleMismatch ? 'Switch Account / Demo Role' : 'Sign In with Authorized Account'}</span>
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#CBD3DD] bg-white py-2.5 text-sm font-semibold text-[#0F1B2A] hover:bg-[#F5F7FA] hover:border-[#0F1B2A] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#5B6B7C]" />
              <span>Return to Home</span>
            </button>
          </div>

          {/* Bottom Security Assurance */}
          <div className="pt-2 border-t border-[#E3E8EE] flex items-center justify-between text-[11px] text-[#7A8999]">
            <span>DPDP Act 2023 Compliant</span>
            <span className="font-mono">#AUTH-GUARD</span>
          </div>
        </div>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          targetPortal={activeTab}
        />
      </div>
    );
  }

  return (
    <AppShell
      complaints={complaints}
      activeTab={activeTab}
      onTabChange={(tab: TabKey) => navigate(`/${tab}`)}
      onNavigateHome={() => navigate('/')}
      onAddComplaint={onAddComplaint}
    />
  );
};

// Home Landing Wrapper
interface HomeViewProps {
  complaints: CivicComplaint[];
}

const HomeView: React.FC<HomeViewProps> = ({ complaints }) => {
  const navigate = useNavigate();

  return (
    <HomeLanding
      complaints={complaints}
      onNavigate={(portal: PortalKey) => navigate(`/${portal}`)}
      onSelectPortal={(portal: PortalKey) => navigate(`/${portal}`)}
    />
  );
};

function App() {
  const [complaints, setComplaints] = useState<CivicComplaint[]>(() => MOCK_COMPLAINTS);

  const handleAddComplaint = (newComplaint: CivicComplaint) => {
    setComplaints((prev) => [newComplaint, ...prev]);
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Clean semantic URL structure */}
          <Route path="/" element={<HomeView complaints={complaints} />} />
          <Route
            path="/:portalId"
            element={
              <PortalView
                complaints={complaints}
                onAddComplaint={handleAddComplaint}
              />
            }
          />

          {/* Fallback to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
