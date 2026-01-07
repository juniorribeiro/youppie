import { IsString, IsNotEmpty } from 'class-validator';

export class CompleteTourDto {
    @IsString()
    @IsNotEmpty()
    tour_id: string;
}

