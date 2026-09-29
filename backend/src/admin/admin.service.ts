import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

@Injectable()
export class AdminService {
  private readonly backupPassword = process.env.ADMIN_BACKUP_PASSWORD || 'admin123';

  verifyAdminPassword(password: string): boolean {
    return password === this.backupPassword;
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
