import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  User,
  ShieldCheck,
  Wrench,
  X,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPortal?: string | null;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  targetPortal,
  onSuccess,
}) => {
  const { login, loginAsDemo, registerCitizen } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  // Sign In Form State & Errors
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signInErrors, setSignInErrors] = useState<{ email?: string; password?: string }>({});

  // Citizen Sign Up Form State & Errors
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpErrors, setSignUpErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  if (!isOpen) return null;

  const handleDemoLogin = (role: UserRole) => {
    loginAsDemo(role);
    onClose();
    if (onSuccess) onSuccess();
  };

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { email?: string; password?: string } = {};

    if (!signInEmail.trim()) {
      errors.email = 'Please enter your email address.';
    } else if (!validateEmail(signInEmail.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!signInPassword) {
      errors.password = 'Please enter your password.';
    }

    if (Object.keys(errors).length > 0) {
      setSignInErrors(errors);
      return;
    }

    setSignInErrors({});
    login(signInEmail.trim());
    onClose();
    if (onSuccess) onSuccess();
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; email?: string; password?: string } = {};

    if (!signUpName.trim()) {
      errors.name = 'Please enter your full name.';
    }

    if (!signUpEmail.trim()) {
      errors.email = 'Please enter your email address.';
    } else if (!validateEmail(signUpEmail.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!signUpPassword) {
      errors.password = 'Please create a password.';
    } else if (signUpPassword.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (Object.keys(errors).length > 0) {
      setSignUpErrors(errors);
      return;
    }

    setSignUpErrors({});
    registerCitizen(signUpName.trim(), signUpEmail.trim());
    onClose();
    if (onSuccess) onSuccess();
  };

  const getPortalRequirementNote = () => {
    if (!targetPortal) return null;
    if (targetPortal === 'authority' || targetPortal === 'map') {
      return {
        role: 'Municipal Officer',
        text: 'Sign in as a Municipal Officer to access the Command Center and GIS Hotspot Map.',
        recommendedRole: 'authority' as UserRole,
      };
    }
    if (targetPortal === 'worker') {
      return {
        role: 'Field Repair Crew',
        text: 'Sign in as Field Crew to access the mobile work dispatch queue.',
        recommendedRole: 'worker' as UserRole,
      };
    }
    return {
      role: 'Citizen',
      text: 'Sign in to file reports with instant AI defect triage and track status.',
      recommendedRole: 'citizen' as UserRole,
    };
  };

  const requirement = getPortalRequirementNote();

  const evaluatorAccounts = [
    {
      role: 'citizen' as UserRole,
      label: 'Citizen',
      sub: 'Public issue reporting & tracking',
      badge: 'CIT-1042',
      icon: <User className="w-4 h-4 text-[#1F4FE0]" />,
    },
    {
      role: 'authority' as UserRole,
      label: 'Municipal Officer',
      sub: 'HITL triage & SLA governance',
      badge: 'MC-OFF-08',
      icon: <ShieldCheck className="w-4 h-4 text-[#1F4FE0]" />,
    },
    {
      role: 'worker' as UserRole,
      label: 'Field Crew',
      sub: 'Repair dispatch & verification',
      badge: 'CREW-04',
      icon: <Wrench className="w-4 h-4 text-[#1F4FE0]" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1B2A]/45 backdrop-blur-xs">
      {/* Modal Container: Split-Pane Architectural Layout */}
      <div
        className="w-full max-w-[820px] overflow-hidden rounded-2xl border border-[#DDE3EA] bg-white shadow-2xl transition-all"
        role="dialog"
        aria-modal="true"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
          {/* Left Context Panel (Desktop) */}
          <div className="hidden md:flex md:col-span-5 flex-col justify-between bg-[#F5F7FA] border-r border-[#E3E8EE] p-7">
            {/* Top branding */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">

                <span className="text-lg font-semibold tracking-tight text-[#0F1B2A]">
                  CityPulse
                </span>
              </div>
              <h3 className="text-lg font-bold tracking-tight text-[#0F1B2A] leading-snug pt-1">
                Civic intelligence, built for accountability.
              </h3>
            </div>

            {/* Middle value props */}
            <div className="space-y-3.5 my-6">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#1F4FE0] shrink-0 mt-0.5" />
                <span className="text-xs text-[#44546A] leading-relaxed">
                  Instant AI triage from a single photo
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#1F4FE0] shrink-0 mt-0.5" />
                <span className="text-xs text-[#44546A] leading-relaxed">
                  Automatic GPS & ward detection on report
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#1F4FE0] shrink-0 mt-0.5" />
                <span className="text-xs text-[#44546A] leading-relaxed">
                  DPDP Act 2023 privacy & metadata stripping
                </span>
              </div>
            </div>

            {/* Bottom: Evaluator Quick Access (1-Click) */}
            <div className="border-t border-[#DDE3EA] pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6B7C]">
                  Evaluator Quick Access
                </span>
                <span className="cp-mono text-[10px] text-[#1E9E6A] font-medium">1-Click</span>
              </div>

              <div className="space-y-1.5">
                {evaluatorAccounts.map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleDemoLogin(item.role)}
                    className="w-full flex items-center justify-between rounded-lg border border-[#E3E8EE] bg-white p-2 text-left transition-all hover:border-[#1F4FE0] hover:bg-[#F9FAFC] cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#F5F7FA] border border-[#E3E8EE]">
                        {item.icon}
                      </div>
                      <div className="min-w-0 pr-1">
                        <p className="text-xs font-semibold text-[#0F1B2A] truncate">
                          {item.label}
                        </p>
                        <p className="text-[10px] text-[#7A8999] truncate">{item.sub}</p>
                      </div>
                    </div>
                    <span className="cp-mono text-[10px] text-[#5B6B7C] group-hover:text-[#1F4FE0] font-medium shrink-0">
                      {item.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="md:col-span-7 bg-white p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Header with Title and Close Button */}
              <div className="flex items-start justify-between pb-4">
                <div>
                  <h2 className="text-lg font-bold text-[#0F1B2A]">Welcome to CityPulse</h2>
                  <p className="text-xs text-[#5B6B7C] mt-0.5">
                    {tab === 'signin'
                      ? 'Sign in to access your municipal workspace'
                      : 'Create your citizen account in seconds'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5B6B7C] hover:bg-[#F5F7FA] hover:text-[#0F1B2A] transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Target Portal Banner if directed */}
              {requirement && (
                <div className="mb-4 rounded-lg border border-[#E3E8EE] bg-[#F5F7FA] p-3 text-xs text-[#44546A]">
                  <p className="font-semibold text-[#0F1B2A]">
                    {requirement.role} Access Required
                  </p>
                  <p className="mt-0.5 leading-relaxed text-[#5B6B7C]">{requirement.text}</p>
                </div>
              )}

              {/* Mobile Quick Evaluator Buttons (< md only) */}
              <div className="block md:hidden mb-4 p-3 rounded-xl border border-[#E3E8EE] bg-[#F5F7FA] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6B7C] block">
                  Quick Demo Access (1-Click)
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('citizen')}
                    className="rounded-lg border border-[#E3E8EE] bg-white py-1.5 text-center text-xs font-semibold text-[#0F1B2A] hover:border-[#1F4FE0]"
                  >
                    Citizen
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('authority')}
                    className="rounded-lg border border-[#E3E8EE] bg-white py-1.5 text-center text-xs font-semibold text-[#0F1B2A] hover:border-[#1F4FE0]"
                  >
                    Officer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('worker')}
                    className="rounded-lg border border-[#E3E8EE] bg-white py-1.5 text-center text-xs font-semibold text-[#0F1B2A] hover:border-[#1F4FE0]"
                  >
                    Crew
                  </button>
                </div>
              </div>

              {/* Framer Motion Sliding Mode Switcher */}
              <div className="relative flex rounded-lg border border-[#E3E8EE] bg-[#F5F7FA] p-1 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setTab('signin');
                    setSignInErrors({});
                    setSignUpErrors({});
                  }}
                  className={`relative flex-1 py-1.5 text-xs font-semibold transition-colors cursor-pointer text-center z-10 ${tab === 'signin' ? 'text-[#0F1B2A]' : 'text-[#5B6B7C] hover:text-[#0F1B2A]'
                    }`}
                >
                  {tab === 'signin' && (
                    <motion.span
                      layoutId="auth-tab-pill"
                      transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                      className="absolute inset-0 rounded-md bg-white border border-[#E3E8EE] shadow-xs"
                    />
                  )}
                  <span className="relative z-10">Sign in</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTab('signup');
                    setSignInErrors({});
                    setSignUpErrors({});
                  }}
                  className={`relative flex-1 py-1.5 text-xs font-semibold transition-colors cursor-pointer text-center z-10 ${tab === 'signup' ? 'text-[#0F1B2A]' : 'text-[#5B6B7C] hover:text-[#0F1B2A]'
                    }`}
                >
                  {tab === 'signup' && (
                    <motion.span
                      layoutId="auth-tab-pill"
                      transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                      className="absolute inset-0 rounded-md bg-white border border-[#E3E8EE] shadow-xs"
                    />
                  )}
                  <span className="relative z-10">New Citizen</span>
                </button>
              </div>

              {/* Form Panels with AnimatePresence */}
              <AnimatePresence mode="wait">
                {tab === 'signin' ? (
                  <motion.form
                    key="signin-form"
                    noValidate
                    onSubmit={handleSignInSubmit}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-[#0F1B2A] mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={signInEmail}
                        onChange={(e) => {
                          setSignInEmail(e.target.value);
                          if (signInErrors.email) setSignInErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        placeholder="name@mc-citypulse.gov.in or citizen@gmail.com"
                        className={`w-full rounded-lg border px-3 py-2 text-sm text-[#0F1B2A] placeholder:text-[#8795A5] transition-colors focus:outline-none ${signInErrors.email
                          ? 'border-[#C23B22] focus:border-[#C23B22] focus:ring-1 focus:ring-[#C23B22]'
                          : 'border-[#CBD3DD] focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0]'
                          }`}
                      />
                      {signInErrors.email && (
                        <p className="text-xs text-[#C23B22] mt-1.5">{signInErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-[#0F1B2A]">Password</label>
                      </div>
                      <div className="relative">
                        <input
                          type={showSignInPassword ? 'text' : 'password'}
                          value={signInPassword}
                          onChange={(e) => {
                            setSignInPassword(e.target.value);
                            if (signInErrors.password) setSignInErrors((prev) => ({ ...prev, password: undefined }));
                          }}
                          placeholder="••••••••"
                          className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm text-[#0F1B2A] placeholder:text-[#8795A5] transition-colors focus:outline-none ${signInErrors.password
                            ? 'border-[#C23B22] focus:border-[#C23B22] focus:ring-1 focus:ring-[#C23B22]'
                            : 'border-[#CBD3DD] focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0]'
                            }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignInPassword(!showSignInPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A8999] hover:text-[#0F1B2A] transition-colors"
                          aria-label={showSignInPassword ? 'Hide password' : 'Show password'}
                        >
                          {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {signInErrors.password && (
                        <p className="text-xs text-[#C23B22] mt-1.5">{signInErrors.password}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#1F4FE0] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1840B8] active:bg-[#14338F] cursor-pointer mt-1"
                    >
                      <span>Sign in to workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="signup-form"
                    noValidate
                    onSubmit={handleSignUpSubmit}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-3.5"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-[#0F1B2A] mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={signUpName}
                        onChange={(e) => {
                          setSignUpName(e.target.value);
                          if (signUpErrors.name) setSignUpErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        placeholder="Arjun Sharma"
                        className={`w-full rounded-lg border px-3 py-2 text-sm text-[#0F1B2A] placeholder:text-[#8795A5] transition-colors focus:outline-none ${signUpErrors.name
                          ? 'border-[#C23B22] focus:border-[#C23B22] focus:ring-1 focus:ring-[#C23B22]'
                          : 'border-[#CBD3DD] focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0]'
                          }`}
                      />
                      {signUpErrors.name && (
                        <p className="text-xs text-[#C23B22] mt-1.5">{signUpErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0F1B2A] mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={signUpEmail}
                        onChange={(e) => {
                          setSignUpEmail(e.target.value);
                          if (signUpErrors.email) setSignUpErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        placeholder="arjun.sharma@gmail.com"
                        className={`w-full rounded-lg border px-3 py-2 text-sm text-[#0F1B2A] placeholder:text-[#8795A5] transition-colors focus:outline-none ${signUpErrors.email
                          ? 'border-[#C23B22] focus:border-[#C23B22] focus:ring-1 focus:ring-[#C23B22]'
                          : 'border-[#CBD3DD] focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0]'
                          }`}
                      />
                      {signUpErrors.email && (
                        <p className="text-xs text-[#C23B22] mt-1.5">{signUpErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0F1B2A] mb-1">
                        Create Password
                      </label>
                      <div className="relative">
                        <input
                          type={showSignUpPassword ? 'text' : 'password'}
                          value={signUpPassword}
                          onChange={(e) => {
                            setSignUpPassword(e.target.value);
                            if (signUpErrors.password) setSignUpErrors((prev) => ({ ...prev, password: undefined }));
                          }}
                          placeholder="At least 6 characters"
                          className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm text-[#0F1B2A] placeholder:text-[#8795A5] transition-colors focus:outline-none ${signUpErrors.password
                            ? 'border-[#C23B22] focus:border-[#C23B22] focus:ring-1 focus:ring-[#C23B22]'
                            : 'border-[#CBD3DD] focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0]'
                            }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A8999] hover:text-[#0F1B2A] transition-colors"
                          aria-label={showSignUpPassword ? 'Hide password' : 'Show password'}
                        >
                          {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {signUpErrors.password && (
                        <p className="text-xs text-[#C23B22] mt-1.5">{signUpErrors.password}</p>
                      )}
                    </div>

                    {/* Calm automatic ward / GPS detection note */}
                    <p className="text-[11px] text-[#5B6B7C] leading-normal pt-0.5">
                      Your municipal ward and GPS coordinates are detected automatically when you report an issue.
                    </p>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#1F4FE0] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1840B8] active:bg-[#14338F] cursor-pointer mt-1"
                    >
                      <span>Create citizen account</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom note */}
            <p className="text-[11px] text-[#7A8999] text-center pt-4 border-t border-[#E3E8EE] mt-6">
              DPDP Act 2023 Compliant • Automatic EXIF metadata anonymization
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
