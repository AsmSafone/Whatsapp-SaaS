import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccountService } from './account.service';
import { AdminResetPasswordDto, AdminUpdatePlanDto, AdminUpdateUserDto } from './dto/admin-user.dto';
import { RequireRole, RequireUnscopedKey } from './decorators/auth.decorators';
import { ApiKeyRole } from './entities/api-key.entity';

@ApiTags('admin-users')
@Controller('admin/users')
@RequireRole(ApiKeyRole.ADMIN)
@RequireUnscopedKey()
export class AdminUsersController {
  constructor(private readonly accounts: AccountService) {}

  @Get()
  @ApiOperation({ summary: 'List all registered tenant accounts with session usage (Admin only)' })
  async listUsers() {
    return this.accounts.adminListUsers();
  }

  @Patch(':id/plan')
  @ApiOperation({ summary: 'Update user subscription plan (Admin only)' })
  async updatePlan(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AdminUpdatePlanDto) {
    return this.accounts.adminSetPlan(id, dto.plan);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user account profile or plan (Admin only)' })
  async updateUser(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AdminUpdateUserDto) {
    return this.accounts.adminUpdateUser(id, dto);
  }

  @Post(':id/reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset a user account password (Admin only)' })
  async resetPassword(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AdminResetPasswordDto) {
    return this.accounts.adminResetPassword(id, dto.newPassword);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a user account and associated sessions (Admin only)' })
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.accounts.adminDeleteUser(id);
  }
}
