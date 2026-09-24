import { ConflictException, Injectable, Optional, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { User, UserPlan } from './entities/user.entity';
import { ApiKey, ApiKeyRole } from './entities/api-key.entity';
import { Session } from '../session/entities/session.entity';
import { hashPassword, signUserToken, verifyPassword, verifyUserToken } from './user-token';
import { PLAN_LIMITS } from './saas-plans';
import { RegisterDto } from './dto/account.dto';

export function resolveDefaultAdminEmail(): string {
  return (
    process.env.ADMIN_EMAIL?.trim().toLowerCase() ||
    process.env.DEFAULT_ADMIN_EMAIL?.trim().toLowerCase() ||
    'admin@zaptura.io'
  );
}

export function resolveDefaultAdminPassword(): { password: string; isGenerated: boolean } {
  if (process.env.ADMIN_PASSWORD) {
    return { password: process.env.ADMIN_PASSWORD, isGenerated: false };
  }
  if (process.env.DEFAULT_ADMIN_PASSWORD) {
    return { password: process.env.DEFAULT_ADMIN_PASSWORD, isGenerated: false };
  }
  if (process.env.ALLOW_DEV_API_KEY === 'true') {
    return { password: 'dev-admin-password', isGenerated: false };
  }
  return { password: randomBytes(16).toString('hex'), isGenerated: true };
}

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(User, 'main')
    private readonly users: Repository<User>,
    @InjectRepository(Session, 'data')
    private readonly sessions: Repository<Session>,
    @Optional()
    @InjectRepository(ApiKey, 'main')
    private readonly apiKeys?: Repository<ApiKey>,
  ) {}

  jwtSecret(): string {
    return process.env.USER_JWT_SECRET || process.env.API_KEY_PEPPER || 'zaptura-dev-jwt-secret';
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.users.findOne({ where: { email } });
    if (existing) throw new ConflictException('An account with this email already exists');
    const user = await this.users.save(
      this.users.create({
        name: dto.name.trim(),
        email,
        passwordHash: hashPassword(dto.password),
        plan: 'starter',
      }),
    );
    return this.issue(user);
  }

  async login(email: string, password: string) {
    const user = await this.users.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.issue(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.users.findOne({ where: { id } });
  }

  async setPlan(id: string, plan: UserPlan): Promise<User> {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new UnauthorizedException('Account not found');
    user.plan = plan;
    return this.users.save(user);
  }

  async fromToken(token: string): Promise<User | null> {
    const payload = verifyUserToken(token, this.jwtSecret());
    if (!payload?.sub) return null;
    return this.findById(payload.sub);
  }

  issue(user: User) {
    const token = signUserToken(
      { sub: user.id, email: user.email, name: user.name, plan: user.plan },
      this.jwtSecret(),
    );
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      sessionLimit: PLAN_LIMITS[user.plan] ?? 1,
      token,
    };
  }

  async ensureDefaultAdminUser(): Promise<{ user: User; rawPassword?: string; isNew: boolean }> {
    const email = resolveDefaultAdminEmail();
    const existing = await this.users.findOne({ where: { email } });
    if (existing) {
      return { user: existing, isNew: false };
    }

    const { password } = resolveDefaultAdminPassword();
    const adminName = process.env.ADMIN_NAME?.trim() || process.env.DEFAULT_ADMIN_NAME?.trim() || 'Admin';
    const user = await this.users.save(
      this.users.create({
        name: adminName,
        email,
        passwordHash: hashPassword(password),
        plan: 'business',
      }),
    );

    return { user, rawPassword: password, isNew: true };
  }

  async actorFromToken(token: string): Promise<ApiKey> {
    const user = await this.fromToken(token);
    if (!user) throw new UnauthorizedException('Invalid session');
    const owned = await this.sessions.find({ where: { ownerUserId: user.id }, select: { id: true } });
    const apiKey = new ApiKey();
    apiKey.id = `user:${user.id}`;
    apiKey.name = user.name;
    apiKey.keyHash = '';
    apiKey.keyPrefix = 'nxw_jwt';

    let isAdmin = user.email.toLowerCase() === resolveDefaultAdminEmail().toLowerCase();
    if (!isAdmin && this.apiKeys) {
      const adminKey = await this.apiKeys.findOne({
        where: { userId: user.id, role: ApiKeyRole.ADMIN, isActive: true },
      });
      if (adminKey) {
        isAdmin = true;
      }
    }

    apiKey.role = isAdmin ? ApiKeyRole.ADMIN : ApiKeyRole.OPERATOR;
    apiKey.allowedIps = null;
    if (isAdmin) {
      apiKey.allowedSessions = null;
    } else {
      apiKey.allowedSessions = owned.length > 0 ? owned.map(row => row.id) : ['00000000-0000-4000-a000-000000000000'];
    }
    apiKey.allowedChats = null;
    apiKey.isActive = true;
    apiKey.expiresAt = null;
    apiKey.lastUsedAt = null;
    apiKey.usageCount = 0;
    apiKey.userId = user.id;
    apiKey.plan = user.plan;
    apiKey.createdAt = user.createdAt;
    apiKey.updatedAt = user.updatedAt;
    return apiKey;
  }
}

