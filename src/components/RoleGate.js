'use client';

import { useAuth } from '@/contexts/AuthContext';

/**
 * RoleGate Component - Controls access to UI elements based on user role
 * 
 * Usage:
 * <RoleGate allowedRoles={['ADMIN']}>
 *   <AdminOnlyButton />
 * </RoleGate>
 * 
 * <RoleGate allowedRoles={['ADMIN', 'USER']} fallback={<Unauthorized />}>
 *   <RestrictedContent />
 * </RoleGate>
 */

export function RoleGate({ 
  children, 
  allowedRoles = [], 
  fallback = null 
}) {
  const { userRole, isLoading } = useAuth();

  // While loading, show nothing or a loading state
  if (isLoading) {
    return null;
  }

  // If no role is set, show fallback
  if (!userRole) {
    return fallback;
  }

  // Check if user's role is in allowed roles (case-insensitive)
  const hasAccess = allowedRoles.some(role => 
    role.toUpperCase() === userRole.toUpperCase()
  );

  if (!hasAccess) {
    return fallback;
  }

  return children;
}

/**
 * AdminOnly Component - Shorthand for ADMIN-only content
 */
export function AdminOnly({ children, fallback = null }) {
  return (
    <RoleGate allowedRoles={['ADMIN']} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

/**
 * UserOnly Component - Shorthand for USER-only content
 */
export function UserOnly({ children, fallback = null }) {
  return (
    <RoleGate allowedRoles={['USER']} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

/**
 * AllRoles Component - Shorthand for content visible to all authenticated users
 */
export function AllRoles({ children, fallback = null }) {
  return (
    <RoleGate allowedRoles={['ADMIN', 'USER']} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

export default RoleGate;
