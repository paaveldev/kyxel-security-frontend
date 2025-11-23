const envApiBase = (import.meta as { env?: { PUBLIC_API_BASE_URL?: string; DEV?: boolean } })
  .env?.PUBLIC_API_BASE_URL;

const defaultDevApiBase =
  (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true
    ? 'https://api.kyxelsecurity.com/api/v1'
    : '';

const API_BASE = (envApiBase || defaultDevApiBase || '').replace(/\/$/, '');

export interface AccountUser {
  id: string;
  name: string;
  email: string;
  workspaceName?: string;
  defaultProjectId?: string;
  subscriptionPlan?: string;
  subscriptionActive?: boolean;
  subscriptionNextBilling?: string;
  apiKey?: string;
}

export interface AccountResponse {
  user: AccountUser;
}

type UpdateCurrentUserInput = {
  name?: string;
  workspaceName?: string;
  currentPassword?: string;
  newPassword?: string;
};

// Helper genérico para llamadas a la API
async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_BASE) {
    throw new Error('Missing PUBLIC_API_BASE_URL for api client');
  }

  const url = `${API_BASE}${path}`;
  const headers = new Headers(options.headers || {});

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => '');

  if (!res.ok) {
    const message =
      typeof payload === 'object' && payload !== null && 'message' in payload
        ? (payload as { message?: string }).message
        : `Request failed with status ${res.status}`;
    const error: any = new Error(message || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.body = payload;
    throw error;
  }

  return payload as T;
}

// ===============================
// Auth
// ===============================

export function apiRegister(email: string, password: string, name: string) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

export function apiLogin(email: string, password: string) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// ===============================
// Projects
// ===============================

export function apiGetProjects(token: string) {
  return request('/projects', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function apiCreateProject(name: string, description: string, token: string) {
  return request('/projects', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name, description }),
  });
}

// ===============================
// Agents
// ===============================

export function apiGetAgents(projectId: string, token: string) {
  return request(`/projects/${projectId}/agents`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function apiCreateAgent(projectId: string, name: string, token: string) {
  return request(`/projects/${projectId}/agents`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name }),
  });
}

// ===============================
// Overview (dashboard)
// ===============================

export function apiGetOverview(projectId: string, token: string) {
  return request(`/projects/${projectId}/overview`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ===============================
// Events
// ===============================

export function apiGetEvents(projectId: string, token: string) {
  return request(`/projects/${projectId}/events`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ===============================
// Account
// ===============================

export function apiGetCurrentUser(token: string) {
  // El backend expone GET /api/me, pero como API_BASE ya incluye /api,
  // aquí solo usamos /me
  return request<AccountResponse>('/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function apiUpdateCurrentUser(input: UpdateCurrentUserInput, token: string) {
  // Igual que arriba: PATCH /me sobre base /api
  return request<AccountResponse>('/me', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
}

// apiChangePassword eliminado: ahora el cambio de contraseña se hace vía apiUpdateCurrentUser
