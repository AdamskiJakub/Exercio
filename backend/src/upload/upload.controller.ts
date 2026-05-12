import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';

// Match the allowed types with UploadService (include 'image/jpg' for JPEG compatibility)
const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const allowedVideoTypes = ['video/mp4', 'video/webm'];

const createMulterOptions = (allowedTypes: string[], errorMessage: string) => ({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (_req: any, file: Express.Multer.File, callback: any) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return callback(new BadRequestException(errorMessage), false);
    }
    callback(null, true);
  },
});

// Multer options for profile photo (images only)
const profilePhotoMulterOptions = createMulterOptions(
  allowedImageTypes,
  'Invalid file type. Only JPEG, PNG, and WebP are allowed.'
);

// Multer options for gallery (images + videos)
const galleryMulterOptions = createMulterOptions(
  [...allowedImageTypes, ...allowedVideoTypes],
  'Invalid file type. Only JPEG, PNG, WebP, MP4, and WebM are allowed.'
);

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('profile-photo')
  @UseInterceptors(FileInterceptor('file', profilePhotoMulterOptions))
  async uploadProfilePhoto(@UploadedFile() file: Express.Multer.File) {
    const url = await this.uploadService.uploadFile(file, false);
    return { url };
  }

  @Post('gallery')
  @UseInterceptors(FilesInterceptor('files', 10, galleryMulterOptions))
  async uploadGalleryPhotos(@UploadedFiles() files: Express.Multer.File[]) {
    const urls = await this.uploadService.uploadMultipleFiles(files, true);
    return { urls };
  }
}
