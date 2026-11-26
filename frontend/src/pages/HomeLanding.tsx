import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CivicComplaint } from '../types/civic';
import { CityDigitalTwin3D } from '../components/home/CityDigitalTwin3D';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from '../components/auth/AuthModal';

export type PortalKey = 'authority' | 'map' | 'citizen' | 'worker';

export interface HomeLandingProps {
  complaints: CivicComplaint[];
  onNavigate?: (portal: PortalKey) => void;
  onSelectPortal?: (portal: PortalKey) => void;
}

/* ---------- small inline icons (no emoji, no extra dependency) ---------- */
const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const IconCitizen = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...stroke}>
    <path d="M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" />
    <circle cx="12" cy="12.5" r="3.5" />
  </svg>
);
const IconAuthority = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...stroke}>
    <path d="M3 9.5 12 4l9 5.5" />
    <path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" />
  </svg>
);
const IconWorker = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...stroke}>
    <path d="M14.5 6.5a4 4 0 0 0-5 5L4 17l3 3 5.5-5.5a4 4 0 0 0 5-5L15.5 12 12 8.5l2.5-2Z" />
  </svg>
);
const IconMap = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...stroke}>
    <path d="m9 5-5 2v12l5-2 6 2 5-2V5l-5 2-6-2Z" />
    <path d="M9 5v12M15 7v12" />
  </svg>
);
const Chevron = () => (
  <svg viewBox="0 0 20 20" width="16" height="16" {...stroke} strokeWidth={1.8}>
    <path d="m8 5 5 5-5 5" />
  </svg>
);

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
.cp-root { font-family: 'Hanken Grotesk', ui-sans-serif, system-ui, sans-serif; }
.cp-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
`;

export const HomeLanding: React.FC<HomeLandingProps> = ({
  complaints,
  onNavigate,
  onSelectPortal,
}) => {
  const { user, logout, canAccessPortal } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingPortal, setPendingPortal] = useState<PortalKey | null>(null);

  const navigateTo = (portal: PortalKey) => {
    // If user is not authenticated or not authorized, prompt sign-in
    if (!user || !canAccessPortal(portal)) {
      setPendingPortal(portal);
      setAuthModalOpen(true);
      return;
    }
    if (onNavigate) onNavigate(portal);
    else if (onSelectPortal) onSelectPortal(portal);
  };

  const handleAuthSuccess = () => {
    if (pendingPortal) {
      const target = pendingPortal;
      setPendingPortal(null);
      if (onNavigate) onNavigate(target);
      else if (onSelectPortal) onSelectPortal(target);
    }
  };

  const totalReports = complaints.length;
  const criticalP1Count = complaints.filter(
    (c) => c.priority === 'P1 Critical' || c.priority.startsWith('P1')
  ).length;

  const [activeStage, setActiveStage] = useState<number>(0);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const portals: {
    key: PortalKey;
    title: string;
    audience: string;
    description: string;
    points: string[];
    action: string;
    icon: React.ReactNode;
  }[] = [
      {
        key: 'citizen',
        title: 'Citizen portal',
        audience: 'Residents',
        description:
          'Report an issue with a photo and a voice note or a few words. Track it from submission to repair.',
        points: [
          'Speak or type in English, Hindi, Punjabi or Hinglish',
          'Defects are outlined on your photo instantly',
          'Follow every status change on your ticket',
        ],
        action: 'Report an issue',
        icon: <IconCitizen />,
      },
      {
        key: 'authority',
        title: 'Command center',
        audience: 'Commissioners and department heads',
        description:
          'Review what the AI triaged, confirm or override it, and watch for tickets about to breach their deadline.',
        points: [
          'Image and text confidence shown side by side',
          'Every override is logged with who, when and why',
          'Tickets go to the right department automatically',
        ],
        action: 'Open command center',
        icon: <IconAuthority />,
      },
      {
        key: 'worker',
        title: 'Field app',
        audience: 'Repair crews',
        description:
          'A mobile work queue ordered by deadline, with routing and photo proof when the job is done.',
        points: [
          'Jobs sorted by how soon they are due',
          'Before and after photos checked by AI',
          'Digital sign-off closes the work order',
        ],
        action: 'Open field app',
        icon: <IconWorker />,
      },
      {
        key: 'map',
        title: 'Hotspot map',
        audience: 'Planners and analysts',
        description:
          'See where problems cluster across wards and where the next ones are likely to appear.',
        points: [
          'Density clustering adjusted for reporting bias',
          'Ward-level heatmaps',
          'Seven-day maintenance forecast',
        ],
        action: 'Open hotspot map',
        icon: <IconMap />,
      },
    ];

  const stages = [
    {
      title: 'Citizen capture',
      model: 'HTML5 Geolocation, EXIF extractor',
      summary:
        'A resident takes a geotagged photo and can add a voice note in English, Hindi, Punjabi, Bengali, Tamil, Telugu, Marathi or Hinglish.',
      technical:
        'Reads device GPS (accuracy under 5 m across all Indian urban jurisdictions), timestamp and orientation. The image is compressed to WebP so it uploads quickly on weak mobile networks.',
    },
    {
      title: 'Defect detection',
      model: 'YOLOv11x-OBB fine-tuned on Pan-India Municipal Datasets',
      summary:
        'Oriented bounding boxes mark the defect type, its size and how severe it looks.',
      technical:
        'Runs inference on five classes: pothole, garbage, streetlight, water leak and drainage across Indian road conditions. Outputs a vision confidence score from 0.00 to 1.00.',
    },
    {
      title: 'Language understanding',
      model: 'XLM-RoBERTa with Pan-Indian Indic-LLM triage classifier',
      summary:
        'Reads code-mixed Hindi, Punjabi, Bengali, Marathi, Tamil and English to find the location and how urgent the report is.',
      technical:
        'Picks out Indian municipal landmarks (e.g. "metro station gate ke paas", "near main chowk") and scores urgency from the wording. The result is combined with the vision score.',
    },
    {
      title: 'Priority scoring',
      model: 'CityPulse fusion engine (vision, language, spatial density)',
      summary:
        'Assigns a priority from P1 critical to P4 low, and a department.',
      technical:
        'Fused score F = 0.55 (vision) + 0.35 (language) + 0.10 (proximity). High-severity defects with a deadline under 12 hours are escalated immediately.',
    },
    {
      title: 'Officer review',
      model: 'Immutable audit-log state machine',
      summary:
        'A municipal officer reviews the triage and either confirms it or overrides it.',
      technical:
        'Each manual action stores the actor, timestamp, old and new values, and a reason code in an append-only audit trail conforming to Smart Cities Mission guidelines.',
    },
    {
      title: 'Crew dispatch',
      model: 'Vehicle routing engine with deadline constraints',
      summary:
        'The work order goes to the nearest ward crew, ordered by priority.',
      technical:
        'Routes are optimised dynamically across city zones and wards to keep strict municipal SLA deadlines met.',
    },
    {
      title: 'Repair proof',
      model: 'Siamese network with structural similarity (SSIM)',
      summary:
        'The crew uploads a photo after the repair and the system compares it with the original.',
      technical:
        'A ticket only moves from "Verification uploaded" to "Resolved" once the pothole fill or garbage clearance is visible in the comparison.',
    },
    {
      title: 'Seven-day forecast',
      model: 'PostGIS ST_ClusterDBSCAN with a temporal random forest',
      summary:
        'Highlights sectors likely to see repeat failures so crews can act before complaints arrive.',
      technical:
        'Normalises for reporting bias using ward population density, and predicts repeat failures up to seven days ahead for municipal corporations nationwide.',
    },
  ];

  const stage = stages[activeStage];

  const stats = [
    { label: 'Open reports', value: String(totalReports), note: 'Across 6 wards' },
    { label: 'Critical (P1)', value: String(criticalP1Count), note: 'Due within 12 hours', alert: true },
    { label: 'Detection accuracy', value: '96.8%', note: 'YOLOv11 on test set' },
    { label: 'Triage time', value: '< 1.4 s', note: 'Photo to priority' },
  ];

  const focus =
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4FE0]';

  return (
    <div className="cp-root min-h-screen bg-white text-[#0F1B2A] antialiased selection:bg-[#1F4FE0] selection:text-white">
      <style>{FONT_CSS}</style>

      {/* Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-200 backdrop-blur-md ${isScrolled
          ? 'border-b border-[#DDE3EA] bg-white/95 shadow-[0_1px_12px_rgba(15,27,42,0.05)]'
          : 'border-b border-[#E3E8EE] bg-white/85'
          }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Brand Logo & Title */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`flex items-center gap-3 text-left transition-opacity hover:opacity-90 ${focus}`}
          >

            <span className="text-[34px] font-semibold tracking-tight text-[#0F1B2A]">
              CityPulse
            </span>
          </button>

          {/* Desktop Centered Segmented Pill Bar with Smooth Sliding Hover */}
          <nav
            className="hidden md:flex items-center rounded-lg border border-[#E3E8EE] bg-[#F5F7FA] p-1"
            aria-label="Portals & navigation"
            onMouseLeave={() => setHoveredNav(null)}
          >
            {([
              { key: 'citizen', label: 'Citizen', type: 'portal' as const },
              { key: 'authority', label: 'Authority', type: 'portal' as const },
              { key: 'map', label: 'GIS map', type: 'portal' as const },
              { key: 'worker', label: 'Field crew', type: 'portal' as const },
              { key: 'pipeline', label: 'Pipeline', type: 'section' as const },
            ]).map((item) => {
              const isHovered = hoveredNav === item.key;
              return (
                <button
                  key={item.key}
                  onMouseEnter={() => setHoveredNav(item.key)}
                  onClick={() => {
                    if (item.type === 'portal') {
                      navigateTo(item.key as PortalKey);
                    } else if (item.type === 'section') {
                      document.getElementById('pipeline')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className={`relative rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${focus} ${isHovered ? 'text-white' : 'text-[#44546A]'
                    }`}
                >
                  {isHovered && (
                    <motion.span
                      layoutId="nav-sliding-pill"
                      transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                      className="absolute inset-0 rounded-md bg-[#1F4FE0] shadow-sm shadow-[#1F4FE0]/25"
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status & Primary Action Group */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-[#E3E8EE] bg-[#F5F7FA] px-3 py-1 text-xs font-medium text-[#44546A]">
              <span className="h-2 w-2 rounded-full bg-[#1E9E6A] animate-pulse" />
              <span>Operational</span>
            </div>

            {user ? (
              <div className="flex items-center gap-2 pl-1">
                <span className="text-xs font-semibold text-[#0F1B2A]">{user.name}</span>
                <span className="cp-mono text-[10px] px-2 py-0.5 rounded-full border border-[#DDE3EA] bg-[#F5F7FA] text-[#44546A] capitalize">
                  {user.role}
                </span>
                <button
                  onClick={logout}
                  className="text-xs text-[#5B6B7C] hover:text-red-600 font-medium px-1.5 py-0.5 transition-colors cursor-pointer"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setPendingPortal(null);
                  setAuthModalOpen(true);
                }}
                className={`rounded-lg border border-[#CBD3DD] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F1B2A] transition-colors hover:bg-[#F5F7FA] cursor-pointer ${focus}`}
              >
                Sign in
              </button>
            )}

            <button
              onClick={() => navigateTo('citizen')}
              className={`group inline-flex items-center gap-1.5 rounded-lg bg-[#1F4FE0] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1840B8] active:bg-[#14338F] ${focus}`}
            >
              <span>Report issue</span>
              <span className="transition-transform duration-150 group-hover:translate-x-0.5">
                <Chevron />
              </span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border border-[#E3E8EE] bg-white text-[#0F1B2A] transition-colors hover:bg-[#F5F7FA] ${focus}`}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" {...stroke} strokeWidth={2}>
                <motion.line
                  x1="4"
                  y1={mobileOpen ? '4' : '7'}
                  x2="20"
                  y2={mobileOpen ? '20' : '7'}
                  animate={{
                    y1: mobileOpen ? 4 : 7,
                    y2: mobileOpen ? 20 : 7,
                  }}
                  transition={{ duration: 0.18 }}
                />
                <motion.line
                  x1="4"
                  y1="12"
                  x2="20"
                  y2="12"
                  animate={{ opacity: mobileOpen ? 0 : 1 }}
                  transition={{ duration: 0.15 }}
                />
                <motion.line
                  x1="4"
                  y1={mobileOpen ? '20' : '17'}
                  x2="20"
                  y2={mobileOpen ? '4' : '17'}
                  animate={{
                    y1: mobileOpen ? 20 : 17,
                    y2: mobileOpen ? 4 : 17,
                  }}
                  transition={{ duration: 0.18 }}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Responsive Mobile Menu Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-[#E3E8EE] bg-white md:hidden"
            >
              <div className="p-4 space-y-3">
                <div className="divide-y divide-[#E3E8EE] rounded-xl border border-[#E3E8EE] bg-[#F5F7FA] overflow-hidden">
                  {portals.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => {
                        setMobileOpen(false);
                        navigateTo(p.key);
                      }}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-[#EAF0FF]/50 ${focus}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#1F4FE0] border border-[#E3E8EE]">
                          {p.icon}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-[#0F1B2A]">{p.title}</p>
                          <p className="text-xs text-[#5B6B7C]">{p.audience}</p>
                        </div>
                      </div>
                      <Chevron />
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between px-2 py-1 text-xs text-[#5B6B7C]">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#1E9E6A]" />
                    <span>All systems operational</span>
                  </div>
                  <span className="cp-mono font-medium">{totalReports} reports</span>
                </div>

                <button
                  onClick={() => {
                    setMobileOpen(false);
                    navigateTo('citizen');
                  }}
                  className={`w-full flex items-center justify-center gap-2 rounded-lg bg-[#1F4FE0] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1840B8] active:bg-[#14338F] ${focus}`}
                >
                  <span>Report an issue</span>
                  <Chevron />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-14 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-[2.6rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-[#0F1B2A] sm:text-[3.4rem]">
              Autonomous civic intelligence for all Indian cities.
            </h1>

            <p className="mt-6 max-w-[34rem] text-[17px] leading-[1.65] text-[#44546A]">
              CityPulse processes citizen photos and voice reports in English, Hindi, Punjabi, Bengali, Marathi, and Tamil across urban local bodies in India. AI prioritizes defects by urgency, dispatches ward crews, and keeps municipal officers in control with immutable audit records.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigateTo('citizen')}
                className={`group inline-flex items-center gap-2 rounded-lg bg-[#1F4FE0] px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#1840B8] active:bg-[#14338F] ${focus}`}
              >
                Report an issue
                <span className="transition-transform group-hover:translate-x-0.5">
                  <Chevron />
                </span>
              </button>
              <button
                onClick={() => navigateTo('authority')}
                className={`inline-flex items-center rounded-lg border border-[#CBD3DD] bg-white px-5 py-3 text-[15px] font-semibold text-[#0F1B2A] transition-colors hover:border-[#0F1B2A] hover:bg-[#F7F9FB] ${focus}`}
              >
                Open command center
              </button>
            </div>

            <dl className="mt-12 grid grid-cols-2 border-t border-[#E3E8EE] sm:grid-cols-4">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className={`py-4 pr-4 ${i > 0 ? 'sm:border-l sm:border-[#E3E8EE] sm:pl-4' : ''}`}
                >
                  <dt className="text-[13px] text-[#5B6B7C]">{s.label}</dt>
                  <dd
                    className={`mt-1 text-2xl font-bold tabular-nums tracking-tight ${s.alert ? 'text-[#C23B22]' : 'text-[#0F1B2A]'
                      }`}
                  >
                    {s.value}
                  </dd>
                  <p className="mt-0.5 text-xs text-[#7A8999]">{s.note}</p>
                </div>
              ))}
            </dl>
          </motion.div>

          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="overflow-hidden rounded-xl border border-[#D5DCE4] bg-[#0B1220]">
              <CityDigitalTwin3D />
            </div>
            <p className="mt-3 text-[13px] text-[#5B6B7C]">
              Interactive 3D Urban Digital Twin. Drag to rotate, select an anomaly beacon to inspect AI detection.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Workspaces */}
      <section id="workspaces" className="border-y border-[#E3E8EE] bg-[#F5F7FA] py-20 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-[-0.02em] sm:text-[2.1rem]">
              One system, four workspaces
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#44546A]">
              Each role sees only what it needs, with permissions set for citizens, officers,
              crews and planners.
            </p>
          </div>

          <div className="mt-10 divide-y divide-[#DDE3EA] overflow-hidden rounded-xl border border-[#DDE3EA] bg-white">
            {portals.map((p) => (
              <button
                key={p.key}
                onClick={() => navigateTo(p.key)}
                className={`group grid w-full gap-6 px-6 py-7 text-left transition-colors hover:bg-[#F9FAFC] md:grid-cols-12 md:items-start ${focus}`}
              >
                <div className="flex items-start gap-4 md:col-span-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF0FF] text-[#1F4FE0]">
                    {p.icon}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">{p.title}</h3>
                    <p className="mt-0.5 text-sm text-[#5B6B7C]">{p.audience}</p>
                  </div>
                </div>

                <p className="text-[15px] leading-relaxed text-[#44546A] md:col-span-4">
                  {p.description}
                </p>

                <div className="flex items-end justify-between gap-4 md:col-span-4">
                  <ul className="space-y-1.5 text-sm text-[#44546A]">
                    {p.points.map((pt) => (
                      <li key={pt} className="flex gap-2">
                        <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[#1F4FE0]" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                  <span className="hidden shrink-0 items-center gap-1 whitespace-nowrap text-sm font-semibold text-[#1F4FE0] lg:flex">
                    {p.action}
                    <span className="transition-transform group-hover:translate-x-0.5">
                      <Chevron />
                    </span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section id="pipeline" className="py-20 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-[-0.02em] sm:text-[2.1rem]">
              How a report becomes a repair
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#44546A]">
              Eight steps, from the first photo to a forecast of where problems will appear next.
              Select a step to see the models and checks behind it.
            </p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-12">
            <ol className="lg:col-span-4" role="tablist" aria-label="Pipeline stages">
              {stages.map((s, i) => {
                const selected = i === activeStage;
                return (
                  <li key={s.title}>
                    <button
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setActiveStage(i)}
                      className={`flex w-full items-center gap-4 border-l-2 px-4 py-3 text-left transition-colors ${focus} ${selected
                        ? 'border-[#1F4FE0] bg-[#F1F5FF]'
                        : 'border-[#E3E8EE] hover:bg-[#F7F9FB]'
                        }`}
                    >
                      <span
                        className={`cp-mono w-5 text-xs tabular-nums ${selected ? 'text-[#1F4FE0]' : 'text-[#8795A5]'
                          }`}
                      >
                        {i + 1}
                      </span>
                      <span
                        className={`text-[15px] ${selected ? 'font-semibold text-[#0F1B2A]' : 'font-medium text-[#44546A]'
                          }`}
                      >
                        {s.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStage}
                  role="tabpanel"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="h-full rounded-xl border border-[#DDE3EA] bg-[#F5F7FA] p-7"
                >
                  <p className="text-sm text-[#5B6B7C]">
                    Step {activeStage + 1} of {stages.length}
                  </p>
                  <h3 className="mt-1 text-2xl font-bold tracking-tight">{stage.title}</h3>
                  <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-[#2B3A4D]">
                    {stage.summary}
                  </p>

                  <dl className="mt-8 grid gap-6 border-t border-[#DDE3EA] pt-6 md:grid-cols-2">
                    <div>
                      <dt className="text-sm font-semibold text-[#0F1B2A]">Model</dt>
                      <dd className="cp-mono mt-2 text-[13px] leading-relaxed text-[#44546A]">
                        {stage.model}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-semibold text-[#0F1B2A]">What it checks</dt>
                      <dd className="mt-2 text-sm leading-relaxed text-[#44546A]">
                        {stage.technical}
                      </dd>
                    </div>
                  </dl>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Pre-Footer Callout Strip */}
      <section className="border-t border-[#E3E8EE] bg-white py-14">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#0F1B2A]">
              Ready to report an issue or review live ward triage?
            </h2>
            <p className="mt-2 text-[15px] text-[#44546A]">
              Submit geotagged photos or open the municipal command center to manage SLA deadlines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => navigateTo('citizen')}
              className={`group inline-flex items-center gap-2 rounded-lg bg-[#1F4FE0] px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#1840B8] active:bg-[#14338F] ${focus}`}
            >
              Report an issue
              <span className="transition-transform group-hover:translate-x-0.5">
                <Chevron />
              </span>
            </button>
            <button
              onClick={() => navigateTo('authority')}
              className={`inline-flex items-center rounded-lg border border-[#CBD3DD] bg-white px-5 py-3 text-[15px] font-semibold text-[#0F1B2A] transition-colors hover:border-[#0F1B2A] hover:bg-[#F7F9FB] ${focus}`}
            >
              Open command center
            </button>
          </div>
        </div>
      </section>

      {/* Main Architectural Footer */}
      <footer className="border-t border-[#E3E8EE] bg-[#F5F7FA] py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 md:grid-cols-12">
            {/* Brand Column */}
            <div className="md:col-span-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0F1B2A] text-[13px] font-bold text-white">
                  CP
                </div>
                <span className="text-[15px] font-semibold tracking-tight text-[#0F1B2A]">CityPulse</span>
              </div>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#44546A]">
                National civic intelligence and multimodal infrastructure triage for Indian municipal corporations. Combining computer vision, Indic language triage, and spatial predictive maintenance.
              </p>

            </div>

            {/* Workspaces Column */}
            <div className="md:col-span-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F1B2A]">Workspaces</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <button
                    onClick={() => navigateTo('citizen')}
                    className={`text-sm text-[#44546A] hover:text-[#0F1B2A] transition-colors text-left ${focus}`}
                  >
                    Citizen portal
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('authority')}
                    className={`text-sm text-[#44546A] hover:text-[#0F1B2A] transition-colors text-left ${focus}`}
                  >
                    Command center
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('worker')}
                    className={`text-sm text-[#44546A] hover:text-[#0F1B2A] transition-colors text-left ${focus}`}
                  >
                    Field app
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('map')}
                    className={`text-sm text-[#44546A] hover:text-[#0F1B2A] transition-colors text-left ${focus}`}
                  >
                    Hotspot map
                  </button>
                </li>
              </ul>
            </div>

            {/* Pipeline & Models Column */}
            <div className="md:col-span-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F1B2A]">Pipeline & Models</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <button
                    onClick={() => {
                      setActiveStage(1);
                      document.getElementById('pipeline')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`text-sm text-[#44546A] hover:text-[#0F1B2A] transition-colors text-left ${focus}`}
                  >
                    Defect detection (YOLOv11x)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveStage(2);
                      document.getElementById('pipeline')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`text-sm text-[#44546A] hover:text-[#0F1B2A] transition-colors text-left ${focus}`}
                  >
                    Language triage (XLM-RoBERTa)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveStage(4);
                      document.getElementById('pipeline')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`text-sm text-[#44546A] hover:text-[#0F1B2A] transition-colors text-left ${focus}`}
                  >
                    Officer audit log
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveStage(7);
                      document.getElementById('pipeline')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`text-sm text-[#44546A] hover:text-[#0F1B2A] transition-colors text-left ${focus}`}
                  >
                    Seven-day PostGIS forecast
                  </button>
                </li>
              </ul>
            </div>

            {/* Governance & Standards Column */}
            <div className="md:col-span-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F1B2A]">Governance & Standards</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-[#44546A]">
                <li>DPDP Act 2023 metadata stripping</li>
                <li>Append-only HITL audit trail</li>
                <li>Smart Cities Mission SLA tracking</li>
              </ul>
            </div>
          </div>

          {/* Bottom Legal & Telemetry Bar */}
          <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-[#DDE3EA] pt-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs text-[#5B6B7C]">
                CityPulse AI • National Smart City Infrastructure Intelligence
              </p>
              <p className="mt-1 text-xs text-[#7A8999]">
                Delhi NCR • Mumbai • Bengaluru • Ludhiana • Hyderabad • Ahmedabad • Pune • Chennai
              </p>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`text-xs font-semibold text-[#1F4FE0] hover:text-[#1840B8] transition-colors ${focus}`}
              >
                Back to top ↑
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Role-Based Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        targetPortal={pendingPortal}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};