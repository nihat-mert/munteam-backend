import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async checkEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return { exists: !!user };
  }

  async register(registerDto: any) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        adSoyad: registerDto.adSoyad,
        unvan: registerDto.unvan,
        telefon: registerDto.telefon,
        kurumTipi: registerDto.kurumTipi,
        tcKimlik: registerDto.tcKimlik,
        vergiNo: registerDto.vergiNo,
        faturaAdresi: registerDto.faturaAdresi,
        iletisimAdresi: registerDto.iletisimAdresi,
      },
    });
    return { id: user.id, email: user.email, role: user.role };
  }

  async login(email: string, password: string, rememberMe: boolean = false) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    const expiresIn = rememberMe ? '30d' : '24h';
    const accessToken = this.jwtService.sign(payload, { expiresIn });
    return {
      accessToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async validateUser(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      
      // Add timeout to prevent hanging on database issues
      const user = await Promise.race([
        this.prisma.user.findUnique({
          where: { id: payload.sub },
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database timeout')), 5000)
        ),
      ]) as any;
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return { id: user.id, email: user.email, role: user.role };
    } catch (error) {
      console.log('validateUser error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  async forgotPassword(email: string) {
    // TODO: Implement email sending service integration
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return { message: 'Password reset link sent to email' };
  }
}
