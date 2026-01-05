import {
    Controller,
    Post,
    Get,
    Delete,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    NotFoundException,
    UseGuards,
    Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync, readFileSync } from 'fs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { imageSize } from 'image-size';

const uploadPath = join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true });
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(2)} KB`;
    } else if (bytes < 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    } else {
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
}

// Helper function to get image info
function getImageInfo(filePath: string) {
    try {
        const stats = statSync(filePath);
        const buffer = readFileSync(filePath);
        const dimensions = imageSize(buffer);
        return {
            size: stats.size,
            sizeFormatted: formatFileSize(stats.size),
            width: dimensions.width || 0,
            height: dimensions.height || 0,
        };
    } catch (error) {
        console.error('Error getting image info:', error);
        return {
            size: 0,
            sizeFormatted: '0 B',
            width: 0,
            height: 0,
        };
    }
}

@Controller('uploads')
export class UploadsController {
    @Post('image')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: uploadPath,
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    callback(null, `${uniqueSuffix}${ext}`);
                },
            }),
            fileFilter: (req, file, callback) => {
                const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                if (allowedMimes.includes(file.mimetype)) {
                    callback(null, true);
                } else {
                    callback(new BadRequestException('Only image files are allowed'), false);
                }
            },
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB
            },
        }),
    )
    uploadImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const filePath = join(uploadPath, file.filename);
        const imageInfo = getImageInfo(filePath);
        const baseUrl = process.env.API_URL || 'http://localhost:3003';
        return {
            url: `${baseUrl}/uploads/${file.filename}`,
            filename: file.filename,
            ...imageInfo,
        };
    }

    @Get('images')
    @UseGuards(JwtAuthGuard)
    listImages() {
        try {
            if (!existsSync(uploadPath)) {
                return [];
            }

            const files = readdirSync(uploadPath)
                .filter(file => {
                    const filePath = join(uploadPath, file);
                    const stats = statSync(filePath);
                    return stats.isFile() && /\.(jpg|jpeg|png|gif|webp)$/i.test(file);
                })
                .map(filename => {
                    const filePath = join(uploadPath, filename);
                    const imageInfo = getImageInfo(filePath);
                    const baseUrl = process.env.API_URL || 'http://localhost:3003';
                    return {
                        url: `${baseUrl}/uploads/${filename}`,
                        filename,
                        ...imageInfo,
                    };
                })
                .sort((a, b) => {
                    // Sort by filename (newest first based on timestamp in filename)
                    return b.filename.localeCompare(a.filename);
                });

            return files;
        } catch (error) {
            console.error('Error listing images:', error);
            return [];
        }
    }

    @Delete('delete/:filename')
    @UseGuards(JwtAuthGuard)
    deleteImage(@Param('filename') filename: string) {
        try {
            // Validate filename to prevent directory traversal
            if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
                throw new BadRequestException('Invalid filename');
            }

            const filePath = join(uploadPath, filename);

            // Check if file exists
            if (!existsSync(filePath)) {
                throw new NotFoundException('Image not found');
            }

            // Check if it's actually an image file
            if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(filename)) {
                throw new BadRequestException('File is not an image');
            }

            // Delete the file
            unlinkSync(filePath);

            return {
                success: true,
                message: 'Image deleted successfully',
                filename,
            };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            console.error('Error deleting image:', error);
            throw new BadRequestException('Failed to delete image');
        }
    }
}

