import { IsEmail, IsString, MinLength, IsOptional, IsEnum, IsPhoneNumber, Length, Matches } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  rememberMe?: boolean;
}

export class CheckEmailDto {
  @IsEmail()
  email: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one digit',
  })
  password: string;

  @IsString()
  adSoyad: string;

  @IsOptional()
  @IsString()
  unvan?: string;

  @IsString()
  @Matches(/^[0-9]{11}$/, {
    message: 'Phone number must be 11 digits',
  })
  telefon: string;

  @IsEnum(['BIREYSEL', 'KURUMSAL'])
  kurumTipi: 'BIREYSEL' | 'KURUMSAL';

  @IsOptional()
  @IsString()
  @Length(11, 11)
  @Matches(/^[0-9]+$/, {
    message: 'TC Kimlik No must be 11 digits',
  })
  tcKimlik?: string;

  @IsOptional()
  @IsString()
  vergiNo?: string;

  @IsOptional()
  @IsString()
  faturaAdresi?: string;

  @IsOptional()
  @IsString()
  iletisimAdresi?: string;
}
