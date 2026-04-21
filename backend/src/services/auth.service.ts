import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';
import { hashPassword, comparePassword } from '../utils/hash';
import { signToken, generateRefreshToken, getRefreshTokenExpiry } from '../utils/jwt';
import { isValidPhone, sanitizePhone } from '../utils/validators';
import { User, UserPublic } from '../models/user.model';

interface RefreshTokenRow {
  id: string;
  user_id: string;
  token: string;
  expires_at: number;
}

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
    const db = getDatabase();
    const phone = sanitizePhone(input.phone);

    if (!isValidPhone(phone)) {
      throw new Error('INVALID_PHONE');
    }

    const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone) as { id: string } | undefined;
    if (existing) {
      throw new Error('USER_EXISTS');
    }

    // hashPassword — async (bcrypt), выполняется до транзакции:
    // внутрь синхронной better-sqlite3 транзакции async-вызовы не входят.
    const passwordHash = await hashPassword(input.password);
    const userId = uuidv4();

    // Все три INSERT (users + drivers + refresh_tokens) и SELECT атомарны:
    // если любой из них упадёт — транзакция откатится целиком.
    // createRefreshToken использует db.prepare().run() без собственной транзакции,
    // поэтому его операции корректно присоединяются к внешней.
    const { user, refreshToken } = db.transaction(() => {
      db.prepare(
        `INSERT INTO users (id, phone, name, password_hash, type, language)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(userId, phone, input.name, passwordHash, input.type, input.language ?? 'ru');

      if (input.type === 'driver') {
        const driverId = uuidv4();
        db.prepare(
          `INSERT INTO drivers (id, user_id) VALUES (?, ?)`
        ).run(driverId, userId);
      }

      const rt = this.createRefreshToken(userId);
      const u = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User;
      return { user: u, refreshToken: rt };
    })();

    const token = signToken({ userId: user.id, type: user.type });

    return { user: toPublic(user), token, refreshToken };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const db = getDatabase();
    const phone = sanitizePhone(input.phone);

    const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone) as User | undefined;
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
    const db = getDatabase();
    const now = Math.floor(Date.now() / 1000);

    const savedToken = db.prepare(
      'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > ?'
    ).get(refreshToken, now) as
      | RefreshTokenRow
      | undefined;

    if (!savedToken) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(savedToken.user_id) as User | undefined;
    if (!user) {
      db.prepare('DELETE FROM refresh_tokens WHERE id = ?').run(savedToken.id);
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    db.prepare('DELETE FROM refresh_tokens WHERE id = ?').run(savedToken.id);

    const token = signToken({ userId: user.id, type: user.type });
    const newRefreshToken = this.createRefreshToken(user.id);

    return {
      user: toPublic(user),
      token,
      refreshToken: newRefreshToken,
    };
  }

  getUser(userId: string): UserPublic | null {
    const db = getDatabase();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User | undefined;
    return user ? toPublic(user) : null;
  }

  private createRefreshToken(userId: string): string {
    const db = getDatabase();
    const refreshToken = generateRefreshToken();
    const expiresAt = getRefreshTokenExpiry();

    db.prepare(
      `INSERT INTO refresh_tokens (id, user_id, token, expires_at)
       VALUES (?, ?, ?, ?)`
    ).run(uuidv4(), userId, refreshToken, expiresAt);

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
