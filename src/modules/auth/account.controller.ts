import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, UnauthorizedException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccountService, resolveDefaultAdminEmail } from './account.service';
import { ChangePasswordDto, ChangePlanDto, LoginDto, RegisterDto, UpdateProfileDto } from './dto/account.dto';
import { Public, CurrentApiKey } from './decorators/auth.decorators';
import { PLAN_CATALOG, PLAN_LIMITS } from './saas-plans';
import type { ApiKey } from './entities/api-key.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../session/entities/session.entity';

@ApiTags('account')
@Controller('account')
export class AccountController {
  constructor(
    private readonly accounts: AccountService,
    @InjectRepository(Session, 'data')
    private readonly sessions: Repository<Session>,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a Zaptura account' })
  async register(@Body() dto: RegisterDto) {
    const issued = await this.accounts.register(dto);
    return { ...issued, sessionCount: 0 };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in to a Zaptura account' })
  async login(@Body() dto: LoginDto) {
    const issued = await this.accounts.login(dto.email, dto.password);
    const sessionCount = await this.sessions.count({ where: { ownerUserId: issued.id } });
    return { ...issued, sessionCount };
  }

  @Public()
  @Get('plans')
  @ApiOperation({ summary: 'List mocked subscription plans' })
  plans() {
    return PLAN_CATALOG;
  }

  @Get('me')
  @ApiOperation({ summary: 'Current account profile' })
  async me(@CurrentApiKey() actor?: ApiKey) {
    if (!actor?.userId) {
      return {
        id: actor?.id ?? null,
        name: actor?.name ?? 'API key',
        email: null,
        plan: 'platform',
        sessionLimit: null,
        sessionCount: null,
        role: actor?.role === 'admin' ? 'admin' : 'user',
      };
    }
    const user = await this.accounts.findById(actor.userId);
    const sessionCount = await this.sessions.count({ where: { ownerUserId: actor.userId } });
    const isOwner = user?.email.toLowerCase() === resolveDefaultAdminEmail().toLowerCase();
    return {
      id: user?.id,
      name: user?.name,
      email: user?.email,
      plan: user?.plan,
      sessionLimit: user ? PLAN_LIMITS[user.plan] : 1,
      sessionCount,
      role: isOwner ? 'admin' : 'user',
    };
  }

  @Patch('plan')
  @ApiOperation({ summary: 'Change plan (mocked, no payment)' })
  async changePlan(@Body() dto: ChangePlanDto, @CurrentApiKey() actor?: ApiKey) {
    if (!actor?.userId) {
      return { ok: false, message: 'Plan changes apply to user accounts only' };
    }
    const user = await this.accounts.setPlan(actor.userId, dto.plan);
    const sessionCount = await this.sessions.count({ where: { ownerUserId: user.id } });
    const issued = this.accounts.issue(user);
    return { ...issued, sessionCount };
  }

  @Patch('password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change account password' })
  async changePassword(@Body() dto: ChangePasswordDto, @CurrentApiKey() actor?: ApiKey) {
    if (!actor?.userId) {
      throw new UnauthorizedException('Password changes apply to user accounts only');
    }
    await this.accounts.changePassword(actor.userId, dto.currentPassword, dto.newPassword);
    return { ok: true, message: 'Password updated successfully' };
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update account profile' })
  async updateProfile(@Body() dto: UpdateProfileDto, @CurrentApiKey() actor?: ApiKey) {
    if (!actor?.userId) {
      throw new UnauthorizedException('Profile updates apply to user accounts only');
    }
    const user = await this.accounts.updateProfile(actor.userId, dto);
    const sessionCount = await this.sessions.count({ where: { ownerUserId: user.id } });
    const issued = this.accounts.issue(user);
    return { ...issued, sessionCount };
  }
}
