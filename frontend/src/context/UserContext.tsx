import { createContext, useContext, useState, ReactNode } from 'react';
import { UserProfile, AccessibilitySettings } from '../types/user.js';

interface UserContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  updateAccessibility: (settings: Partial<AccessibilitySettings>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    // Try to load from localStorage
    const stored = localStorage.getItem('empowermint_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  const updateUserProfile = (profile: UserProfile | null) => {
    setUserProfile(profile);
    if (profile) {
      localStorage.setItem('empowermint_user', JSON.stringify(profile));
    } else {
      localStorage.removeItem('empowermint_user');
    }
  };

  const updateAccessibility = (settings: Partial<AccessibilitySettings>) => {
    if (userProfile) {
      const updated = {
        ...userProfile,
        accessibility: {
          ...userProfile.accessibility,
          ...settings,
        },
      };
      updateUserProfile(updated);
    }
  };

  return (
    <UserContext.Provider
      value={{
        userProfile,
        setUserProfile: updateUserProfile,
        updateAccessibility,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

