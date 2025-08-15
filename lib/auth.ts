// Mock authentication utilities
// In production, this would integrate with your actual auth system

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'manager' | 'admin';
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('flex_auth_token');
}

export function getUserEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('flex_user_email');
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('flex_auth_token');
  localStorage.removeItem('flex_user_email');
  window.location.href = '/login';
}

export function getCurrentUser(): User | null {
  const email = getUserEmail();
  if (!email) return null;
  
  return {
    id: 'mock_user_id',
    email,
    name: email.split('@')[0],
    role: 'manager'
  };
}

// Server-side auth check for API routes
export function verifyAuthHeader(request: Request): User | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  
  const token = authHeader.substring(7);
  if (!token.startsWith('mock_token_')) return null;
  
  // In production, verify JWT token here
  return {
    id: 'mock_user_id',
    email: 'demo@theflex.global',
    name: 'Demo Manager',
    role: 'manager'
  };
}
