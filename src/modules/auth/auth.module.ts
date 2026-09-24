import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ApiKey } from './entities/api-key.entity';
import { User } from './entities/user.entity';
import { Session } from '../session/entities/session.entity';
import { AuthService } from './auth.service';
import { AccountService } from './account.service';
import { ApiKeyUsageTracker } from './api-key-usage-tracker.service';
import { ChatScopeService } from './chat-scope.service';
import { AuthController } from './auth.controller';
import { AuthValidateController } from './auth-validate.controller';
import { AccountController } from './account.controller';
import { ApiKeyGuard } from './guards/api-key.guard';
import { ProxyAwareThrottlerGuard } from '../../common/security/proxy-aware-throttler.guard';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ApiKey, User], 'main'), TypeOrmModule.forFeature([Session], 'data')],
  controllers: [AuthController, AuthValidateController, AccountController],
  providers: [
    AuthService,
    AccountService,
    ApiKeyUsageTracker,
    ChatScopeService,
    {
      provide: APP_GUARD,
      useClass: ProxyAwareThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
  ],
  exports: [AuthService, ChatScopeService, AccountService],
})
export class AuthModule {}
