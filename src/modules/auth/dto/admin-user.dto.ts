import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import type { UserPlan } from '../entities/user.entity';

const VALID_PLANS: UserPlan[] = ['starter', 'pro', 'plus', 'business'];

export class AdminUpdatePlanDto {
  @ApiProperty({ enum: VALID_PLANS, example: 'pro', description: 'User subscription plan' })
  @IsIn(VALID_PLANS, { message: 'Plan must be one of: starter, pro, plus, business' })
  plan!: 'starter' | 'pro' | 'plus' | 'business';
}

export class AdminUpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: VALID_PLANS, example: 'pro' })
  @IsOptional()
  @IsIn(VALID_PLANS, { message: 'Plan must be one of: starter, pro, plus, business' })
  plan?: 'starter' | 'pro' | 'plus' | 'business';
}

export class AdminResetPasswordDto {
  @ApiProperty({ example: 'NewSecretPass123', minLength: 8, description: 'New password for the user' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  newPassword!: string;
}
