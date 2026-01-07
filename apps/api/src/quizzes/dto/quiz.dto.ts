import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateQuizDto {
    @IsString()
    @IsNotEmpty()
    title: string;
    
    @IsString()
    @IsOptional()
    description?: string;
    
    @IsBoolean()
    @IsOptional()
    auto_advance?: boolean;
}

export class UpdateQuizDto {
    title?: string;
    description?: string;
    is_published?: boolean;
    auto_advance?: boolean;
}
