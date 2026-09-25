// Role types for RBAC
export type UserRole = 'admin' | 'user';

export interface RoleContextType {
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;
  isAdmin: boolean;
  isUser: boolean;
  canWrite: boolean;
}
