import { Controller, Post, Body, UseGuards, Res, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { multerOptions } from '../common/config/multer.config';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('backup')
  async backup(@Body('password') password: string, @Res() res: Response) {
    if (!this.adminService.verifyAdminPassword(password)) {
      throw new BadRequestException('Invalid password');
    }
    const backupFile = await this.adminService.backupDatabase();
    res.download(backupFile, 'bumlab_backup.sql', (err) => {
      if (err) {
        res.status(500).json({ message: 'Backup failed' });
      }
    });
  }

  @Post('restore')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async restore(@UploadedFile() file: Express.Multer.File, @Body('password') password: string) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    if (!this.adminService.verifyAdminPassword(password)) {
      throw new BadRequestException('Invalid password');
    }
    await this.adminService.restoreDatabase(file.path);
    return { message: 'Database restored successfully' };
  }
}
