import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;
  private readonly allowedImageMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
  ];
  private readonly allowedVideoMimeTypes = ['video/mp4', 'video/webm'];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('R2_REGION') || 'auto';
    const endpoint = this.configService.get<string>('R2_ENDPOINT');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'R2_SECRET_ACCESS_KEY',
    );
    this.bucket =
      this.configService.get<string>('R2_BUCKET') || 'exercio-uploads';
    this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL') || '';

    if (!endpoint || !accessKeyId || !secretAccessKey) {
      this.logger.warn(
        'R2 credentials not fully configured. Falling back to local storage behavior will not work. ' +
          'Set R2_ENDPOINT, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY in .env',
      );
    }

    this.s3Client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
      },
      forcePathStyle: true, // Required for R2
    });
  }

  /**
   * Get file extension from MIME type
   */
  private getExtensionFromMimeType(mimetype: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'video/mp4': '.mp4',
      'video/webm': '.webm',
    };

    return mimeToExt[mimetype] || '.bin';
  }

  async uploadFile(
    file: Express.Multer.File,
    allowVideo = false,
  ): Promise<string> {
    // Validate file
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedMimeTypes = allowVideo
      ? [...this.allowedImageMimeTypes, ...this.allowedVideoMimeTypes]
      : this.allowedImageMimeTypes;

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        allowVideo
          ? 'Invalid file type. Only JPEG, PNG, WebP, MP4, and WebM are allowed.'
          : 'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
      );
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException('File too large. Maximum size is 5MB.');
    }

    // Generate unique filename
    const uuid = randomUUID();
    const ext = this.getExtensionFromMimeType(file.mimetype);
    const filename = `${uuid}${ext}`;

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3Client.send(command);
      this.logger.log(`File uploaded to R2: ${filename}`);
    } catch (error) {
      this.logger.error(`Failed to upload file to R2: ${filename}`, error);
      throw new BadRequestException('Failed to upload file. Please try again.');
    }

    // Return URL
    if (this.publicUrl) {
      return `${this.publicUrl}/${filename}`;
    }

    // Fallback: return API proxy URL so the frontend can fetch via the backend
    const apiBaseUrl = this.configService.get<string>('API_BASE_URL') || '';
    if (apiBaseUrl) {
      return `${apiBaseUrl}/upload/${filename}`;
    }

    // Last resort: return just the filename
    return filename;
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    allowVideo = false,
  ): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    if (files.length > 10) {
      throw new BadRequestException('Maximum 10 files allowed');
    }

    const uploadPromises = files.map((file) =>
      this.uploadFile(file, allowVideo),
    );
    return Promise.all(uploadPromises);
  }

  /**
   * Retrieve a file from R2 and return it as a stream with content type.
   */
  async getFile(
    filename: string,
  ): Promise<{ stream: NodeJS.ReadableStream; contentType: string }> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: filename,
    });

    try {
      const response = await this.s3Client.send(command);
      const stream = response.Body as NodeJS.ReadableStream;
      const contentType = response.ContentType || 'application/octet-stream';
      return { stream, contentType };
    } catch (error: any) {
      if (error.name === 'NoSuchKey') {
        throw new NotFoundException(`File not found: ${filename}`);
      }
      this.logger.error(`Failed to retrieve file from R2: ${filename}`, error);
      throw new BadRequestException('Failed to retrieve file.');
    }
  }
}
