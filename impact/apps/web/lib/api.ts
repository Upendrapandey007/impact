/**
 * API client for the Impact API.
 * Used by TanStack Query hooks in the frontend.
 *
 * All requests automatically include:
 * - Bearer token (from session)
 * - Institution ID (derived from token on server side)
 */

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const response = await fetch(`${API_BASE}/api/v1${path}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new ApiError(
      response.status,
      body.message ?? 'Request failed',
      body.errors,
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

// ─── Simulations ─────────────────────────────────────────────────────────────

export const simulationsApi = {
  create: (
    body: { type: string; parameters: Record<string, unknown>; studentId?: string },
    token: string,
  ) =>
    request<{ simulationId: string; status: 'pending'; estimatedMs: number }>(
      '/simulations',
      { method: 'POST', body: JSON.stringify(body), token },
    ),

  get: (id: string, token: string) =>
    request<{
      id: string;
      status: string;
      overallRisk: string;
      riskScores: Record<string, number>;
      impacts: unknown[];
      recommendedActions: unknown[];
      disclaimer: string;
    }>(`/simulations/${id}`, { token }),

  list: (studentId: string, token: string, page = 1, limit = 20) =>
    request<unknown[]>(
      `/simulations?studentId=${studentId}&page=${page}&limit=${limit}`,
      { token },
    ),
};

// ─── Students ─────────────────────────────────────────────────────────────────

export const studentsApi = {
  getMe: (token: string) => request<unknown>('/students/me', { token }),

  get: (id: string, token: string) => request<unknown>(`/students/${id}`, { token }),

  getEnrollments: (id: string, token: string) =>
    request<unknown>(`/students/${id}/enrollments`, { token }),

  getFinancialAid: (id: string, token: string) =>
    request<unknown>(`/students/${id}/financial-aid`, { token }),

  getSap: (id: string, token: string) =>
    request<unknown>(`/students/${id}/sap`, { token }),
};

// ─── Advisor ─────────────────────────────────────────────────────────────────

export const advisorApi = {
  getRiskQueue: (
    token: string,
    filters: { riskLevel?: string; page?: number; limit?: number } = {},
  ) => {
    const params = new URLSearchParams(filters as Record<string, string>);
    return request<unknown>(`/advisor/risk-queue?${params}`, { token });
  },

  addNote: (body: { studentId: string; content: string; isInternal: boolean }, token: string) =>
    request<unknown>('/advisor/notes', { method: 'POST', body: JSON.stringify(body), token }),

  overrideRisk: (
    body: { studentId: string; riskAssessmentId: string; newRisk: string; reason: string },
    token: string,
  ) =>
    request<unknown>('/advisor/risk-override', {
      method: 'POST',
      body: JSON.stringify(body),
      token,
    }),
};

export { ApiError };
