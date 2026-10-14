import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { dbService } from '../db/database.ts';
import { User, UserRole } from '../db/types.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'school-43-super-secret-jwt-key-2026-production';
const JWT_EXPIRES_IN = '7d';

export interface TokenPayload {
  userId: string;
  username: string;
  role: UserRole;
  fullName: string;
}

export class AuthService {
  public static async login(
    usernameInput: string,
    passwordInput: string,
    roleInput?: UserRole
  ): Promise<{ token: string; user: Omit<User, 'passwordHash'> }> {
    const username = usernameInput.trim();
    const user = dbService.findUserByUsername(username);

    if (!user) {
      throw new Error('Foydalanuvchi nomi yoki parol noto\'g\'ri.');
    }

    if (roleInput && user.role !== roleInput) {
      throw new Error(`Kiritilgan foydalanuvchi ${roleInput === 'ADMIN' ? 'Admin' : 'O\'quvchi'} hisobiga tegishli emas.`);
    }

    const isValidPassword = await bcrypt.compare(passwordInput, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Foydalanuvchi nomi yoki parol noto\'g\'ri.');
    }

    const payload: TokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      fullName: user.fullName,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    const { passwordHash: _, ...safeUser } = user;
    return { token, user: safeUser };
  }

  public static verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
      throw new Error('Yaroqsiz yoki muddati o\'tgan sessiya.');
    }
  }
}
