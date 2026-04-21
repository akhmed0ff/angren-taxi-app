import { hashPassword, comparePassword } from '../utils/hash';
import { signToken, generateRefreshToken, getRefreshTokenExpiry } from '../utils/jwt';
import { isValidPhone, sanitizePhone } from '../utils/validators';
import { User, UserPublic } from '../models/user.model';
import { userRepository } from '../repositories/user.repository';
import { refreshTokenRepository } from '../repositories/refresh-token.repository';

export interface RegisterInput {
  phone: string;
  name: string;
  password: string;
  type: 'passenger' | 'driver';
  language?: string;
}

export interface LoginInput {
  phone: string;
  password: string;
}

export interface AuthResult {
  user: UserPublic;
  token: string;
  refreshToken: string;
}

export class AuthService {
  async register(input: RegisterInput): Promise<AuthResult> {
    const phone = sanitizePhone(input.phone);

    if (!isValidPhone(phone)) {
      throw new Error('INVALID_PHONE');
    }

    if (userRepository.existsByPhone(phone)) {
      throw new Error('USER_EXISTS');
    }

    // hashPassword — async (bcrypt), выполняется до транзакции:
    // внутрь синхронной better-sqlite3 транзакции async-вызовы не входят.
    const passwordHash = await hashPassword(input.password);

    // Все три INSERT (users + drivers + refresh_tokens) и SELECT атомарны:
    // если любой из них упадёт — транзакция откатится целиком.
    // createRefreshToken использует тот же db-провайдер, поэтому операция
    // корректно выполняется в рамках внешней транзакции.
    const { user, refreshToken } = userRepository.transaction(() => {
      const user = userRepository.create({
        phone,
        name: input.name,
        passwordHash,
        type: input.type,
        language: input.language ?? 'ru',
      });

      if (input.type === 'driver') {
        userRepository.createDriverProfile(user.id);
      }

      const rt = this.createRefreshToken(user.id);
      return { user, refreshToken: rt };
    });

    const token = signToken({ userId: user.id, type: user.type });

    return { user: toPublic(user), token, refreshToken };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const phone = sanitizePhone(input.phone);

    const user = userRepository.findByPhone(phone);
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const valid = await comparePassword(input.password, user.password_hash);
    if (!valid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const token = signToken({ userId: user.id, type: user.type });
    const refreshToken = this.createRefreshToken(user.id);
    return { user: toPublic(user), token, refreshToken };
  }

  async refreshSession(refreshToken: string): Promise<AuthResult> {
    const savedToken = refreshTokenRepository.findValid(refreshToken);

    if (!savedToken) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    const user = userRepository.findById(savedToken.user_id);
    if (!user) {
      refreshTokenRepository.deleteById(savedToken.id);
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    refreshTokenRepository.deleteById(savedToken.id);

    const token = signToken({ userId: user.id, type: user.type });
    const newRefreshToken = this.createRefreshToken(user.id);

    return {
      user: toPublic(user),
      token,
      refreshToken: newRefreshToken,
    };
  }

  getUser(userId: string): UserPublic | null {
    const user = userRepository.findById(userId);
    return user ? toPublic(user) : null;
  }

  private createRefreshToken(userId: string): string {
    const refreshToken = generateRefreshToken();
    const expiresAt = getRefreshTokenExpiry();

    refreshTokenRepository.create(userId, refreshToken, expiresAt);

    return refreshToken;
  }
}

function toPublic(user: User): UserPublic {
  return {
    id: user.id,
    phone: user.phone,
    name: user.name,
    type: user.type,
    language: user.language,
    created_at: user.created_at,
  };
}

export const authService = new AuthService();
