export type UserRole = 'citizen' | 'authority' | 'worker';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  badgeId: string; // e.g. CIT-1042, MC-OFF-08, CREW-RD-04
  department?: string;
  ward?: string;
}

export const PORTAL_ROLE_REQUIREMENTS: Record<string, UserRole[]> = {
  citizen: ['citizen', 'authority'], // Authorities can also view citizen portal for triage inspection
  authority: ['authority'],
  map: ['authority'], // GIS analysis is an authority/urban planner tool
  worker: ['worker', 'authority'], // Authorities can inspect field worker queues
};

export const ROLE_LABELS: Record<UserRole, string> = {
  citizen: 'Citizen Reporter',
  authority: 'Municipal Officer',
  worker: 'Field Repair Crew',
};
