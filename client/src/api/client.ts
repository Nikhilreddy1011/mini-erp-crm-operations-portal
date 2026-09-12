const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export class ApiError extends Error {
  statusCode: number;
  errors: any[];

  constructor(message: string, statusCode: number = 400, errors: any[] = []) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data: T; message?: string; pagination?: any }> => {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new ApiError(
      data.message || 'An error occurred during request',
      response.status,
      data.errors || []
    );
  }

  return data;
};
