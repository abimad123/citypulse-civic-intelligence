import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  CheckCircle2,
  Save,
  Lock,
  Phone,
  Mail,
  MapPin,
  Globe,
  Bell,
  Eye,
  FileCheck2,
  Award,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { CivicComplaint } from '../types/civic';

interface CitizenProfileProps {
  complaints: CivicComplaint[];
}

export const CitizenProfile: React.FC<CitizenProfileProps> = ({ complaints }) => {
  const { user, updateUserPreferences } = useAuth();

  const prefs = user?.preferences || {};

  // Form states
  const [name, setName] = useState(user?.name || 'Arjun Sharma');
  const [email] = useState(user?.email || 'arjun.sharma@gmail.com');
  const [phone, setPhone] = useState(prefs.phone || user?.phone || '9876543210');
  const [preferredLanguage, setPreferredLanguage] = useState<'English' | 'Hindi' | 'Punjabi' | 'Hinglish'>(
    prefs.preferredLanguage || 'English'
  );
  const [stateVal, setStateVal] = useState(prefs.state || 'Punjab');
  const [district, setDistrict] = useState(prefs.district || 'Ludhiana');
  const [city, setCity] = useState(prefs.city || 'Ludhiana Municipal Corporation');
  const [ward, setWard] = useState(prefs.ward || user?.ward || 'Model Town');
  const [pincode, setPincode] = useState(prefs.pincode || '141002');
  const [landmark, setLandmark] = useState(prefs.landmark || 'Near Gol Market Chowk, opposite SBI branch');

  // Privacy and Notification Toggles
  const [autoStripMetadata, setAutoStripMetadata] = useState(prefs.autoStripMetadata ?? true);
  const [smsWhatsappAlerts, setSmsWhatsappAlerts] = useState(prefs.smsWhatsappAlerts ?? true);
  const [anonymousLeaderboard, setAnonymousLeaderboard] = useState(prefs.anonymousLeaderboard ?? false);

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Impact metrics computed dynamically
  const reportsFiled = complaints.length;
  const resolvedIssues = complaints.filter((c) => c.stage === 'Resolved' || c.stage === 'Closed').length;
  const communityEndorsements = 14; // Derived civic contribution score

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserPreferences(
      {
        phone,
        preferredLanguage,
        state: stateVal,
        district,
        city,
        ward,
        pincode,
        landmark,
        autoStripMetadata,
        smsWhatsappAlerts,
        anonymousLeaderboard,
      },
      {
        name,
        ward,
        phone,
      }
    );
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 antialiased pb-12">
      {/* Identity Header Card */}
      <div className="rounded-2xl border border-[#DDE3EA] bg-white p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-[#E3E8EE]">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0F1B2A] text-white text-xl font-bold tracking-tight shadow-sm">
              {name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#0F1B2A]">{name}</h2>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                  <ShieldCheck className="w-3 h-3 text-[#1E9E6A]" />
                  Verified Resident
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#5B6B7C] mt-1 font-mono">
                <span>Citizen ID: {user?.badgeId || 'CIT-1042'}</span>
                <span>•</span>
                <span>{email}</span>
                <span>•</span>
                <span>{ward}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="cp-mono text-xs px-2.5 py-1 rounded-lg bg-[#F5F7FA] border border-[#E3E8EE] text-[#44546A]">
              DPDP Tier-1 Verified
            </span>
          </div>
        </div>

        {/* Personal Impact Metrics */}
        <div className="grid grid-cols-3 gap-3 pt-6">
          <div className="rounded-xl border border-[#E3E8EE] bg-[#F5F7FA] p-4 text-center">
            <span className="text-xs text-[#5B6B7C] font-semibold uppercase tracking-wider block">
              Reports Filed
            </span>
            <span className="text-2xl font-bold cp-mono tabular-nums text-[#0F1B2A] mt-1 block">
              {reportsFiled}
            </span>
            <span className="text-[10px] text-[#7A8999]">Across active wards</span>
          </div>

          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4 text-center">
            <span className="text-xs text-emerald-800 font-semibold uppercase tracking-wider block">
              Resolved Issues
            </span>
            <span className="text-2xl font-bold cp-mono tabular-nums text-emerald-900 mt-1 block">
              {resolvedIssues}
            </span>
            <span className="text-[10px] text-emerald-700">Verified by crews</span>
          </div>

          <div className="rounded-xl border border-[#E3E8EE] bg-[#F5F7FA] p-4 text-center">
            <span className="text-xs text-[#5B6B7C] font-semibold uppercase tracking-wider block">
              Endorsements
            </span>
            <span className="text-2xl font-bold cp-mono tabular-nums text-[#1F4FE0] mt-1 block">
              +{communityEndorsements}
            </span>
            <span className="text-[10px] text-[#7A8999]">Community validations</span>
          </div>
        </div>
      </div>

      {/* Save Success Banner */}
      {savedSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1E9E6A] shrink-0" />
            <span>Profile and default location preferences saved. New reports will auto-populate with these details.</span>
          </div>
        </div>
      )}

      {/* Form: Editable Personal & Address Details */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-2xl border border-[#DDE3EA] bg-white p-6 sm:p-7 space-y-6 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-[#0F1B2A]">Personal & Dispatch Contact Details</h3>
            <p className="text-xs text-[#5B6B7C] mt-0.5">
              Used to mask your phone number for on-ground field engineers when inspecting your reports.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F1B2A] mb-1.5">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[#CBD3DD] px-3 py-2 text-sm text-[#0F1B2A] focus:border-[#1F4FE0] focus:outline-none focus:ring-1 focus:ring-[#1F4FE0] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F1B2A] mb-1.5">Registered Email (Read-only)</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full rounded-xl border border-[#E3E8EE] px-3 py-2 text-sm text-[#7A8999] bg-[#F5F7FA] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F1B2A] mb-1.5">Mobile Number (+91)</label>
              <div className="flex rounded-xl border border-[#CBD3DD] overflow-hidden focus-within:border-[#1F4FE0] focus-within:ring-1 focus-within:ring-[#1F4FE0]">
                <span className="inline-flex items-center px-3 bg-[#F5F7FA] text-xs font-mono font-bold text-[#44546A] border-r border-[#CBD3DD]">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 text-sm cp-mono tabular-nums text-[#0F1B2A] focus:outline-none bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F1B2A] mb-1.5">Preferred Language</label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value as any)}
                className="w-full rounded-xl border border-[#CBD3DD] px-3 py-2 text-sm text-[#0F1B2A] focus:border-[#1F4FE0] focus:outline-none focus:ring-1 focus:ring-[#1F4FE0] bg-white cursor-pointer"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिन्दी)</option>
                <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                <option value="Hinglish">Hinglish</option>
              </select>
            </div>
          </div>
        </div>

        {/* Default Address & Ward Pre-fill */}
        <div className="rounded-2xl border border-[#DDE3EA] bg-white p-6 sm:p-7 space-y-6 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-[#0F1B2A]">Default Municipal Address</h3>
            <p className="text-xs text-[#5B6B7C] mt-0.5">
              These details pre-fill your incident reporting screen for rapid single-click submissions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F1B2A] mb-1.5">State / UT</label>
              <select
                value={stateVal}
                onChange={(e) => setStateVal(e.target.value)}
                className="w-full rounded-xl border border-[#CBD3DD] px-3 py-2 text-sm text-[#0F1B2A] focus:border-[#1F4FE0] focus:outline-none focus:ring-1 focus:ring-[#1F4FE0] bg-white cursor-pointer"
              >
                <option value="Punjab">Punjab</option>
                <option value="Delhi">Delhi NCR</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Telangana">Telangana</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F1B2A] mb-1.5">District</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full rounded-xl border border-[#CBD3DD] px-3 py-2 text-sm text-[#0F1B2A] focus:border-[#1F4FE0] focus:outline-none focus:ring-1 focus:ring-[#1F4FE0] bg-white cursor-pointer"
              >
                <option value="Ludhiana">Ludhiana</option>
                <option value="Amritsar">Amritsar</option>
                <option value="Jalandhar">Jalandhar</option>
                <option value="SAS Nagar (Mohali)">SAS Nagar (Mohali)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F1B2A] mb-1.5">City / Corporation</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-[#CBD3DD] px-3 py-2 text-sm text-[#0F1B2A] focus:border-[#1F4FE0] focus:outline-none focus:ring-1 focus:ring-[#1F4FE0] bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F1B2A] mb-1.5">Default Ward</label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full rounded-xl border border-[#CBD3DD] px-3 py-2 text-sm text-[#0F1B2A] focus:border-[#1F4FE0] focus:outline-none focus:ring-1 focus:ring-[#1F4FE0] bg-white cursor-pointer"
              >
                <option value="Model Town">Model Town (Ward 34)</option>
                <option value="Sarabha Nagar">Sarabha Nagar (Ward 21)</option>
                <option value="Dugri">Dugri (Ward 48)</option>
                <option value="Gill Road">Gill Road (Ward 12)</option>
                <option value="Focal Point">Focal Point (Ward 07)</option>
                <option value="Civil Lines">Civil Lines (Ward 19)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F1B2A] mb-1.5">6-Digit PIN Code</label>
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="141002"
                className="w-full rounded-xl border border-[#CBD3DD] px-3 py-2 text-sm cp-mono tabular-nums text-[#0F1B2A] focus:border-[#1F4FE0] focus:outline-none focus:ring-1 focus:ring-[#1F4FE0] bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F1B2A] mb-1.5">Nearby Landmark</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Near Gol Market, opposite SBI"
                className="w-full rounded-xl border border-[#CBD3DD] px-3 py-2 text-sm text-[#0F1B2A] focus:border-[#1F4FE0] focus:outline-none focus:ring-1 focus:ring-[#1F4FE0] bg-white"
              />
            </div>
          </div>
        </div>

        {/* Privacy & Notification Controls (DPDP Act 2023) */}
        <div className="rounded-2xl border border-[#DDE3EA] bg-white p-6 sm:p-7 space-y-4 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-[#0F1B2A]">Privacy & Notification Controls</h3>
            <p className="text-xs text-[#5B6B7C] mt-0.5">
              Governed strictly under the Digital Personal Data Protection (DPDP) Act 2023 guidelines.
            </p>
          </div>

          <div className="divide-y divide-[#E3E8EE]">
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#0F1B2A]">Automatic EXIF GPS & Device Metadata Stripping</p>
                <p className="text-xs text-[#5B6B7C] mt-0.5">
                  Removes device camera serial numbers, IMEI, and personal EXIF headers from civic evidence before storage.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoStripMetadata}
                onChange={(e) => setAutoStripMetadata(e.target.checked)}
                className="h-4 w-4 rounded border-[#CBD3DD] text-[#1F4FE0] focus:ring-[#1F4FE0] cursor-pointer"
              />
            </div>

            <div className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#0F1B2A]">SMS & WhatsApp Stage Progress Alerts</p>
                <p className="text-xs text-[#5B6B7C] mt-0.5">
                  Receive notifications when an issue is assigned to field crew or resolution verification photos are uploaded.
                </p>
              </div>
              <input
                type="checkbox"
                checked={smsWhatsappAlerts}
                onChange={(e) => setSmsWhatsappAlerts(e.target.checked)}
                className="h-4 w-4 rounded border-[#CBD3DD] text-[#1F4FE0] focus:ring-[#1F4FE0] cursor-pointer"
              />
            </div>

            <div className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#0F1B2A]">Anonymous Public Leaderboard Display</p>
                <p className="text-xs text-[#5B6B7C] mt-0.5">
                  Mask your name as "Resident ({ward})" on the public civic transparency dashboard.
                </p>
              </div>
              <input
                type="checkbox"
                checked={anonymousLeaderboard}
                onChange={(e) => setAnonymousLeaderboard(e.target.checked)}
                className="h-4 w-4 rounded border-[#CBD3DD] text-[#1F4FE0] focus:ring-[#1F4FE0] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-[#1F4FE0] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1840B8] active:bg-[#14338F] shadow-sm shadow-[#1F4FE0]/25 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
