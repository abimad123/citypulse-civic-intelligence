import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { MOCK_COMPLAINTS } from './data/mockComplaints';
import { AppShell, type TabKey } from './components/layout/AppShell';
import { HomeLanding, type PortalKey } from './pages/HomeLanding';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import type { CivicComplaint } from './types/civic';

// Protected Portal View Wrapper
interface PortalViewProps {
  complaints: CivicComplaint[];
}

const PortalView: React.FC<PortalViewProps> = ({ complaints }) => {
  const { portalId } = useParams<{ portalId: string }>();
  const navigate = useNavigate();
  const { user, canAccessPortal } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const validPortals: TabKey[] = ['authority', 'map', 'citizen', 'worker'];
  const activeTab: TabKey = validPortals.includes(portalId as TabKey)
    ? (portalId as TabKey)
    : 'authority';

  // If user is not authenticated or lacks permission, show guard dialog / prompt
  if (!user || !canAccessPortal(activeTab)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F7FA] p-6 text-center">
        <div className="max-w-md w-full bg-white border border-[#DDE3EA] rounded-xl p-8 shadow-sm space-y-4">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-[#EAF0FF] text-2xl text-[#1F4FE0]">
            🔒
          </div>
          <h2 className="text-xl font-bold text-[#0F1B2A]">Authentication Required</h2>
          <p className="text-sm text-[#44546A] leading-relaxed">
            {!user
              ? `You need to sign in to access the ${activeTab} workspace.`
              : `Your current role (${user.role}) is not authorized to access this department portal.`}
          </p>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full rounded-lg bg-[#1F4FE0] py-2.5 text-sm font-semibold text-white hover:bg-[#1840B8] transition-colors"
            >
              {!user ? 'Sign in with Demo Account' : 'Switch Account / Role'}
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full rounded-lg border border-[#CBD3DD] bg-white py-2.5 text-sm font-semibold text-[#0F1B2A] hover:bg-[#F5F7FA] transition-colors"
            >
              Return to Home
            </button>
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
  const [complaints] = useState<CivicComplaint[]>(() => MOCK_COMPLAINTS);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Clean semantic URL structure */}
          <Route path="/" element={<HomeView complaints={complaints} />} />
          <Route path="/:portalId" element={<PortalView complaints={complaints} />} />
          
          {/* Fallback to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
