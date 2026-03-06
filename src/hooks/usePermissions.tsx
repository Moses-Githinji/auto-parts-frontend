import { useCallback } from "react";
import { useAuthStore } from "../stores/authStore";
import type { UserRole } from "../types/user";

export type PermissionKey = 
  | "view_stats"
  | "manage_vendors"
  | "view_vendors"
  | "manage_riders"
  | "view_riders"
  | "view_logs"
  | "view_commissions"
  | "view_finances"
  | "manage_staff"
  | "manage_payouts";

export function usePermissions() {
  const { user } = useAuthStore();

  const hasPermission = useCallback((permission: PermissionKey): boolean => {
    if (!user) return false;
    
    // System Admins have all permissions
    if ((user.role as string) === "SYSTEM_ADMIN") return true;
    
    // Staff members check their permissions array
    if ((user.role as string) !== "STAFF") return false;
    
    return (user as any).permissions?.includes(permission) || false;
  }, [user]);

  const hasAnyPermission = useCallback((permissions: PermissionKey[]): boolean => {
    return permissions.some(p => hasPermission(p));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((permissions: PermissionKey[]): boolean => {
    return permissions.every(p => hasPermission(p));
  }, [hasPermission]);

  const isRole = useCallback((role: UserRole): boolean => {
    return user?.role === role;
  }, [user?.role]);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isRole,
    userRole: user?.role,
    permissions: user?.permissions || [],
  };
}

interface HasPermissionProps {
  permission: PermissionKey | PermissionKey[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function HasPermission({ 
  permission, 
  requireAll = false, 
  children, 
  fallback = null 
}: HasPermissionProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  const allowed = Array.isArray(permission)
    ? (requireAll ? hasAllPermissions(permission) : hasAnyPermission(permission))
    : hasPermission(permission);

  if (!allowed) return <>{fallback}</>;
  
  return <>{children}</>;
}
