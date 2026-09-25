import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { User, UserPlan } from './entities/user.entity';
import { ApiKey, ApiKeyRole } from './entities/api-key.entity';
import { Session } from '../session/entities/session.entity';
import { hashPassword, signUserToken, verifyPassword, verifyUserToken } from './user-token';
import { PLAN_LIMITS } from './saas-plans';
import { RegisterDto } from './dto/account.dto';
import { readBootstrapAccount, writeBootstrapAccount } from './bootstrap-account-file';

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
        plan: dto.plan || 'starter',
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

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<User> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Account not found');
    if (!verifyPassword(currentPassword, user.passwordHash)) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    user.passwordHash = hashPassword(newPassword);
    const saved = await this.users.save(user);

    // Keep data/.admin-account updated if changing default admin's password
    if (user.email === resolveDefaultAdminEmail()) {
      try {
        writeBootstrapAccount(user.email, newPassword);
      } catch {
        // file write non-fatal
      }
    }

    return saved;
  }

  async updateProfile(userId: string, dto: { name?: string; email?: string }): Promise<User> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Account not found');

    const oldEmail = user.email;

    if (dto.name !== undefined && dto.name.trim().length > 0) {
      user.name = dto.name.trim();
    }

    if (dto.email !== undefined && dto.email.trim().length > 0) {
      const nextEmail = dto.email.trim().toLowerCase();
      if (nextEmail !== user.email) {
        const existing = await this.users.findOne({ where: { email: nextEmail } });
        if (existing && existing.id !== user.id) {
          throw new ConflictException('An account with this email already exists');
        }
        user.email = nextEmail;
      }
    }

    const saved = await this.users.save(user);

    // Keep data/.admin-account updated if default admin's email was changed
    if (oldEmail === resolveDefaultAdminEmail() && user.email !== oldEmail) {
      try {
        const currentData = readBootstrapAccount({ warn: () => {} });
        if (currentData?.password) {
          writeBootstrapAccount(saved.email, currentData.password);
        }
      } catch {
        // file write non-fatal
      }
    }

    return saved;
  }

  async fromToken(token: string): Promise<User | null> {
    const payload = verifyUserToken(token, this.jwtSecret());
    if (!payload?.sub) return null;
    return this.findById(payload.sub);
  }

  issue(user: User) {
    const isOwner = user.email.toLowerCase() === resolveDefaultAdminEmail().toLowerCase();
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
      role: isOwner ? 'admin' : 'user',
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

    const isOwner = user.email.toLowerCase() === resolveDefaultAdminEmail().toLowerCase();

    apiKey.role = isOwner ? ApiKeyRole.ADMIN : ApiKeyRole.USER;
    apiKey.allowedIps = null;
    if (isOwner) {
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

  async adminListUsers(): Promise<AdminUserView[]> {
    const users = await this.users.find({ order: { createdAt: 'DESC' } });
    const defaultAdmin = resolveDefaultAdminEmail().toLowerCase();

    const sessionCountsRaw = await this.sessions
      .createQueryBuilder('s')
      .select('s.ownerUserId', 'ownerUserId')
      .addSelect('COUNT(s.id)', 'count')
      .where('s.ownerUserId IS NOT NULL')
      .groupBy('s.ownerUserId')
      .getRawMany<{ ownerUserId: string; count: string }>();

    const countMap = new Map<string, number>();
    for (const row of sessionCountsRaw) {
      if (row.ownerUserId) {
        countMap.set(row.ownerUserId, parseInt(row.count, 10) || 0);
      }
    }

    return users.map(user => {
      const isOwner = user.email.toLowerCase() === defaultAdmin;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        role: isOwner ? 'admin' : 'user',
        sessionCount: countMap.get(user.id) || 0,
        sessionLimit: PLAN_LIMITS[user.plan] ?? 1,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    });
  }

  async adminSetPlan(userId: string, plan: UserPlan): Promise<AdminUserView> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.plan = plan;
    const saved = await this.users.save(user);
    const sessionCount = await this.sessions.count({ where: { ownerUserId: user.id } });
    const isOwner = saved.email.toLowerCase() === resolveDefaultAdminEmail().toLowerCase();
    return {
      id: saved.id,
      name: saved.name,
      email: saved.email,
      plan: saved.plan,
      role: isOwner ? 'admin' : 'user',
      sessionCount,
      sessionLimit: PLAN_LIMITS[saved.plan] ?? 1,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }

  async adminUpdateUser(
    userId: string,
    dto: { name?: string; email?: string; plan?: UserPlan },
  ): Promise<AdminUserView> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const defaultAdmin = resolveDefaultAdminEmail().toLowerCase();
    const isOwner = user.email.toLowerCase() === defaultAdmin;

    if (dto.name !== undefined && dto.name.trim().length > 0) {
      user.name = dto.name.trim();
    }

    if (dto.email !== undefined && dto.email.trim().length > 0) {
      const nextEmail = dto.email.trim().toLowerCase();
      if (nextEmail !== user.email.toLowerCase()) {
        const existing = await this.users.findOne({ where: { email: nextEmail } });
        if (existing && existing.id !== user.id) {
          throw new ConflictException('An account with this email already exists');
        }
        user.email = nextEmail;
      }
    }

    if (dto.plan !== undefined) {
      user.plan = dto.plan;
    }

    const saved = await this.users.save(user);
    const sessionCount = await this.sessions.count({ where: { ownerUserId: user.id } });
    return {
      id: saved.id,
      name: saved.name,
      email: saved.email,
      plan: saved.plan,
      role: isOwner ? 'admin' : 'user',
      sessionCount,
      sessionLimit: PLAN_LIMITS[saved.plan] ?? 1,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }

  async adminResetPassword(userId: string, newPassword: string): Promise<{ ok: boolean; message: string }> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.passwordHash = hashPassword(newPassword);
    await this.users.save(user);

    if (user.email.toLowerCase() === resolveDefaultAdminEmail().toLowerCase()) {
      try {
        writeBootstrapAccount(user.email, newPassword);
      } catch {
        // file write non-fatal
      }
    }

    return { ok: true, message: 'Password has been reset successfully' };
  }

  async adminDeleteUser(userId: string): Promise<{ ok: boolean }> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const defaultAdmin = resolveDefaultAdminEmail().toLowerCase();
    if (user.email.toLowerCase() === defaultAdmin) {
      throw new ForbiddenException('The primary owner/admin account cannot be deleted');
    }

    await this.sessions.delete({ ownerUserId: user.id });
    await this.users.delete({ id: user.id });

    return { ok: true };
  }
}

export interface AdminUserView {
  id: string;
  name: string;
  email: string;
  plan: UserPlan;
  role: 'admin' | 'user';
  sessionCount: number;
  sessionLimit: number;
  createdAt: Date;
  updatedAt: Date;
}
