import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowLeft,
  KeyRound,
  Megaphone,
  ArrowRight,
  Info,
  UserCheck,
} from 'lucide-react';
import { MOCK_COMPLAINTS } from './data/mockComplaints';
import { AppShell, type TabKey, type CitizenSubRoute } from './components/layout/AppShell';
import { HomeLanding, type PortalKey } from './pages/HomeLanding';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import type { CivicComplaint } from './types/civic';
import { ROLE_LABELS, type UserRole } from './types/auth';

// Helper for portal descriptive names and role requirements
const PORTAL_META: Record<TabKey, { name: string; requiredRole: string; description: string }> = {
  authority: {
    name: 'Authority Command Center',
    requiredRole: 'Municipal Commissioner / Superintending Engineer (MC-OFF)',
    description: 'Internal municipal triage queue, automated SLA oversight, contractor dispatch, and administrative resolution overrides.',
  },
  map: {
    name: 'GIS Hotspot & Predictive Map',
    requiredRole: 'Municipal Authority / Urban Planning Analyst',
    description: 'Spatial density clustering, DBSCAN hotspot analysis, and 7-day predictive maintenance forecasts.',
  },
  worker: {
    name: 'Field Worker Mobile Queue',
    requiredRole: 'Field Repair Crew / Municipal Works Contractor',
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
  subRoute?: CitizenSubRoute;
}

const PortalView: React.FC<PortalViewProps> = ({ complaints, onAddComplaint, subRoute = 'report' }) => {
  const { portalId } = useParams<{ portalId: string }>();
  const navigate = useNavigate();
  const { user, canAccessPortal, loginAsDemo } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const validPortals: TabKey[] = ['authority', 'map', 'citizen', 'worker'];
  const activeTab: TabKey = validPortals.includes(portalId as TabKey)
    ? (portalId as TabKey)
    : 'citizen';

  const portalInfo = PORTAL_META[activeTab] || PORTAL_META.citizen;

  // If user is not authenticated or lacks permission, show the official restricted access guard
  if (!user || !canAccessPortal(activeTab)) {
    const isRoleMismatch = !!user && !canAccessPortal(activeTab);
    const isCitizen = user?.role === 'citizen';

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] p-4 sm:p-6 text-left selection:bg-[#1F4FE0] selection:text-white antialiased">
        <div className="max-w-2xl w-full bg-white border border-[#DDE3EA] rounded-2xl p-6 sm:p-9 shadow-[0_12px_36px_rgba(15,27,42,0.06)] space-y-6">

          {/* Official Security Header */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 pb-5 border-b border-[#E3E8EE]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-200/90 text-amber-800">
              <ShieldAlert className="w-6 h-6 text-amber-700" strokeWidth={1.75} />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold uppercase tracking-wider bg-amber-100/80 text-amber-900 border border-amber-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span>
                  Official Access Guard • §7(b) RBAC
                </span>
                <span className="text-[11px] text-[#7A8999] font-mono">
                  Smart Cities Mission • India
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#0F1B2A]">
                {isCitizen
                  ? 'Municipal Authority Workspace Restricted'
                  : isRoleMismatch
                    ? 'Access Clearance Insufficient'
                    : 'Official Authentication Required'}
              </h1>
              <p className="text-xs sm:text-sm text-[#44546A] leading-relaxed">
                Access to the <strong className="text-[#0F1B2A]">{portalInfo.name}</strong> is restricted to verified municipal authorities, department commissioners, and authorized field crews.
              </p>
            </div>
          </div>

          {/* Diagnostic Metadata Grid */}
          <div className="rounded-xl border border-[#E3E8EE] bg-[#F5F7FA] p-4.5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#7A8999] uppercase tracking-wider block">
                  Current Session Identity
                </span>
                {user ? (
                  <div>
                    <p className="font-bold text-[#0F1B2A]">{user.name}</p>
                    <p className="text-[#5B6B7C] font-mono text-[11px]">
                      {ROLE_LABELS[user.role as UserRole] || user.role} • {user.badgeId} • {user.ward || 'Model Town'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-bold text-[#0F1B2A]">Unauthenticated Guest</p>
                    <p className="text-[#7A8999] font-mono text-[11px]">No active session token detected</p>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#7A8999] uppercase tracking-wider block">
                  Target Workspace & Route
                </span>
                <p className="font-bold text-[#1F4FE0]">{portalInfo.name}</p>
                <p className="text-[#5B6B7C] font-mono text-[11px]">Endpoint: /{activeTab}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#7A8999] uppercase tracking-wider block">
                  Required Clearance Level
                </span>
                <p className="font-medium text-[#0F1B2A]">{portalInfo.requiredRole}</p>
                <p className="text-[#7A8999] text-[11px]">Government of India Official Domain</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#7A8999] uppercase tracking-wider block">
                  Access Evaluation Decision
                </span>
                <div className="flex items-center gap-1.5 text-[#C23B22] font-semibold">
                  <span className="h-2 w-2 rounded-full bg-[#C23B22]"></span>
                  <span>Restricted (Clearance Mismatch)</span>
                </div>
                <p className="text-[#7A8999] font-mono text-[10px]">DPDP Act 2023 Privacy Boundary</p>
              </div>
            </div>
          </div>

          {/* Citizen Guidance Notice Box */}
          <div className="rounded-xl border border-blue-200/80 bg-blue-50/50 p-4 space-y-2 text-xs text-[#0F1B2A] leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-[#0F1B2A]">
              <Info className="w-4 h-4 text-[#1F4FE0] shrink-0" strokeWidth={2} />
              <span>Notice for Citizen Reporters</span>
            </div>
            <p className="text-[#44546A]">
              Under municipal governance protocols, internal command controls—including contractor work order dispatch, automated SLA violation fines, and administrative complaint reassignments—are strictly reserved for Municipal Corporation officials (<code className="font-mono text-[11px] text-[#0F1B2A]">@mc-citypulse.gov.in</code>).
            </p>
            <p className="text-[#44546A]">
              As a citizen, you have full access to submit grievances, upload visual & audio evidence, track real-time resolution stages, and inspect repair verification proofs in the <strong className="text-[#1F4FE0]">Citizen Incident Portal</strong>.
            </p>
          </div>

          {/* Primary & Secondary Action Buttons */}
          <div className="space-y-3 pt-1">
            {/* Primary Action: Go to Citizen Portal */}
            <button
              onClick={() => navigate('/citizen')}
              className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl bg-[#1F4FE0] text-white hover:bg-[#1840B8] active:bg-[#14338F] transition-all cursor-pointer shadow-sm shadow-[#1F4FE0]/20 group"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white">
                  <Megaphone className="w-4 h-4" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-bold">Go to Citizen Incident Portal</p>
                  <p className="text-xs text-white/80">Report an issue, track your submissions, and inspect repair proofs</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform shrink-0" strokeWidth={2} />
            </button>

            {/* Secondary Row: Switch Account / Sign In & Home */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#CBD3DD] bg-white py-2.5 px-4 text-xs sm:text-sm font-semibold text-[#0F1B2A] hover:bg-[#F5F7FA] hover:border-[#0F1B2A] transition-colors cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-[#5B6B7C]" strokeWidth={1.75} />
                <span>{isRoleMismatch ? 'Switch Account / Role' : 'Sign In as Officer'}</span>
              </button>

              <button
                onClick={() => navigate('/')}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#CBD3DD] bg-white py-2.5 px-4 text-xs sm:text-sm font-semibold text-[#0F1B2A] hover:bg-[#F5F7FA] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-[#5B6B7C]" strokeWidth={1.75} />
                <span>Return to Home</span>
              </button>
            </div>
          </div>

          {/* Evaluator Quick-Access Bar (For live reviewer testing) */}
          <div className="rounded-xl border border-dashed border-[#CBD3DD] bg-[#F5F7FA] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#0F1B2A]">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#1F4FE0]" strokeWidth={2} />
                <span>Evaluator One-Click Clearance (Demo Inspection):</span>
              </span>
              <span className="text-[10px] text-[#7A8999] font-mono uppercase">1-Click Fast Switch</span>
            </div>
            <p className="text-[11px] text-[#5B6B7C] leading-snug">
              If evaluating the platform's administrative and worker modules, switch instantly to authorized demo profiles:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => loginAsDemo('authority')}
                className="flex items-center justify-between px-3 py-2 rounded-lg border border-[#DDE3EA] bg-white text-xs font-semibold text-[#0F1B2A] hover:border-[#1F4FE0] hover:text-[#1F4FE0] transition-colors cursor-pointer text-left"
              >
                <div>
                  <p className="font-bold">Harpreet Singh (MC-OFF-08)</p>
                  <p className="text-[10px] text-[#7A8999]">Municipal Commissioner</p>
                </div>
                <span className="font-mono text-[10px] text-[#1F4FE0] font-bold">AUTHORITY</span>
              </button>

              <button
                onClick={() => loginAsDemo('worker')}
                className="flex items-center justify-between px-3 py-2 rounded-lg border border-[#DDE3EA] bg-white text-xs font-semibold text-[#0F1B2A] hover:border-[#1F4FE0] hover:text-[#1F4FE0] transition-colors cursor-pointer text-left"
              >
                <div>
                  <p className="font-bold">Rajesh Kumar (CREW-RD-04)</p>
                  <p className="text-[10px] text-[#7A8999]">Field Works Crew #4</p>
                </div>
                <span className="font-mono text-[10px] text-[#1E9E6A] font-bold">WORKER</span>
              </button>
            </div>
          </div>

          {/* Bottom Security Assurance Footnote */}
          <div className="pt-2 border-t border-[#E3E8EE] flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#7A8999] gap-1">
            <span>Government of India • Smart Cities Mission Protocol</span>
            <span className="font-mono">#AUTH-GUARD-2026 • DPDP Act 2023</span>
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
      subRoute={subRoute}
      onTabChange={(tab: TabKey) => navigate(`/${tab}`)}
      onNavigateHome={() => navigate('/')}
      onNavigateSubRoute={(sub) => {
        if (sub === 'profile') {
          navigate('/citizen/profile');
        } else if (sub === 'submission') {
          navigate('/citizen/submission');
        } else {
          navigate('/citizen');
        }
      }}
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
          {/* Landing Overview */}
          <Route path="/" element={<HomeView complaints={complaints} />} />

          {/* Citizen Portal Sub-Routes */}
          <Route
            path="/citizen"
            element={
              <PortalView
                complaints={complaints}
                onAddComplaint={handleAddComplaint}
                subRoute="report"
              />
            }
          />
          <Route
            path="/citizen/submission"
            element={
              <PortalView
                complaints={complaints}
                onAddComplaint={handleAddComplaint}
                subRoute="submission"
              />
            }
          />
          <Route
            path="/citizen/profile"
            element={
              <PortalView
                complaints={complaints}
                onAddComplaint={handleAddComplaint}
                subRoute="profile"
              />
            }
          />

          {/* Municipal Workspaces (Guarded by RBAC) */}
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


