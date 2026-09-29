import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
    const ext = extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only jpg, jpeg, png, and pdf files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
};
