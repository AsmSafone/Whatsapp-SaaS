import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Ada Lovelace' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'dev@zaptura.io' })
  @IsEmail()
  @MaxLength(190)
  email!: string;

  @ApiProperty({ example: 'at-least-8-chars' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}

export class LoginDto {
  @ApiProperty({ example: 'dev@zaptura.io' })
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
