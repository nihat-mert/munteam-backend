import { Controller, Post, Body, UseGuards, Res, UploadedFile, UseInterceptors, BadRequestException, Get, Patch, Param } from '@nestjs/common';
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

  @Get('all-requests')
  getAllRequests() {
    return this.adminService.getAllRequests();
  }

  @Get('requests')
  getRequests() {
    return this.adminService.getAllRequests();
  }

  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Patch('requests/:id/status')
  updateRequestStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.adminService.updateRequestStatus(id, body.status);
  }

  @Post('requests/:id/result')
  uploadRequestResult(@Param('id') id: string, @Body() body: { sonucUrl: string }) {
    return this.adminService.uploadRequestResult(id, body.sonucUrl);
  }

  @Patch('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body() body: { role: string }) {
    return this.adminService.updateUserRole(id, body.role);
  }

  @Patch('users/:id/status')
  updateUserStatus(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    return this.adminService.updateUserStatus(id, body.isActive);
  }

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
