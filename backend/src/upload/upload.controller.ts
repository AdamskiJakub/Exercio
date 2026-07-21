import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  Res,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  BadRequestException,
  Header,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';

// Match the allowed types with UploadService (include 'image/jpg' for JPEG compatibility)
// HEIC/HEIF added for iOS compatibility (iPhone default photo format)
const allowedImageTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];
const allowedVideoTypes = ['video/mp4', 'video/webm'];

const MAX_FILE_SIZE =
  parseInt(process.env.MAX_FILE_SIZE_BYTES ?? '', 10) || 5 * 1024 * 1024; // 5MB default

const createMulterOptions = (allowedTypes: string[], errorMessage: string) => ({
  limits: {
    fileSize: MAX_FILE_SIZE,
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
  'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
);

// Multer options for gallery (images + videos)
const galleryMulterOptions = createMulterOptions(
  [...allowedImageTypes, ...allowedVideoTypes],
  'Invalid file type. Only JPEG, PNG, WebP, MP4, and WebM are allowed.',
);

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // ── Standard multipart/form-data endpoints (desktop) ──────────────────────

  @Post('profile-photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', profilePhotoMulterOptions))
  async uploadProfilePhoto(@UploadedFile() file: Express.Multer.File) {
    const url = await this.uploadService.uploadFile(file, false);
    return { url };
  }

  @Post('gallery')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10, galleryMulterOptions))
  async uploadGalleryPhotos(@UploadedFiles() files: Express.Multer.File[]) {
    const urls = await this.uploadService.uploadMultipleFiles(files, true);
    return { urls };
  }

  @Post('thumbnail')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', profilePhotoMulterOptions))
  async uploadThumbnail(@UploadedFile() file: Express.Multer.File) {
    const url = await this.uploadService.uploadFile(file, false);
    return { url };
  }

  // ── Raw binary endpoints (mobile - no multipart preflight) ────────────────
  // These accept application/octet-stream with filename in X-File-Name header.
  // No Multer - we read the raw body buffer directly.

  @Post('raw/profile-photo')
  @UseGuards(JwtAuthGuard)
  async uploadRawProfilePhoto(@Req() req: Request): Promise<{ url: string }> {
    const buffer = await this.readRawBody(req);
    const contentType =
      (req.headers['content-type'] as string) || 'application/octet-stream';
    const rawFilename = (req.headers['x-file-name'] as string) || 'upload';
    const filename = decodeURIComponent(rawFilename);

    const file: Express.Multer.File = {
      fieldname: 'file',
      originalname: filename,
      encoding: '7bit',
      mimetype: contentType,
      buffer,
      size: buffer.length,
      stream: null as any,
      destination: '',
      filename: '',
      path: '',
    };

    const url = await this.uploadService.uploadFile(file, false);
    return { url };
  }

  @Post('raw/gallery')
  @UseGuards(JwtAuthGuard)
  async uploadRawGalleryPhoto(
    @Req() req: Request,
  ): Promise<{ urls: string[] }> {
    const buffer = await this.readRawBody(req);
    const contentType =
      (req.headers['content-type'] as string) || 'application/octet-stream';
    const rawFilename = (req.headers['x-file-name'] as string) || 'upload';
    const filename = decodeURIComponent(rawFilename);

    const file: Express.Multer.File = {
      fieldname: 'files',
      originalname: filename,
      encoding: '7bit',
      mimetype: contentType,
      buffer,
      size: buffer.length,
      stream: null as any,
      destination: '',
      filename: '',
      path: '',
    };

    const urls = await this.uploadService.uploadMultipleFiles([file], true);
    return { urls };
  }

  /**
   * Read the raw request body as a Buffer.
   * Express raw body parsing must be enabled (see main.ts).
   */
  private async readRawBody(req: Request): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  /**
   * Serve uploaded files from R2 via the API.
   * Public endpoint - no auth required so profile photos/gallery images are viewable.
   */
  @Get(':filename')
  async serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const { stream, contentType } = await this.uploadService.getFile(filename);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    stream.pipe(res);
  }
}
