import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthUser, UserRole, CitizenPreferences } from '../types/auth';

export const DEMO_ACCOUNTS: Record<UserRole, AuthUser> = {
  citizen: {
    id: 'usr-cit-1042',
    name: 'Arjun Sharma',
    email: 'arjun.sharma@gmail.com',
    role: 'citizen',
    badgeId: 'CIT-1042',
    ward: 'Model Town',
    phone: '9876543210',
    preferences: {
      phone: '9876543210',
      allowCallVerification: true,
      preferredLanguage: 'English',
      state: 'Punjab',
      district: 'Ludhiana',
      city: 'Ludhiana Municipal Corporation',
      ward: 'Model Town',
      pincode: '141002',
      landmark: 'Near Gol Market Chowk, opposite SBI branch',
      autoStripMetadata: true,
      smsWhatsappAlerts: true,
      anonymousLeaderboard: false,
    },
  },
  authority: {
    id: 'usr-auth-08',
    name: 'Harpreet Singh',
    email: 'commissioner.roads@mc-citypulse.gov.in',
    role: 'authority',
    badgeId: 'MC-OFF-08',
    department: 'Roads & Public Works',
    ward: 'All Wards',
    phone: '9814012345',
  },
  worker: {
    id: 'usr-wrk-04',
    name: 'Rajesh Kumar',
    email: 'rajesh.crew4@mc-citypulse.gov.in',
    role: 'worker',
    badgeId: 'CREW-RD-04',
    department: 'Roads & Public Works • Crew #4',
    ward: 'Model Town & Sarabha Nagar',
    phone: '9815098765',
  },
};

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, role?: UserRole) => boolean;
  loginAsDemo: (role: UserRole) => void;
  registerCitizen: (name: string, email: string, ward?: string) => void;
  updateUserPreferences: (prefs: Partial<CitizenPreferences>, extraInfo?: Partial<AuthUser>) => void;
  logout: () => void;
  canAccessPortal: (portalId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'citypulse_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // LocalStorage access safe fallback
    }
  }, [user]);

  const loginAsDemo = (role: UserRole) => {
    const demo = DEMO_ACCOUNTS[role];
    setUser(demo);
  };

  const login = (email: string, roleFallback: UserRole = 'citizen') => {
    // Check if matches any demo account
    const matchedRole = (Object.keys(DEMO_ACCOUNTS) as UserRole[]).find(
      (r) => DEMO_ACCOUNTS[r].email.toLowerCase() === email.trim().toLowerCase()
    );

    if (matchedRole) {
      setUser(DEMO_ACCOUNTS[matchedRole]);
      return true;
    }

    // Generic sign-in fallback with role based on domain
    let detectedRole: UserRole = roleFallback;
    if (email.includes('commissioner') || email.includes('gov.in') || email.includes('authority')) {
      detectedRole = 'authority';
    } else if (email.includes('crew') || email.includes('worker')) {
      detectedRole = 'worker';
    }

    const newUser: AuthUser = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0].replace('.', ' '),
      email: email.trim(),
      role: detectedRole,
      badgeId: detectedRole === 'authority' ? 'MC-OFF-99' : detectedRole === 'worker' ? 'CREW-09' : 'CIT-9901',
      ward: 'Model Town',
      department: detectedRole === 'authority' ? 'Municipal Administration' : detectedRole === 'worker' ? 'Field Operations' : undefined,
      phone: '9876543210',
      preferences: {
        phone: '9876543210',
        allowCallVerification: true,
        preferredLanguage: 'English',
        state: 'Punjab',
        district: 'Ludhiana',
        city: 'Ludhiana Municipal Corporation',
        ward: 'Model Town',
        pincode: '141002',
        landmark: '',
        autoStripMetadata: true,
        smsWhatsappAlerts: true,
        anonymousLeaderboard: false,
      },
    };
    setUser(newUser);
    return true;
  };

  const registerCitizen = (name: string, email: string, ward?: string) => {
    const newUser: AuthUser = {
      id: `usr-cit-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role: 'citizen',
      badgeId: `CIT-${Math.floor(1000 + Math.random() * 9000)}`,
      ward: ward || 'Model Town',
      phone: '9876500000',
      preferences: {
        phone: '9876500000',
        allowCallVerification: true,
        preferredLanguage: 'English',
        state: 'Punjab',
        district: 'Ludhiana',
        city: 'Ludhiana Municipal Corporation',
        ward: ward || 'Model Town',
        pincode: '141002',
        autoStripMetadata: true,
        smsWhatsappAlerts: true,
        anonymousLeaderboard: false,
      },
    };
    setUser(newUser);
  };

  const updateUserPreferences = (prefs: Partial<CitizenPreferences>, extraInfo?: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        ...extraInfo,
        preferences: {
          ...(prev.preferences || {}),
          ...prefs,
        },
      };
    });
  };

  const logout = () => {
    setUser(null);
  };

  const canAccessPortal = (portalId: string): boolean => {
    if (!user) return false;
    if (portalId === 'citizen') return user.role === 'citizen' || user.role === 'authority';
    if (portalId === 'authority') return user.role === 'authority';
    if (portalId === 'map') return user.role === 'authority';
    if (portalId === 'worker') return user.role === 'worker' || user.role === 'authority';
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginAsDemo,
        registerCitizen,
        updateUserPreferences,
        logout,
        canAccessPortal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
