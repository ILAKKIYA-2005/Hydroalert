import { BackendFlowReading, Incident, UserSession } from '../types';

/**
 * Spring Boot REST Backend API Service
 * Default URL: http://localhost:8080/api
 */
const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8080/api';

const TOKEN_STORAGE_KEY = 'hydroalert_jwt_token';
const USER_STORAGE_KEY = 'hydroalert_user_session';

/**
 * JWT Token Storage Helpers
 */
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch (err) {
    console.warn('LocalStorage error:', err);
  }
}

export function getStoredUserSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUserSession(user: UserSession | null): void {
  try {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch (err) {
    console.warn('LocalStorage error:', err);
  }
}

/**
 * Creates headers including the JWT Authorization Bearer header
 */
function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * 1. Login REST API with Spring Security & JWT
 * POST /api/auth/login
 */
export async function loginApi(
  username: string,
  password: string
): Promise<{ user: UserSession; token: string }> {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.status === 401 || response.status === 400) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Invalid username or password');
    }

    if (!response.ok) {
      throw new Error(`Authentication server error: ${response.status}`);
    }

    const data = await response.json();
    const token: string = data.token;
    const user: UserSession = {
      username: data.username,
      name: data.name || (data.username === 'operator' ? 'Primary Operator' : 'Chief Supervisor'),
      role: data.role || (data.username === 'operator' ? 'Field Engineer' : 'Lead Supervisor'),
    };

    setAuthToken(token);
    setStoredUserSession(user);

    return { user, token };
  } catch (err: any) {
    // If backend is not currently running locally, check demo fallback credentials
    const isNetworkError = err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'));
    if (isNetworkError) {
      // Local fallback for offline evaluation
      const validMockUsers: Record<string, { pass: string; name: string; role: string }> = {
        operator: { pass: 'operator123', name: 'Primary Operator', role: 'Plant Operations' },
        admin: { pass: 'admin123', name: 'Administrator', role: 'System Admin' },
        supervisor: { pass: 'supervisor123', name: 'Chief Supervisor', role: 'Water Authority' },
      };

      const match = validMockUsers[username.toLowerCase().trim()];
      if (match && match.pass === password) {
        const dummyToken = `demo_jwt_header.${btoa(username)}.demo_signature_standby`;
        const user: UserSession = {
          username: username.toLowerCase().trim(),
          name: match.name,
          role: match.role,
        };
        setAuthToken(dummyToken);
        setStoredUserSession(user);
        return { user, token: dummyToken };
      }
      throw new Error('Invalid username or password (offline mode)');
    }

    throw err;
  }
}

/**
 * 2. Fetch current water-flow readings for all locations
 * Protected API: requires JWT Bearer token
 * GET /api/flow/readings
 */
export async function fetchFlowReadings(): Promise<BackendFlowReading[]> {
  const response = await fetch(`${BACKEND_BASE_URL}/flow/readings`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (response.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch flow readings: ${response.status}`);
  }

  return response.json();
}

/**
 * 3. Trigger simulated flow reading on Spring Boot backend
 * Protected API: requires JWT Bearer token
 * GET /api/flow/simulate
 */
export async function simulateFlowOnBackend(): Promise<BackendFlowReading[]> {
  const response = await fetch(`${BACKEND_BASE_URL}/flow/simulate`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (response.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!response.ok) {
    throw new Error(`Failed to simulate flow readings: ${response.status}`);
  }

  return response.json();
}

/**
 * 4. Send a water flow reading to the backend
 * Protected API: requires JWT Bearer token
 * POST /api/flow/reading
 */
export async function postFlowReading(
  location: string,
  flowRate: number
): Promise<BackendFlowReading> {
  const response = await fetch(`${BACKEND_BASE_URL}/flow/reading`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ location, flowRate }),
  });

  if (response.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!response.ok) {
    throw new Error(`Failed to send flow reading: ${response.status}`);
  }

  return response.json();
}

/**
 * 5. Fetch active incidents from Spring Boot / MySQL
 * Protected API: requires JWT Bearer token
 * GET /api/incidents/active
 */
export async function fetchActiveIncidents(): Promise<Incident[]> {
  const response = await fetch(`${BACKEND_BASE_URL}/incidents/active`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (response.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch active incidents: ${response.status}`);
  }

  return response.json();
}

/**
 * 6. Fetch resolved incidents from Spring Boot / MySQL
 * Protected API: requires JWT Bearer token
 * GET /api/incidents/history
 */
export async function fetchIncidentHistory(): Promise<Incident[]> {
  const response = await fetch(`${BACKEND_BASE_URL}/incidents/history`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (response.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch incident history: ${response.status}`);
  }

  return response.json();
}

/**
 * 7. Send Acknowledge request to Spring Boot backend
 * Protected API: requires JWT Bearer token
 * PUT /api/incidents/{id}/acknowledge
 */
export async function acknowledgeIncidentApi(id: string | number): Promise<Incident> {
  const response = await fetch(`${BACKEND_BASE_URL}/incidents/${id}/acknowledge`, {
    method: 'PUT',
    headers: getHeaders(),
  });

  if (response.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Failed to acknowledge incident #${id}`);
  }

  return response.json();
}

/**
 * 8. Send Resolve request to Spring Boot backend
 * Protected API: requires JWT Bearer token
 * PUT /api/incidents/{id}/resolve
 */
export async function resolveIncidentApi(id: string | number): Promise<Incident> {
  const response = await fetch(`${BACKEND_BASE_URL}/incidents/${id}/resolve`, {
    method: 'PUT',
    headers: getHeaders(),
  });

  if (response.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Failed to resolve incident #${id}`);
  }

  return response.json();
}

/**
 * Helper: Test if Spring Boot backend is reachable via GET /api/health
 */
export interface BackendHealthResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  database: string;
  databaseProduct?: string;
  databaseError?: string;
}

export async function fetchBackendHealth(): Promise<BackendHealthResponse | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${BACKEND_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function checkBackendConnection(): Promise<boolean> {
  try {
    const health = await fetchBackendHealth();
    return health !== null && health.status === 'UP';
  } catch {
    return false;
  }
}
