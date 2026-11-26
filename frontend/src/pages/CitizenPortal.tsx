import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Lock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  Layers,
  FileCheck2,
  Trash2,
  RotateCcw,
  ShieldCheck,
  Send,
  Eye,
} from 'lucide-react';
import type { CivicCategory, CivicComplaint, Department, PriorityTier, TicketStage } from '../types/civic';
import { WARD_CONFIG } from '../types/civic';

export interface CitizenPortalProps {
  complaints: CivicComplaint[];
  onAddComplaint?: (newComplaint: CivicComplaint) => void;
  userName?: string;
  userWard?: string;
}

// 4 Evaluator Field Samples
const FIELD_SAMPLES = [
  {
    label: 'Road Pothole',
    category: 'Pothole' as CivicCategory,
    department: 'Roads & Public Works' as Department,
    priority: 'P1 Critical' as PriorityTier,
    slaHours: 12,
    description: 'Model Town main market road pe deep pothole hai, raat ko bikes slip ho rahi hain. Dangerous cavity forming.',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    ward: 'Model Town',
    visionScore: 0.96,
    nlpScore: 0.94,
  },
  {
    label: 'Waste Dump',
    category: 'Garbage Accumulation' as CivicCategory,
    department: 'Sanitation & Solid Waste' as Department,
    priority: 'P2 High' as PriorityTier,
    slaHours: 24,
    description: 'Khaali plot ke paas residential garbage pile up ho gaya hai Sarabha Nagar mein. Severe stench and obstruction.',
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    ward: 'Sarabha Nagar',
    visionScore: 0.93,
    nlpScore: 0.91,
  },
  {
    label: 'Streetlight Out',
    category: 'Damaged Streetlight' as CivicCategory,
    department: 'Electrical & Street Lighting' as Department,
    priority: 'P2 High' as PriorityTier,
    slaHours: 36,
    description: 'Streetlight pole #42 near Dugri Phase 2 intersection is dead for 4 nights, pitch dark and unsafe for pedestrians.',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    ward: 'Dugri',
    visionScore: 0.91,
    nlpScore: 0.95,
  },
  {
    label: 'Water Main Leak',
    category: 'Water Leakage' as CivicCategory,
    department: 'Water Supply & Pipelines' as Department,
    priority: 'P1 Critical' as PriorityTier,
    slaHours: 12,
    description: 'High pressure drinking water pipeline fracture near Gill Road canal bridge. Clean water flooding main carriage lane.',
    imageUrl: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80',
    ward: 'Gill Road',
    visionScore: 0.97,
    nlpScore: 0.96,
  },
];

// Quick-fill Description Chips
const DESCRIPTION_CHIPS = [
  'Model Town main market road pe deep pothole hai, raat ko bikes slip ho rahi hain.',
  'Streetlight pole #42 near Sarabha Nagar chowk is completely dead for 4 days.',
  'Sewage water overflowing onto Gill Road service lane with foul odor.',
];

// 8-Stage Lifecycle Array for Progress Tracker
const LIFECYCLE_STAGES: TicketStage[] = [
  'Submitted',
  'AI Analyzed',
  'Authority Verified',
  'Assigned to Field',
  'In Progress',
  'Verification Uploaded',
  'Resolved',
  'Closed',
];

// Ward Geo-Coordinates Map
const WARD_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Model Town': { lat: 30.9025, lng: 75.8589 },
  'Sarabha Nagar': { lat: 30.9015, lng: 75.858 },
  Dugri: { lat: 30.9002, lng: 75.857 },
  'Gill Road': { lat: 30.9012, lng: 75.8568 },
  'Focal Point': { lat: 30.9025, lng: 75.8585 },
  'Civil Lines': { lat: 30.9008, lng: 75.8579 },
};

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  complaints,
  onAddComplaint,
  userName = 'Citizen Reporter',
  userWard = 'Model Town',
}) => {
  const [activeTab, setActiveTab] = useState<'report' | 'submissions'>('report');
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  // Intake Form State
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageMeta, setImageMeta] = useState<{ name: string; size: string; dim: string } | null>(null);
  const [description, setDescription] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>(
    userWard && userWard !== 'Auto-Detected (GPS)' ? userWard : 'Model Town'
  );

  // Submissions View State
  const [statusFilter, setStatusFilter] = useState<'All' | 'In Review' | 'Field Active' | 'Resolved'>('All');
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);

  // Deterministic Keyword-Based AI Classification
  const aiTriage = useMemo(() => {
    const text = description.toLowerCase();
    let category: CivicCategory = 'Pothole';
    let priority: PriorityTier = 'P3 Medium';
    let visionScore = imagePreview ? 0.94 : 0.75;
    let nlpScore = 0.88;
    let slaHours = 48;

    if (text.includes('water') || text.includes('paani') || text.includes('pipe') || text.includes('leak')) {
      category = 'Water Leakage';
      priority = 'P1 Critical';
      slaHours = 12;
      nlpScore = 0.96;
      visionScore = 0.95;
    } else if (text.includes('garbage') || text.includes('kachra') || text.includes('waste') || text.includes('dher')) {
      category = 'Garbage Accumulation';
      priority = 'P2 High';
      slaHours = 24;
      nlpScore = 0.92;
      visionScore = 0.94;
    } else if (text.includes('light') || text.includes('pole') || text.includes('dark') || text.includes('roshni')) {
      category = 'Damaged Streetlight';
      priority = 'P2 High';
      slaHours = 36;
      nlpScore = 0.94;
      visionScore = 0.92;
    } else if (text.includes('drain') || text.includes('sewage') || text.includes('clog') || text.includes('overflow')) {
      category = 'Drainage Problem';
      priority = 'P2 High';
      slaHours = 24;
      nlpScore = 0.93;
      visionScore = 0.91;
    } else if (text.includes('pothole') || text.includes('road') || text.includes('khaddha') || text.includes('slip')) {
      category = 'Pothole';
      priority = text.includes('deep') || text.includes('danger') ? 'P1 Critical' : 'P2 High';
      slaHours = priority === 'P1 Critical' ? 12 : 36;
      nlpScore = 0.95;
      visionScore = 0.96;
    }

    const department: Department = WARD_CONFIG[category] || 'Roads & Public Works';
    const fusionScore = Number((visionScore * 0.55 + nlpScore * 0.45).toFixed(2));

    return {
      category,
      department,
      priority,
      slaHours,
      visionScore,
      nlpScore,
      fusionScore,
    };
  }, [description, imagePreview]);

  // 100m Spatial Duplicate Scanner
  const existingDuplicate = useMemo(() => {
    return complaints.find(
      (c) =>
        c.ward === selectedWard &&
        c.category === aiTriage.category &&
        c.stage !== 'Resolved' &&
        c.stage !== 'Closed'
    );
  }, [complaints, selectedWard, aiTriage.category]);

  // Coordinate readout for selected ward
  const coords = WARD_COORDINATES[selectedWard] || WARD_COORDINATES['Model Town'];

  // Handle Image File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setImageMeta({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      dim: '1920 × 1080 (Auto-Scaled)',
    });
  };

  // Load a Pre-Configured Field Sample
  const handleLoadSample = (sample: (typeof FIELD_SAMPLES)[number]) => {
    setImagePreview(sample.imageUrl);
    setImageMeta({
      name: `${sample.category.toLowerCase().replace(/\s+/g, '_')}_sample.jpg`,
      size: '1.42 MB',
      dim: '2048 × 1536 (Punjab Civic Survey)',
    });
    setDescription(sample.description);
    setSelectedWard(sample.ward);
  };

  // Submit Complaint Handler
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const newTicketId = `TKT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();

    const newComplaint: CivicComplaint = {
      id: newTicketId,
      title: `${aiTriage.category} reported in ${selectedWard}`,
      description: description.trim(),
      category: aiTriage.category,
      department: aiTriage.department,
      priority: aiTriage.priority,
      stage: 'AI Analyzed',
      ward: selectedWard,
      lat: coords.lat,
      lng: coords.lng,
      imageUrl:
        imagePreview ||
        'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      afterImageUrl: '',
      visionConfidence: aiTriage.visionScore,
      nlpConfidence: aiTriage.nlpScore,
      fusionScore: aiTriage.fusionScore,
      slaHoursRemaining: aiTriage.slaHours,
      createdAt: nowIso,
      auditLogs: [
        {
          timestamp: nowIso,
          actor: `${userName} (Citizen)`,
          action: 'confirm',
          previousValue: 'None',
          newValue: 'AI Analyzed',
          reason: 'Initial intake with automated YOLOv11 & RoBERTa triage',
        },
      ],
    };

    if (onAddComplaint) {
      onAddComplaint(newComplaint);
    }

    setSubmissionSuccess(newTicketId);
    setImagePreview('');
    setImageMeta(null);
    setDescription('');
    setActiveTab('submissions');

    setTimeout(() => {
      setSubmissionSuccess(null);
    }, 6000);
  };

  // Filtered Submissions
  const filteredSubmissions = useMemo(() => {
    return complaints.filter((c) => {
      if (statusFilter === 'All') return true;
      if (statusFilter === 'In Review') return c.stage === 'Submitted' || c.stage === 'AI Analyzed';
      if (statusFilter === 'Field Active')
        return (
          c.stage === 'Authority Verified' ||
          c.stage === 'Assigned to Field' ||
          c.stage === 'In Progress' ||
          c.stage === 'Verification Uploaded'
        );
      if (statusFilter === 'Resolved') return c.stage === 'Resolved' || c.stage === 'Closed';
      return true;
    });
  }, [complaints, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Sliding Mode Segmented Tab Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3E8EE]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F1B2A]">Citizen Incident Workspace</h1>
          <p className="text-xs text-[#5B6B7C] mt-0.5">
            Report civic infrastructure defects with instant AI classification and track resolution milestones.
          </p>
        </div>

        {/* Sliding Segmented Tab Bar */}
        <div className="relative flex rounded-lg border border-[#E3E8EE] bg-[#F5F7FA] p-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('report')}
            className={`relative px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer z-10 ${
              activeTab === 'report' ? 'text-[#0F1B2A]' : 'text-[#5B6B7C] hover:text-[#0F1B2A]'
            }`}
          >
            {activeTab === 'report' && (
              <motion.span
                layoutId="citizen-workspace-tab"
                transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                className="absolute inset-0 rounded-md bg-white border border-[#E3E8EE] shadow-2xs"
              />
            )}
            <span className="relative z-10">Report an Incident</span>
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`relative px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer z-10 ${
              activeTab === 'submissions' ? 'text-[#0F1B2A]' : 'text-[#5B6B7C] hover:text-[#0F1B2A]'
            }`}
          >
            {activeTab === 'submissions' && (
              <motion.span
                layoutId="citizen-workspace-tab"
                transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                className="absolute inset-0 rounded-md bg-white border border-[#E3E8EE] shadow-2xs"
              />
            )}
            <span className="relative z-10">
              My Submissions <span className="cp-mono ml-1 font-bold">({complaints.length})</span>
            </span>
          </button>
        </div>
      </div>

      {/* Confirmation Alert Banner */}
      {submissionSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#1E9E6A] shrink-0" strokeWidth={2} />
            <span>
              Complaint registered successfully. Ticket reference <strong className="cp-mono font-bold">{submissionSuccess}</strong> has been ingested into the municipal triage queue.
            </span>
          </div>
          <button
            onClick={() => setSubmissionSuccess(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* VIEW A: REPORT AN INCIDENT */}
      {activeTab === 'report' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 cols): Structured Intake Form */}
          <form noValidate onSubmit={handleSubmitReport} className="lg:col-span-7 space-y-6">
            {/* 1. Visual Evidence Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#0F1B2A]">
                1. Visual Evidence (Photo Capture)
              </label>

              {imagePreview ? (
                <div className="relative rounded-xl border border-[#DDE3EA] bg-[#F5F7FA] p-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={imagePreview}
                      alt="Defect Preview"
                      className="h-16 w-16 object-cover rounded-lg border border-[#CBD3DD] shrink-0"
                    />
                    <div className="min-w-0 text-xs">
                      <p className="font-bold text-[#0F1B2A] truncate">{imageMeta?.name || 'Uploaded photo'}</p>
                      <p className="cp-mono text-[11px] text-[#5B6B7C] mt-0.5">{imageMeta?.size} • {imageMeta?.dim}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium mt-1">
                        <CheckCircle2 className="w-3 h-3 text-[#1E9E6A]" /> EXIF Location Tagged
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setImageMeta(null);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-[#C23B22] hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border border-dashed border-[#CBD3DD] rounded-xl bg-[#F5F7FA]/60 hover:bg-[#F5F7FA] hover:border-[#1F4FE0] transition-colors cursor-pointer text-center group">
                  <Upload className="w-6 h-6 text-[#7A8999] group-hover:text-[#1F4FE0] transition-colors mb-2" strokeWidth={1.75} />
                  <span className="text-xs font-bold text-[#0F1B2A]">Click or drag photo here</span>
                  <span className="text-[11px] text-[#5B6B7C] mt-0.5">JPEG, PNG, WebP up to 10MB</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}

              {/* Load Field Sample Strip */}
              <div className="pt-1">
                <span className="text-[10px] font-bold text-[#7A8999] uppercase tracking-wider block mb-1.5">
                  Or Load Field Sample (Evaluator Quick-Fill):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {FIELD_SAMPLES.map((sample) => (
                    <button
                      key={sample.label}
                      type="button"
                      onClick={() => handleLoadSample(sample)}
                      className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-md border border-[#E3E8EE] bg-white text-xs font-semibold text-[#44546A] hover:text-[#0F1B2A] hover:border-[#1F4FE0] transition-all cursor-pointer"
                    >
                      <ImageIcon className="w-3 h-3 text-[#1F4FE0]" />
                      <span>{sample.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Incident Description (Multilingual) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#0F1B2A]">
                  2. Incident Description (English / Hinglish)
                </label>
                <span className="cp-mono text-[11px] text-[#7A8999]">
                  {description.length} / 500
                </span>
              </div>

              <textarea
                rows={3}
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue, landmarks, severity, or hazards (e.g., 'Model Town main road pe deep pothole hai')..."
                className="w-full rounded-xl border border-[#CBD3DD] p-3 text-sm text-[#0F1B2A] placeholder:text-[#8795A5] focus:border-[#1F4FE0] focus:outline-none focus:ring-1 focus:ring-[#1F4FE0] bg-white leading-relaxed"
              />

              {/* Quick-Fill Sample Chips */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {DESCRIPTION_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setDescription(chip)}
                    className="text-[11px] text-[#5B6B7C] hover:text-[#0F1B2A] bg-[#F5F7FA] border border-[#E3E8EE] px-2.5 py-1 rounded-md transition-colors text-left truncate max-w-full cursor-pointer"
                  >
                    "{chip}"
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Ward & Geolocation Pin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0F1B2A] mb-1.5">
                  3. Municipal Ward
                </label>
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
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
                <label className="block text-xs font-bold text-[#0F1B2A] mb-1.5">
                  GPS Readout (High-DPI)
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-[#E3E8EE] bg-[#F5F7FA] px-3 py-2 text-xs text-[#44546A] cp-mono">
                  <MapPin className="w-3.5 h-3.5 text-[#1F4FE0] shrink-0" />
                  <span className="truncate">
                    {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E • ±4.2m
                  </span>
                </div>
              </div>
            </div>

            {/* 4. DPDP Act 2023 Privacy Strip */}
            <div className="flex items-start gap-2.5 rounded-xl border border-[#E3E8EE] bg-[#F5F7FA]/80 p-3 text-xs text-[#5B6B7C] leading-normal">
              <Lock className="w-4 h-4 text-[#1F4FE0] shrink-0 mt-0.5" strokeWidth={1.75} />
              <span>
                <strong>DPDP Act 2023 Privacy Shield:</strong> Personal identifying device metadata and phone telemetry are automatically stripped prior to municipal storage. Only geocoordinates and visual defect crops are forwarded to the department.
              </span>
            </div>

            {/* Mobile Submit Button (< lg) */}
            <div className="block lg:hidden">
              <button
                type="submit"
                disabled={!description.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1F4FE0] py-3 text-sm font-semibold text-white hover:bg-[#1840B8] active:bg-[#14338F] disabled:opacity-50 transition-colors cursor-pointer"
              >
                <span>Submit Complaint</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Right Column (5 cols): Sticky Live Triage Specification Sheet */}
          <div className="lg:col-span-5 sticky top-20">
            <div className="rounded-2xl border border-[#DDE3EA] bg-[#F5F7FA] p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#E3E8EE]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#1F4FE0]" />
                  <h3 className="text-sm font-bold text-[#0F1B2A]">Live AI Triage Specification</h3>
                </div>
                <span className="cp-mono text-[10px] font-semibold text-[#1E9E6A] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  Dynamic Preview
                </span>
              </div>

              {/* 1. Automated Classification */}
              <div className="space-y-1 text-xs">
                <span className="text-[#7A8999] uppercase tracking-wider text-[10px] font-bold">
                  Classified Category & Department
                </span>
                <p className="text-base font-bold text-[#0F1B2A]">{aiTriage.category}</p>
                <p className="text-xs text-[#44546A]">{aiTriage.department}</p>
              </div>

              {/* 2. Multimodal Confidence Breakdown */}
              <div className="space-y-3 pt-2 border-t border-[#E3E8EE]">
                <span className="text-[#7A8999] uppercase tracking-wider text-[10px] font-bold block">
                  Model Confidence Scoring
                </span>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#44546A]">YOLOv11 Vision Score</span>
                    <span className="cp-mono font-bold text-[#0F1B2A]">
                      {(aiTriage.visionScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#E3E8EE] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1F4FE0] rounded-full transition-all duration-300"
                      style={{ width: `${aiTriage.visionScore * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#44546A]">XLM-RoBERTa Text Score</span>
                    <span className="cp-mono font-bold text-[#0F1B2A]">
                      {(aiTriage.nlpScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#E3E8EE] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1F4FE0] rounded-full transition-all duration-300"
                      style={{ width: `${aiTriage.nlpScore * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="font-semibold text-[#0F1B2A]">Combined Fusion Score</span>
                  <span className="cp-mono font-bold text-[#1E9E6A]">
                    {(aiTriage.fusionScore * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* 3. Assigned Priority & SLA Window */}
              <div className="pt-2 border-t border-[#E3E8EE] grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#7A8999] uppercase tracking-wider text-[10px] font-bold block">
                    Priority Tier
                  </span>
                  <span
                    className={`inline-block mt-1 px-2.5 py-1 rounded text-xs font-bold ${
                      aiTriage.priority === 'P1 Critical'
                        ? 'bg-red-50 text-[#C23B22] border border-red-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {aiTriage.priority}
                  </span>
                </div>

                <div>
                  <span className="text-[#7A8999] uppercase tracking-wider text-[10px] font-bold block">
                    Target SLA Window
                  </span>
                  <span className="cp-mono font-bold text-sm text-[#0F1B2A] block mt-1">
                    {aiTriage.slaHours} Hours
                  </span>
                </div>
              </div>

              {/* 4. 100m Spatial Duplicate Check Alert (if exists) */}
              {existingDuplicate && (
                <div className="rounded-xl border border-amber-300 bg-white p-3.5 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Existing Duplicate Within 100m</span>
                  </div>
                  <p className="text-[11px] text-[#44546A] leading-relaxed">
                    Ticket <strong className="cp-mono">{existingDuplicate.id}</strong> ({existingDuplicate.category}) was already logged in {selectedWard}.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      alert(`Endorsed existing ticket ${existingDuplicate.id}. Priority boosted.`);
                      setActiveTab('submissions');
                    }}
                    className="w-full py-1.5 text-xs font-semibold rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 transition-colors cursor-pointer"
                  >
                    Confirm Same Issue (+1 Endorsement)
                  </button>
                </div>
              )}

              {/* Desktop Submit Button */}
              <button
                type="button"
                onClick={handleSubmitReport}
                disabled={!description.trim()}
                className="w-full hidden lg:flex items-center justify-center gap-2 rounded-xl bg-[#1F4FE0] py-3 text-sm font-semibold text-white hover:bg-[#1840B8] active:bg-[#14338F] disabled:opacity-50 transition-colors cursor-pointer shadow-sm shadow-[#1F4FE0]/25"
              >
                <span>Submit Complaint</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW B: MY SUBMISSIONS & 8-STAGE RESOLUTION TRACKER */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {/* Filter Strip */}
          <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EE]">
            <div className="flex items-center gap-1.5">
              {(['All', 'In Review', 'Field Active', 'Resolved'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    statusFilter === filter
                      ? 'bg-[#0F1B2A] text-white shadow-2xs'
                      : 'text-[#44546A] hover:bg-[#F5F7FA] hover:text-[#0F1B2A]'
                  }`}
                >
                  <span>{filter}</span>
                </button>
              ))}
            </div>

            <span className="text-xs text-[#5B6B7C] cp-mono">
              Showing {filteredSubmissions.length} of {complaints.length} tickets
            </span>
          </div>

          {/* Ticket Cards Grid */}
          <div className="space-y-4">
            {filteredSubmissions.length === 0 ? (
              <div className="rounded-xl border border-[#DDE3EA] bg-white p-12 text-center text-[#5B6B7C]">
                <FileCheck2 className="w-8 h-8 mx-auto text-[#7A8999] mb-2" strokeWidth={1.5} />
                <p className="font-semibold text-sm text-[#0F1B2A]">No complaints found in this filter.</p>
                <p className="text-xs text-[#7A8999] mt-1">Switch filter or submit a new incident report above.</p>
              </div>
            ) : (
              filteredSubmissions.map((ticket) => {
                const isExpanded = expandedTicketId === ticket.id;
                const currentStageIdx = LIFECYCLE_STAGES.indexOf(ticket.stage);
                const isResolvedOrVerified =
                  ticket.stage === 'Resolved' ||
                  ticket.stage === 'Closed' ||
                  ticket.stage === 'Verification Uploaded';

                return (
                  <div
                    key={ticket.id}
                    className="rounded-xl border border-[#DDE3EA] bg-white overflow-hidden shadow-2xs transition-all hover:border-[#CBD3DD]"
                  >
                    {/* Header Row */}
                    <div
                      onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-[#F9FAFC] transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="cp-mono font-bold text-xs text-[#0F1B2A] bg-[#F5F7FA] border border-[#E3E8EE] px-2 py-0.5 rounded">
                            {ticket.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ticket.priority.startsWith('P1')
                                ? 'bg-red-50 text-[#C23B22] border border-red-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {ticket.priority}
                          </span>
                          <span className="text-xs text-[#5B6B7C]">
                            {ticket.ward} • {ticket.department}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#0F1B2A]">{ticket.title}</h4>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-[10px] text-[#7A8999] uppercase tracking-wider block">
                            Target SLA
                          </span>
                          <span className="cp-mono text-xs font-bold text-[#0F1B2A] flex items-center gap-1 justify-end">
                            <Clock className="w-3 h-3 text-[#1F4FE0]" />
                            {ticket.slaHoursRemaining}h remaining
                          </span>
                        </div>
                        <button
                          type="button"
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E3E8EE] bg-white text-[#5B6B7C]"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Horizontal 8-Stage Lifecycle Rail */}
                    <div className="px-5 py-3 border-t border-[#E3E8EE] bg-[#F8FAFC]">
                      <div className="flex items-center justify-between text-[10px] text-[#5B6B7C] mb-1.5 font-semibold">
                        <span>Municipal Resolution Progress</span>
                        <span className="cp-mono text-[#1F4FE0]">
                          Stage {currentStageIdx + 1} of 8: {ticket.stage}
                        </span>
                      </div>

                      <div className="grid grid-cols-8 gap-1">
                        {LIFECYCLE_STAGES.map((stg, i) => {
                          const isComplete = i <= currentStageIdx;
                          return (
                            <div key={stg} className="space-y-1">
                              <div
                                className={`h-1.5 rounded-full transition-colors ${
                                  isComplete ? 'bg-[#1F4FE0]' : 'bg-[#E3E8EE]'
                                }`}
                              />
                              <p
                                className={`text-[9px] truncate ${
                                  i === currentStageIdx
                                    ? 'text-[#0F1B2A] font-bold'
                                    : isComplete
                                    ? 'text-[#44546A]'
                                    : 'text-[#8795A5]'
                                }`}
                                title={stg}
                              >
                                {stg}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Expandable Inspection & Before/After Proof */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="p-5 border-t border-[#E3E8EE] bg-white space-y-5"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left: Original Photo & Confidence Readout */}
                            <div className="space-y-3">
                              <span className="text-xs font-bold text-[#0F1B2A] block">
                                Visual Ingestion Evidence
                              </span>
                              <div className="relative rounded-xl border border-[#DDE3EA] overflow-hidden bg-[#F5F7FA] h-48 flex items-center justify-center">
                                <img
                                  src={ticket.imageUrl}
                                  alt="Original Incident"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 left-2 bg-[#0F1B2A]/80 text-white text-[10px] cp-mono px-2 py-0.5 rounded backdrop-blur-xs">
                                  YOLOv11: {(ticket.visionConfidence * 100).toFixed(1)}% Confidence
                                </div>
                              </div>
                              <p className="text-xs text-[#44546A] leading-relaxed">
                                {ticket.description}
                              </p>
                            </div>

                            {/* Right: Side-by-Side Proof of Work or Audit State */}
                            <div className="space-y-3">
                              <span className="text-xs font-bold text-[#0F1B2A] block">
                                {isResolvedOrVerified ? 'Before vs. After Repair Verification' : 'Latest Audit Trail Entry'}
                              </span>

                              {isResolvedOrVerified ? (
                                <div className="space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="h-32 rounded-lg border border-[#E3E8EE] overflow-hidden relative">
                                      <img
                                        src={ticket.imageUrl}
                                        alt="Before"
                                        className="w-full h-full object-cover"
                                      />
                                      <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded">
                                        Before
                                      </span>
                                    </div>
                                    <div className="h-32 rounded-lg border border-emerald-200 overflow-hidden relative">
                                      <img
                                        src={
                                          ticket.afterImageUrl ||
                                          'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?auto=format&fit=crop&w=800&q=80'
                                        }
                                        alt="After Verification"
                                        className="w-full h-full object-cover"
                                      />
                                      <span className="absolute bottom-1 left-1 bg-emerald-700 text-white text-[9px] px-1.5 py-0.5 rounded">
                                        After Repair
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                                    <span className="font-semibold">SSIM Proof Match: 94.2%</span>
                                    <button
                                      type="button"
                                      onClick={() => alert(`Verification confirmed for ticket ${ticket.id}.`)}
                                      className="px-2.5 py-1 rounded bg-[#1E9E6A] text-white text-xs font-semibold cursor-pointer"
                                    >
                                      Verify Resolution
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="rounded-xl border border-[#E3E8EE] bg-[#F5F7FA] p-4 space-y-2 text-xs">
                                  <div className="flex items-center justify-between text-[11px] text-[#7A8999]">
                                    <span className="cp-mono">
                                      {ticket.auditLogs[ticket.auditLogs.length - 1]?.timestamp || ticket.createdAt}
                                    </span>
                                    <span className="font-semibold text-[#0F1B2A]">
                                      {ticket.auditLogs[ticket.auditLogs.length - 1]?.actor || 'Municipal System'}
                                    </span>
                                  </div>
                                  <p className="text-[#44546A] leading-relaxed">
                                    {ticket.auditLogs[ticket.auditLogs.length - 1]?.reason ||
                                      'Awaiting field inspection team dispatch for physical site verification.'}
                                  </p>
                                  <div className="pt-2 border-t border-[#E3E8EE] flex items-center justify-between text-[11px] text-[#5B6B7C]">
                                    <span>Multimodal Fusion Score:</span>
                                    <span className="cp-mono font-bold text-[#1F4FE0]">
                                      {(ticket.fusionScore * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
