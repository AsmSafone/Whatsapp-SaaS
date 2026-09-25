import { useState, useCallback, type ReactNode } from 'react';
import type { UserRole, RoleContextType } from '../types/role';
import { RoleContext } from '../hooks/useRole';

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(() => {
    const saved = localStorage.getItem('zaptura_user_role');
    return (saved as UserRole) || null;
  });

  const setRole = useCallback((newRole: UserRole | null) => {
    setRoleState(newRole);
    if (newRole) {
      localStorage.setItem('zaptura_user_role', newRole);
    } else {
      localStorage.removeItem('zaptura_user_role');
    }
  }, []);

  const value: RoleContextType = {
    role,
    setRole,
    isAdmin: role === 'admin',
    isUser: role === 'user',
    canWrite: role === 'admin' || role === 'user',
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}
