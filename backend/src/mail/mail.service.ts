import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'test@gmail.com',
        pass: process.env.SMTP_PASS || 'test',
      },
    });
  }

  async sendStatusEmail(to: string, status: string, requestNo: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@bumlab.com.tr',
        to,
        subject: `[MÜNTEAM] Talep Durum Güncellemesi - ${requestNo}`,
        text: `Talebinizin durumu güncellendi: ${status}\n\n--\nMÜNTEAM\nMunzur Üniversitesi Nadir Toprak Elementleri Merkezi`,
      });
    } catch (error) {
      console.error('Email sending failed:', error);
    }
  }
}
