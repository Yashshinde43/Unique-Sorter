/**
 * Role-Based Access Control (RBAC) Helper Functions
 * 
 * RULES:
 * - Always use useAuth() to get current userRole
 * - Never hardcode role checks in components — use these helpers only
 * - ADMIN bypasses all checks
 */

// Role constants
export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
};

/**
 * Check if user is Admin
 * @param {string} userRole - The user's role from useAuth()
 * @returns {boolean} - True if user is Admin
 */
export function isAdmin(userRole) {
  return userRole === ROLES.ADMIN;
}

/**
 * Check if user can view a resource
 * ADMIN can view everything
 * USER can view dashboard, enquiry, and quotations (read-only)
 * @param {string} userRole - The user's role from useAuth()
 * @param {string} resource - The resource to view
 * @returns {boolean} - True if user can view
 */
export function canView(userRole, resource) {
  if (isAdmin(userRole)) return true;
  if (userRole === ROLES.USER) {
    // USER can view dashboard, enquiry, quotations, and profile
    const viewableResources = ['dashboard', 'enquiry', 'quotations', 'profile'];
    return viewableResources.includes(resource);
  }
  return false;
}

/**
 * Check if user can edit a resource
 * ADMIN can edit everything
 * USER cannot edit anything
 * @param {string} userRole - The user's role from useAuth()
 * @param {string} resource - The resource to edit
 * @returns {boolean} - True if user can edit
 */
export function canEdit(userRole, resource) {
  if (isAdmin(userRole)) return true;
  // USER cannot edit anything
  return false;
}

/**
 * Check if user can delete records
 * Only ADMIN can delete
 * @param {string} userRole - The user's role from useAuth()
 * @returns {boolean} - True if user can delete
 */
export function canDelete(userRole) {
  return isAdmin(userRole);
}

/**
 * Check if user can manage users (create, edit, delete users)
 * Only ADMIN can manage users
 * @param {string} userRole - The user's role from useAuth()
 * @returns {boolean} - True if user can manage users
 */
export function canManageUsers(userRole) {
  return isAdmin(userRole);
}

/**
 * Check if user can access settings page
 * Only ADMIN can access settings
 * @param {string} userRole - The user's role from useAuth()
 * @returns {boolean} - True if user can access settings
 */
export function canAccessSettings(userRole) {
  return isAdmin(userRole);
}

/**
 * Check if user can create records
 * Only ADMIN can create records
 * @param {string} userRole - The user's role from useAuth()
 * @returns {boolean} - True if user can create
 */
export function canCreate(userRole) {
  return isAdmin(userRole);
}

/**
 * Get allowed routes for a role
 * USER can view dashboard, enquiry, and quotations (view only)
 * ADMIN can access everything including settings
 * @param {string} userRole - The user's role from useAuth()
 * @returns {string[]} - Array of allowed routes
 */
export function getAllowedRoutes(userRole) {
  if (isAdmin(userRole)) {
    return [
      '/dashboard',
      '/dashboard/enquiry',
      '/dashboard/quotations',
      '/dashboard/settings',
      '/dashboard/reports',
      '/dashboard/products',
      '/dashboard/orders',
      '/dashboard/inventory',
      '/dashboard/clients',
    ];
  }
  
  if (userRole === ROLES.USER) {
    // USER can view dashboard, enquiry, and quotations (but can't edit)
    return [
      '/dashboard',
      '/dashboard/enquiry',
      '/dashboard/quotations',
    ];
  }
  
  return [];
}

/**
 * Check if a route is accessible by the user role
 * @param {string} userRole - The user's role from useAuth()
 * @param {string} pathname - The current pathname
 * @returns {boolean} - True if route is accessible
 */
export function canAccessRoute(userRole, pathname) {
  const allowedRoutes = getAllowedRoutes(userRole);
  
  // Check if pathname starts with any allowed route
  return allowedRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
}

/**
 * Get redirect path for a role
 * @param {string} userRole - The user's role from useAuth()
 * @returns {string} - The redirect path
 */
export function getRedirectPath(userRole) {
  if (isAdmin(userRole)) return '/dashboard';
  if (userRole === ROLES.USER) return '/dashboard';
  return '/login';
}
