import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Ada Lovelace' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'dev@zapturawa.com' })
  @IsEmail()
  @MaxLength(190)
  email!: string;

  @ApiProperty({ example: 'at-least-8-chars' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @ApiPropertyOptional({ enum: ['starter', 'pro', 'plus', 'business'], default: 'starter' })
  @IsOptional()
  @IsIn(['starter', 'pro', 'plus', 'business'])
  plan?: 'starter' | 'pro' | 'plus' | 'business';
}

export class LoginDto {
  @ApiProperty({ example: 'dev@zapturawa.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'at-least-8-chars' })
  @IsString()
  @MinLength(1)
  password!: string;
}

export class ChangePlanDto {
  @ApiProperty({ enum: ['starter', 'pro', 'plus', 'business'] })
  @IsIn(['starter', 'pro', 'plus', 'business'])
  plan!: 'starter' | 'pro' | 'plus' | 'business';
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'current-secret-password' })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  currentPassword!: string;

  @ApiProperty({ example: 'new-secret-password-8-chars' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Ada Lovelace' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ example: 'dev@zapturawa.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(190)
  email?: string;
}

export class AccountResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  plan!: string;

  @ApiProperty()
  sessionLimit!: number;

  @ApiProperty()
  sessionCount!: number;

  @ApiPropertyOptional()
  token?: string;
}
