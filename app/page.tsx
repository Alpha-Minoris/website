import { redirect } from 'next/navigation'

/**
 * ROOT LANDING PAGE
 * 
 * Handles routing based on environment and authentication:
 * - Development (localhost): Redirect to /edit
 * - Production unauthenticated: Redirect to /view
 * - Production authenticated: Redirect to /edit (future)
 * 
 * This page is intentionally simple and can be dynamic without affecting /view cache
 */
export default function RootPage() {
  // For now, just redirect to /view
  // In production with auth, proxy will handle the redirect to /edit for authenticated users
  redirect('/view')
}
