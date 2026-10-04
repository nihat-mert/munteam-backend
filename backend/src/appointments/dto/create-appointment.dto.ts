import { IsDateString, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export const CIHAZLAR = ['SEM CİHAZI', 'UV CİHAZI'] as const;

export class CreateAppointmentDto {
  @IsString()
  @IsIn(CIHAZLAR)
  cihazAdi: string;

  @IsDateString()
  baslangicTarihi: string;

  @IsDateString()
  bitisTarihi: string;

  @IsOptional()
  @IsString()
  @MinLength(0)
  @MaxLength(2000)
  aciklama?: string;
}
