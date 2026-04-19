import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';
import { hashPassword, comparePassword } from '../utils/hash';
import { signToken } from '../utils/jwt';
import { isValidPhone, sanitizePhone } from '../utils/validators';
import { User, UserPublic } from '../models/user.model';

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

    const passwordHash = await hashPassword(input.password);
    const userId = uuidv4();

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

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User;
    const token = signToken({ userId: user.id, type: user.type });

    return { user: toPublic(user), token };
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
    return { user: toPublic(user), token };
  }

  getUser(userId: string): UserPublic | null {
    const db = getDatabase();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User | undefined;
    return user ? toPublic(user) : null;
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
