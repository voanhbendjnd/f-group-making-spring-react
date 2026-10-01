import { apiClient } from '@/services/api/client';
import type { LoginRequest, LoginResponse } from '../types';

export const authApi = {
  async login(request: LoginRequest): Promise<LoginResponse> {
    const data = await apiClient.post<any, LoginResponse>('/api/login', {
      username: request.username.trim().toLowerCase(),
      password: request.password,
    });
    return data;
  },
};
