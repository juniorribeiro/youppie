import { Injectable, BadRequestException } from '@nestjs/common';
import archiver from 'archiver';
import * as yauzl from 'yauzl';
import { Readable } from 'stream';
import { join } from 'path';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { QuizExportDataDto } from './dto/quiz-import.dto';
import * as https from 'https';
import * as http from 'http';

@Injectable()
export class QuizImportExportService {
    private readonly uploadPath = join(process.cwd(), 'uploads');
    private readonly baseUrl = process.env.API_URL || 'http://localhost:3003';

    /**
     * Converte uma imagem de URL para base64
     */
    async convertImageUrlToBase64(imageUrl: string): Promise<string | null> {
        if (!imageUrl) {
            return null;
        }

        // Se já é base64, retornar
        if (imageUrl.startsWith('data:image/')) {
            return imageUrl;
        }

        try {
            // Se for URL local (uploads), ler do sistema de arquivos
            if (imageUrl.includes('/uploads/')) {
                const filename = imageUrl.split('/uploads/')[1];
                const filePath = join(this.uploadPath, filename);
                
                if (existsSync(filePath)) {
                    const imageBuffer = readFileSync(filePath);
                    const base64 = imageBuffer.toString('base64');
                    
                    // Detectar tipo MIME pela extensão
                    let mimeType = 'image/png';
                    if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
                        mimeType = 'image/jpeg';
                    } else if (filename.endsWith('.gif')) {
                        mimeType = 'image/gif';
                    } else if (filename.endsWith('.webp')) {
                        mimeType = 'image/webp';
                    }
                    
                    return `data:${mimeType};base64,${base64}`;
                }
            }

            // Se for URL externa, fazer fetch
            return new Promise((resolve, reject) => {
                const client = imageUrl.startsWith('https:') ? https : http;
                client.get(imageUrl, (response) => {
                    if (response.statusCode !== 200) {
                        resolve(null);
                        return;
                    }

                    const chunks: Buffer[] = [];
                    response.on('data', (chunk) => chunks.push(chunk));
                    response.on('end', () => {
                        try {
                            const buffer = Buffer.concat(chunks);
                            const base64 = buffer.toString('base64');
                            const contentType = response.headers['content-type'] || 'image/png';
                            resolve(`data:${contentType};base64,${base64}`);
                        } catch (error) {
                            resolve(null);
                        }
                    });
                }).on('error', () => {
                    resolve(null); // Silenciosamente falha se não conseguir baixar
                });
            });
        } catch (error) {
            console.error('Error converting image to base64:', error);
            return null;
        }
    }

    /**
     * Converte base64 para arquivo e retorna URL
     */
    async convertBase64ToImage(base64String: string): Promise<string | null> {
        if (!base64String) {
            return null;
        }

        try {
            // Parse base64 string
            const matches = base64String.match(/^data:image\/(\w+);base64,(.+)$/);
            if (!matches) {
                // Assume PNG se não tiver prefixo
                const buffer = Buffer.from(base64String, 'base64');
                const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;
                const filePath = join(this.uploadPath, filename);
                
                if (!existsSync(this.uploadPath)) {
                    const fs = require('fs');
                    fs.mkdirSync(this.uploadPath, { recursive: true });
                }
                
                writeFileSync(filePath, buffer);
                return `${this.baseUrl}/uploads/${filename}`;
            }

            const [, ext, base64Data] = matches;
            const buffer = Buffer.from(base64Data, 'base64');
            
            const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
            const filePath = join(this.uploadPath, filename);

            if (!existsSync(this.uploadPath)) {
                const fs = require('fs');
                fs.mkdirSync(this.uploadPath, { recursive: true });
            }

            writeFileSync(filePath, buffer);
            return `${this.baseUrl}/uploads/${filename}`;
        } catch (error) {
            console.error('Error converting base64 to image:', error);
            return null;
        }
    }

    /**
     * Cria um arquivo ZIP com o JSON de exportação
     */
    async createZipFromExportData(exportData: QuizExportDataDto): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const archive = archiver('zip', {
                zlib: { level: 9 }
            });

            const chunks: Buffer[] = [];
            
            archive.on('data', (chunk: Buffer) => {
                chunks.push(chunk);
            });

            archive.on('end', () => {
                resolve(Buffer.concat(chunks));
            });

            archive.on('error', (err) => {
                reject(err);
            });

            // Adicionar JSON ao ZIP
            archive.append(JSON.stringify(exportData, null, 2), { name: 'quiz-export.json' });
            
            archive.finalize();
        });
    }

    /**
     * Extrai e parseia JSON de um arquivo ZIP ou JSON direto
     */
    async extractJsonFromFile(file: Express.Multer.File): Promise<QuizExportDataDto> {
        return new Promise((resolve, reject) => {
            // Verificar se é JSON direto
            if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
                try {
                    const jsonData = JSON.parse(file.buffer.toString('utf-8'));
                    resolve(jsonData);
                } catch (error) {
                    reject(new BadRequestException('Invalid JSON file'));
                }
                return;
            }

            // Se for ZIP, extrair
            if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed' || file.originalname.endsWith('.zip')) {
                yauzl.fromBuffer(file.buffer, { lazyEntries: true }, (err, zipfile) => {
                    if (err) {
                        reject(new BadRequestException('Invalid ZIP file'));
                        return;
                    }

                    if (!zipfile) {
                        reject(new BadRequestException('Could not open ZIP file'));
                        return;
                    }

                    zipfile.readEntry();
                    let jsonFound = false;

                    zipfile.on('entry', (entry) => {
                        if (entry.fileName.endsWith('.json')) {
                            jsonFound = true;
                            zipfile.openReadStream(entry, (err, readStream) => {
                                if (err) {
                                    reject(new BadRequestException('Error reading JSON from ZIP'));
                                    return;
                                }

                                const chunks: Buffer[] = [];
                                readStream.on('data', (chunk) => chunks.push(chunk));
                                readStream.on('end', () => {
                                    try {
                                        const jsonData = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
                                        resolve(jsonData);
                                    } catch (error) {
                                        reject(new BadRequestException('Invalid JSON in ZIP file'));
                                    }
                                });
                                readStream.on('error', (err) => {
                                    reject(new BadRequestException('Error reading JSON from ZIP'));
                                });
                            });
                        } else {
                            zipfile.readEntry();
                        }
                    });

                    zipfile.on('end', () => {
                        if (!jsonFound) {
                            reject(new BadRequestException('No JSON file found in ZIP'));
                        }
                    });

                    zipfile.on('error', (err) => {
                        reject(new BadRequestException('Error processing ZIP file'));
                    });
                });
            } else {
                reject(new BadRequestException('File must be JSON or ZIP format'));
            }
        });
    }

    /**
     * Valida estrutura do JSON de exportação
     */
    validateExportData(data: any): { valid: boolean; errors: string[]; warnings: string[] } {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Validar versão
        if (!data.version) {
            errors.push('Missing version field');
        } else if (data.version !== '1.0') {
            warnings.push(`Version ${data.version} may not be fully compatible`);
        }

        // Validar estrutura básica
        if (!data.quiz) {
            errors.push('Missing quiz data');
        } else {
            if (!data.quiz.title) {
                errors.push('Quiz title is required');
            }
            if (!data.quiz.language) {
                warnings.push('Quiz language not specified, defaulting to "en"');
            }
        }

        // Validar steps
        if (!data.steps || !Array.isArray(data.steps)) {
            errors.push('Steps must be an array');
        } else {
            data.steps.forEach((step: any, index: number) => {
                if (!step.type) {
                    errors.push(`Step ${index + 1}: missing type`);
                }
                if (!step.title) {
                    errors.push(`Step ${index + 1}: missing title`);
                }
                if (step.type === 'QUESTION' && !step.question) {
                    errors.push(`Step ${index + 1}: QUESTION type requires question data`);
                }
                if (step.question) {
                    if (!step.question.text) {
                        errors.push(`Step ${index + 1}: question text is required`);
                    }
                    if (!step.question.options || !Array.isArray(step.question.options) || step.question.options.length === 0) {
                        errors.push(`Step ${index + 1}: question must have at least one option`);
                    }
                }
            });
        }

        // Validar result pages (opcional, mas se presente deve ter estrutura correta)
        if (data.resultPages && Array.isArray(data.resultPages)) {
            data.resultPages.forEach((rp: any, index: number) => {
                if (!rp.headline_template) {
                    warnings.push(`Result page ${index + 1}: missing headline_template`);
                }
                if (!rp.body_template) {
                    warnings.push(`Result page ${index + 1}: missing body_template`);
                }
            });
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
}
