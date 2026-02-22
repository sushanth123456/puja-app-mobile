import { getApiBaseUrl, getApiTimeoutMs } from '@/lib/config';
import { AuthMethod, DevoteeProfile, PujariOnboardingProfile, PujariProfile, Role } from '@/types/app';

type ApiAuthPayload = {
  role: Role;
  method: AuthMethod;
  email?: string;
  phone?: string;
  otp?: string;
  password?: string;
};

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

async function request<T>(path: string, init: RequestInit, token?: string): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), getApiTimeoutMs());
  try {
    const res = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {}),
      },
      signal: controller.signal,
    });
    const body = (await res.json().catch(() => ({}))) as { message?: string; data?: T };
    if (!res.ok) {
      return { ok: false, error: body.message ?? 'Backend request failed.' };
    }
    return { ok: true, data: body.data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to reach backend. Check network or server.';
    return { ok: false, error: message };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function apiSignIn(payload: ApiAuthPayload): Promise<ApiResponse<{ token: string }>> {
  return request('/auth/sign-in', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiSendOtp(phone: string): Promise<ApiResponse<{ challengeId: string }>> {
  return request('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export async function apiGoogleSignIn(idToken: string): Promise<ApiResponse<{ token: string }>> {
  return request('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ role: 'DEVOTEE', idToken }),
  });
}

export async function apiAppleSignIn(identityToken: string): Promise<ApiResponse<{ token: string }>> {
  return request('/auth/apple', {
    method: 'POST',
    body: JSON.stringify({ role: 'DEVOTEE', identityToken }),
  });
}

export async function apiSaveDevoteeProfile(
  profile: DevoteeProfile,
  token: string
): Promise<ApiResponse<{ id: string }>> {
  return request('/devotees/profile', {
    method: 'POST',
    body: JSON.stringify(profile),
  }, token);
}

export async function apiSavePujariProfile(
  profile: PujariOnboardingProfile,
  token: string
): Promise<ApiResponse<{ id: string }>> {
  return request('/pujaris/profile', {
    method: 'POST',
    body: JSON.stringify(profile),
  }, token);
}

export async function apiListPujaris(): Promise<ApiResponse<PujariProfile[]>> {
  return request('/pujaris', {
    method: 'GET',
  });
}
