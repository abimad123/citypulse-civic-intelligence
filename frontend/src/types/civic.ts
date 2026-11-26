// Civic Category Types - Exact 5 Categories per Domain Rules
export type CivicCategory = 'Pothole' | 'Garbage Accumulation' | 'Damaged Streetlight' | 'Water Leakage' | 'Drainage Problem';

// Department Mapping - Corresponds to Municipal Departments
export type Department =
  | 'Roads & Public Works'
  | 'Sanitation & Solid Waste'
  | 'Electrical & Street Lighting'
  | 'Water Supply & Pipelines'
  | 'Drainage & Sewerage';

// Priority Tier System - Critical to Low Severity Levels
export type PriorityTier = 'P1 Critical' | 'P2 High' | 'P3 Medium' | 'P4 Low';

// 8-Stage Ticket Lifecycle Enum
export type TicketStage =
  | 'Submitted'
  | 'AI Analyzed'
  | 'Authority Verified'
  | 'Assigned to Field'
  | 'In Progress'
  | 'Verification Uploaded'
  | 'Resolved'
  | 'Closed';

// Audit Log Entry - Immutable Change Tracking for HITL Workflow
export interface AuditLogEntry {
  timestamp: string;
  actor: string;
  action: 'confirm' | 'override' | 'advance' | 'revert';
  previousValue: string;
  newValue: string;
  reason: string;
}

// Complete Civic Complaint Structure - Full Ticket Model with AI Integration Points
export interface CivicComplaint {
  id: string;
  title: string;
  description: string;
  category: CivicCategory;
  department: Department;
  priority: PriorityTier;
  stage: TicketStage;
  ward: 'Model Town' | 'Sarabha Nagar' | 'Dugri' | 'Gill Road' | 'Focal Point' | 'Civil Lines' | string;
  city?: string;
  state?: string;
  lat: number;
  lng: number;
  imageUrl: string;
  afterImageUrl: string;
  visionConfidence: number; // AI Computer Vision confidence score (0-1)
  nlpConfidence: number; // Natural Language Processing classification confidence (0-1)
  fusionScore: number; // Fused multi-modal confidence score (0-1)
  slaHoursRemaining: number;
  createdAt: string;
  auditLogs: AuditLogEntry[];
}

// Ward Configuration for Ludhiana Municipal Areas
export const WARD_CONFIG: Record<CivicCategory, Department> = {
  'Pothole': 'Roads & Public Works',
  'Garbage Accumulation': 'Sanitation & Solid Waste',
  'Damaged Streetlight': 'Electrical & Street Lighting',
  'Water Leakage': 'Water Supply & Pipelines',
  'Drainage Problem': 'Drainage & Sewerage',
};

// Municipal Wards Configuration (Pilot & Pan-India Deployment Wards)
export const MUNDIAL_WARDS = ['Model Town', 'Sarabha Nagar', 'Dugri', 'Gill Road', 'Focal Point', 'Civil Lines'];

// Supported Smart Cities across India
export const SUPPORTED_INDIAN_CITIES = [
  { id: 'all', name: 'All India (National Grid)', state: 'National' },
  { id: 'delhi', name: 'Delhi NCR', state: 'Delhi' },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra' },
  { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka' },
  { id: 'ludhiana', name: 'Ludhiana', state: 'Punjab' },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana' },
  { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat' },
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu' },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal' },
  { id: 'pune', name: 'Pune', state: 'Maharashtra' },
  { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan' },
  { id: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh' },
  { id: 'chandigarh', name: 'Chandigarh', state: 'Punjab/Haryana' },
];
