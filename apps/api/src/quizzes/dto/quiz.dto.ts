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
    @IsString()
    @IsOptional()
    title?: string;
    
    @IsString()
    @IsOptional()
    description?: string;
    
    @IsBoolean()
    @IsOptional()
    is_published?: boolean;
    
    @IsBoolean()
    @IsOptional()
    auto_advance?: boolean;
}
