import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

const execAsync = promisify(exec);

@Injectable()
export class AdminService {
  private readonly backupPassword = process.env.ADMIN_BACKUP_PASSWORD || 'admin123';

  constructor(private prisma: PrismaService, private mailService: MailService) {}

  verifyAdminPassword(password: string): boolean {
    return password === this.backupPassword;
  }

  async getAllRequests() {
    return this.prisma.analysisRequest.findMany({
      include: {
        user: true,
        samples: {
          include: {
            sampleAnalyses: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        adSoyad: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUserRole(userId: string, role: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
    });
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });
  }

  async updateRequestStatus(requestId: string, status: string) {
    const request = await this.prisma.analysisRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    const updatedRequest = await this.prisma.analysisRequest.update({
      where: { id: requestId },
      data: { status: status as any },
    });

    if (request?.user.email) {
      const requestNo = `#${requestId.slice(0, 8).toUpperCase()}`;
      this.mailService.sendStatusEmail(request.user.email, status, requestNo).catch((err) => {
        console.error('Failed to send status email:', err);
      });
    }

    return updatedRequest;
  }

  async uploadRequestResult(requestId: string, sonucUrl: string) {
    return this.prisma.analysisRequest.update({
      where: { id: requestId },
      data: { sonucUrl },
    });
  }

  async backupDatabase(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(process.cwd(), 'backups', `bumlab_backup_${timestamp}.sql`);

    const backupsDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    const dbUrl = process.env.DATABASE_URL;
    const match = dbUrl?.match(/mysql:\/\/([^:]+):?([^@]*)@([^:]+):(\d+)\/(.+)/);
    
    if (!match) {
      throw new Error('Invalid DATABASE_URL format');
    }

    const [, user, password, host, port, database] = match;
    const passwordFlag = password ? `-p${password}` : '';

    try {
      await execAsync(
        `mysqldump -u ${user} ${passwordFlag} -h ${host} -P ${port} ${database} > "${backupPath}"`,
      );
      return backupPath;
    } catch (error) {
      throw new Error(`Backup failed: ${error}`);
    }
  }

  async restoreDatabase(filePath: string): Promise<void> {
    const dbUrl = process.env.DATABASE_URL;
    const match = dbUrl?.match(/mysql:\/\/([^:]+):?([^@]*)@([^:]+):(\d+)\/(.+)/);
    
    if (!match) {
      throw new Error('Invalid DATABASE_URL format');
    }

    const [, user, password, host, port, database] = match;
    const passwordFlag = password ? `-p${password}` : '';

    try {
      await execAsync(
        `mysql -u ${user} ${passwordFlag} -h ${host} -P ${port} ${database} < "${filePath}"`,
      );
    } catch (error) {
      throw new Error(`Restore failed: ${error}`);
    }
  }
}
