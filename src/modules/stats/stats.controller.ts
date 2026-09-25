import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MessageStatsResponseDto, OverviewStatsResponseDto, SessionStatsResponseDto } from './dto/stats-response.dto';
import { StatsService } from './stats.service';
import { StatsQueryDto } from './dto/stats-query.dto';
import { CurrentApiKey, RequireRole, RequireUnscopedKey } from '../auth/decorators/auth.decorators';
import { type ApiKey, ApiKeyRole } from '../auth/entities/api-key.entity';

@ApiTags('statistics')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  private resolveTenantUserId(apiKey?: ApiKey): string | null {
    if (!apiKey || apiKey.role === ApiKeyRole.ADMIN) return null;
    return apiKey.userId ?? (apiKey.id?.startsWith('user:') ? apiKey.id.replace('user:', '') : null);
  }

  // Cross-session aggregates scoped to requesting tenant (or global for admin).
  @Get('overview')
  @RequireRole(ApiKeyRole.USER)
  @RequireUnscopedKey()
  @ApiOperation({ summary: 'Get overall statistics' })
  @ApiResponse({
    status: 200,
    description: 'Session and message statistics (scoped to tenant for users, cross-instance for admin).',
    type: OverviewStatsResponseDto,
  })
  async getOverview(@CurrentApiKey() actor?: ApiKey) {
    return this.statsService.getOverview(this.resolveTenantUserId(actor));
  }

  @Get('messages')
  @RequireRole(ApiKeyRole.USER)
  @RequireUnscopedKey()
  @ApiOperation({ summary: 'Get message statistics with time series' })
  @ApiResponse({
    status: 200,
    description: 'Message statistics with a time series for the requested period (scoped to tenant for users).',
    type: MessageStatsResponseDto,
  })
  async getMessageStats(@Query() query: StatsQueryDto, @CurrentApiKey() actor?: ApiKey) {
    return this.statsService.getMessageStats(query.period || '24h', this.resolveTenantUserId(actor));
  }

  @Get('sessions/:sessionId')
  @ApiOperation({ summary: 'Get statistics for a specific session' })
  @ApiResponse({
    status: 200,
    description: 'Per-session statistics for the requested session.',
    type: SessionStatsResponseDto,
  })
  async getSessionStats(@Param('sessionId') sessionId: string, @CurrentApiKey() actor?: ApiKey) {
    return this.statsService.getSessionStats(sessionId, this.resolveTenantUserId(actor));
  }
}
