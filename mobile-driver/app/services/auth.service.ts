import api, { saveTokens, clearTokens } from './api';
import { LoginCredentials, RegisterData, User, AuthTokens, ApiResponse } from '../types';

interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await api.post<{ success: boolean; data: { user: User; token: string; refreshToken: string } }>(
      '/auth/login',
      { phone: (credentials as LoginCredentials & { phone?: string }).phone ?? credentials.login, password: credentials.password }
    );
    await saveTokens({
      accessToken: data.data.token,
      refreshToken: data.data.refreshToken,
    });
    return {
      user: data.data.user,
      tokens: {
        accessToken: data.data.token,
        refreshToken: data.data.refreshToken,
      },
    };
  },

  async register(registerData: RegisterData): Promise<RegisterResponse> {
    const { data } = await api.post<{ success: boolean; data: { user: User; token: string; refreshToken: string } }>(
      '/auth/register',
      {
        phone: registerData.phone,
        name: `${registerData.firstName} ${registerData.lastName}`.trim(),
        password: registerData.password,
        type: 'driver',
      }
    );
    await saveTokens({
      accessToken: data.data.token,
      refreshToken: data.data.refreshToken,
    });
    return {
      user: data.data.user,
      tokens: {
        accessToken: data.data.token,
        refreshToken: data.data.refreshToken,
      },
    };
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      await clearTokens();
    }
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<{ success: boolean; data: User }>('/auth/me');
    return data.data;
  },

  async uploadDocuments(
    driversLicense: string,
    vehicleRegistration: string,
    insurance: string,
  ): Promise<void> {
    const formData = new FormData();
    formData.append('driversLicense', { uri: driversLicense, type: 'image/jpeg', name: 'drivers_license.jpg' } as unknown as Blob);
    formData.append('vehicleRegistration', { uri: vehicleRegistration, type: 'image/jpeg', name: 'vehicle_registration.jpg' } as unknown as Blob);
    formData.append('insurance', { uri: insurance, type: 'image/jpeg', name: 'insurance.jpg' } as unknown as Blob);

    await api.post('/drivers/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async updateBankDetails(details: {
    bankName: string;
    accountNumber: string;
    cardNumber?: string;
  }): Promise<void> {
    await api.put('/drivers/bank-details', details);
  },
};
