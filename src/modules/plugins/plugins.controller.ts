import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Header,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { PluginsService } from './plugins.service';
import {
  PluginDto,
  PluginConfigDto,
  PluginSessionsDto,
  InstallFromUrlDto,
  PluginActionResponseDto,
  PluginHealthResponseDto,
  PluginCatalogEntryDto,
} from './dto/plugin.dto';
import type { CatalogPlugin } from './catalog';
import { RequireRole, RequireUnscopedKey, CurrentApiKey } from '../auth/decorators/auth.decorators';
import { type ApiKey, ApiKeyRole } from '../auth/entities/api-key.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../session/entities/session.entity';

/** Max accepted upload size for a plugin package (compressed). */
const MAX_PLUGIN_UPLOAD_BYTES = 5 * 1024 * 1024;

@ApiTags('plugins')
@Controller('plugins')
export class PluginsController {
  constructor(
    private readonly pluginsService: PluginsService,
    @InjectRepository(Session, 'data')
    private readonly sessionRepo: Repository<Session>,
  ) {}

  private resolveTenantUserId(apiKey?: ApiKey): string | null {
    if (!apiKey) return null;
    if (apiKey.role === ApiKeyRole.ADMIN) {
      return null;
    }
    return apiKey.userId ?? (apiKey.id.startsWith('user:') ? apiKey.id.replace('user:', '') : null);
  }

  @Get()
  @RequireRole(ApiKeyRole.USER)
  @ApiOperation({ summary: 'List all plugins' })
  @ApiResponse({ status: 200, description: 'List of all plugins', type: PluginDto, isArray: true })
  findAll(@CurrentApiKey() actor?: ApiKey): PluginDto[] {
    return this.pluginsService.findAll(this.resolveTenantUserId(actor));
  }

  @Post('install')
  @RequireRole(ApiKeyRole.USER)
  @RequireUnscopedKey()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_PLUGIN_UPLOAD_BYTES } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary', description: 'The plugin .zip package' } },
    },
  })
  @ApiOperation({ summary: 'Install a plugin from an uploaded .zip package' })
  @ApiResponse({ status: 201, description: 'Plugin installed', type: PluginDto })
  @ApiResponse({ status: 400, description: 'Invalid package' })
  @ApiResponse({ status: 409, description: 'Plugin already installed' })
  install(@UploadedFile() file: { buffer?: Buffer }, @CurrentApiKey() actor?: ApiKey): PluginDto {
    return this.pluginsService.install(file, this.resolveTenantUserId(actor));
  }

  @Post('install-url')
  @RequireRole(ApiKeyRole.USER)
  @RequireUnscopedKey()
  @ApiOperation({ summary: 'Install a plugin by downloading its .zip from a URL (SSRF-guarded)' })
  @ApiResponse({ status: 201, description: 'Plugin installed', type: PluginDto })
  @ApiResponse({ status: 400, description: 'Invalid URL, download failed, or invalid package' })
  @ApiResponse({ status: 409, description: 'Plugin already installed' })
  async installFromUrl(@Body() dto: InstallFromUrlDto, @CurrentApiKey() actor?: ApiKey): Promise<PluginDto> {
    return await this.pluginsService.installFromUrl(dto.url, this.resolveTenantUserId(actor));
  }

  // Declared before `:id` so `GET /plugins/catalog` is not captured by the `:id` route.
  @Get('catalog')
  @RequireRole(ApiKeyRole.USER)
  @RequireUnscopedKey()
  @ApiOperation({ summary: 'List the remote plugin catalog, annotated with install state' })
  @ApiResponse({ status: 200, description: 'Catalog entries', type: [PluginCatalogEntryDto] })
  @ApiResponse({ status: 400, description: 'Catalog could not be fetched or parsed' })
  async catalog(): Promise<CatalogPlugin[]> {
    return await this.pluginsService.getCatalog();
  }

  @Get(':id')
  @RequireRole(ApiKeyRole.USER)
  @ApiOperation({ summary: 'Get plugin by ID' })
  @ApiResponse({ status: 200, description: 'Plugin details', type: PluginDto })
  @ApiResponse({ status: 404, description: 'Plugin not found' })
  findOne(@Param('id') id: string, @CurrentApiKey() actor?: ApiKey): PluginDto {
    return this.pluginsService.findOne(id, this.resolveTenantUserId(actor));
  }

  @Post(':id/enable')
  @RequireRole(ApiKeyRole.USER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enable a plugin' })
  @ApiResponse({ status: 200, description: 'Plugin enabled successfully', type: PluginActionResponseDto })
  async enable(@Param('id') id: string, @CurrentApiKey() actor?: ApiKey): Promise<{ success: boolean; message: string }> {
    return await this.pluginsService.enable(id, this.resolveTenantUserId(actor));
  }

  @Post(':id/disable')
  @RequireRole(ApiKeyRole.USER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable a plugin' })
  @ApiResponse({ status: 200, description: 'Plugin disabled successfully', type: PluginActionResponseDto })
  async disable(@Param('id') id: string, @CurrentApiKey() actor?: ApiKey): Promise<{ success: boolean; message: string }> {
    return await this.pluginsService.disable(id, this.resolveTenantUserId(actor));
  }

  @Put(':id/config')
  @RequireRole(ApiKeyRole.USER)
  @ApiOperation({ summary: 'Update plugin configuration' })
  @ApiResponse({ status: 200, description: 'Plugin configuration updated', type: PluginActionResponseDto })
  updateConfig(
    @Param('id') id: string,
    @Body() configDto: PluginConfigDto,
    @CurrentApiKey() actor?: ApiKey,
  ): { success: boolean; message: string } {
    return this.pluginsService.updateConfig(id, configDto.config, this.resolveTenantUserId(actor));
  }

  @Get(':id/config-ui')
  @RequireRole(ApiKeyRole.USER)
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Content-Security-Policy', 'sandbox')
  @Header('X-Content-Type-Options', 'nosniff')
  @ApiOperation({ summary: "Serve a plugin's sandboxed config-UI entry HTML (for an iframe srcdoc)" })
  @ApiResponse({
    status: 200,
    description: 'Config UI HTML',
    content: { 'text/html': { schema: { type: 'string' } } },
  })
  @ApiResponse({ status: 404, description: 'Plugin not found or has no config UI' })
  getConfigUi(@Param('id') id: string, @CurrentApiKey() actor?: ApiKey): string {
    const tenantUserId = this.resolveTenantUserId(actor);
    if (tenantUserId) {
      this.pluginsService.findOne(id, tenantUserId);
    }
    return this.pluginsService.getConfigUiHtml(id);
  }

  @Put(':id/config/:sessionId')
  @RequireRole(ApiKeyRole.USER)
  @ApiOperation({ summary: 'Set a plugin config override for a specific session (empty = clear it)' })
  @ApiResponse({ status: 200, description: 'Per-session plugin configuration updated', type: PluginActionResponseDto })
  @ApiResponse({ status: 400, description: 'Plugin is global (not session-scoped)' })
  @ApiResponse({ status: 404, description: 'Plugin not found' })
  async updateSessionConfig(
    @Param('id') id: string,
    @Param('sessionId') sessionId: string,
    @Body() configDto: PluginConfigDto,
    @CurrentApiKey() actor?: ApiKey,
  ): Promise<{ success: boolean; message: string }> {
    const tenantUserId = this.resolveTenantUserId(actor);
    if (tenantUserId) {
      if (actor?.allowedSessions && !actor.allowedSessions.includes(sessionId)) {
        throw new ForbiddenException("Cannot configure a session outside the account's allowed sessions");
      }
      const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
      if (!session || session.ownerUserId !== tenantUserId) {
        throw new ForbiddenException("Cannot configure a session outside the account's allowed sessions");
      }
    }
    return this.pluginsService.updateSessionConfig(id, sessionId, configDto.config, tenantUserId);
  }

  @Put(':id/sessions')
  @RequireRole(ApiKeyRole.USER)
  @RequireUnscopedKey()
  @ApiOperation({ summary: "Set which sessions a session-scoped plugin is activated for (['*'] = all)" })
  @ApiResponse({ status: 200, description: 'Plugin session activation updated', type: PluginDto })
  @ApiResponse({ status: 400, description: 'Plugin is global (not session-scoped)' })
  @ApiResponse({
    status: 403,
    description:
      'A session-restricted key may not replace the full active set — full activation replacement requires an unrestricted key',
  })
  @ApiResponse({ status: 404, description: 'Plugin not found' })
  async updateSessions(
    @Param('id') id: string,
    @Body() dto: PluginSessionsDto,
    @CurrentApiKey() actor?: ApiKey,
  ): Promise<PluginDto> {
    const tenantUserId = this.resolveTenantUserId(actor);
    if (tenantUserId) {
      for (const s of dto.sessions) {
        if (s !== '*') {
          if (actor?.allowedSessions && !actor.allowedSessions.includes(s)) {
            throw new ForbiddenException(`Session ${s} is outside your account's allowed sessions`);
          }
          const session = await this.sessionRepo.findOne({ where: { id: s } });
          if (!session || session.ownerUserId !== tenantUserId) {
            throw new ForbiddenException(`Session ${s} is outside your account's allowed sessions`);
          }
        }
      }
    }
    return this.pluginsService.updateSessions(id, dto.sessions, tenantUserId);
  }

  @Post(':id/update')
  @RequireRole(ApiKeyRole.USER)
  @RequireUnscopedKey()
  @ApiOperation({ summary: 'Update an installed plugin in place from a URL (preserves config + enabled state)' })
  @ApiResponse({ status: 201, description: 'Plugin updated', type: PluginDto })
  @ApiResponse({ status: 400, description: 'Invalid URL/package, id mismatch, or built-in' })
  @ApiResponse({ status: 404, description: 'Plugin not found' })
  async update(@Param('id') id: string, @Body() dto: InstallFromUrlDto, @CurrentApiKey() actor?: ApiKey): Promise<PluginDto> {
    const tenantUserId = this.resolveTenantUserId(actor);
    this.pluginsService.findOne(id, tenantUserId);
    return await this.pluginsService.updateFromUrl(id, dto.url);
  }

  @Delete(':id')
  @RequireRole(ApiKeyRole.USER)
  @RequireUnscopedKey()
  @ApiOperation({ summary: 'Uninstall a plugin (removes its files; built-ins are protected)' })
  @ApiResponse({ status: 200, description: 'Plugin uninstalled', type: PluginActionResponseDto })
  @ApiResponse({ status: 400, description: 'Cannot uninstall (e.g. built-in)' })
  @ApiResponse({ status: 404, description: 'Plugin not found' })
  async uninstall(@Param('id') id: string, @CurrentApiKey() actor?: ApiKey): Promise<{ success: boolean; message: string }> {
    return await this.pluginsService.uninstall(id, this.resolveTenantUserId(actor));
  }

  @Get(':id/health')
  @RequireRole(ApiKeyRole.USER)
  @RequireUnscopedKey()
  @ApiOperation({ summary: 'Check plugin health' })
  @ApiResponse({ status: 200, description: 'Plugin health status', type: PluginHealthResponseDto })
  async healthCheck(@Param('id') id: string, @CurrentApiKey() actor?: ApiKey): Promise<{ healthy: boolean; message?: string }> {
    const tenantUserId = this.resolveTenantUserId(actor);
    this.pluginsService.findOne(id, tenantUserId);
    return await this.pluginsService.healthCheck(id);
  }
}
