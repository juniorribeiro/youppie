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
    
    @IsString()
    @IsOptional()
    google_analytics_id?: string;
    
    @IsString()
    @IsOptional()
    google_tag_manager_id?: string;
    
    @IsString()
    @IsOptional()
    facebook_pixel_id?: string;
    
    @IsString()
    @IsOptional()
    tracking_head?: string;
    
    @IsString()
    @IsOptional()
    tracking_body?: string;
    
    @IsString()
    @IsOptional()
    tracking_footer?: string;
}
