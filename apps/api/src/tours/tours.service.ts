import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ToursService {
    constructor(private prisma: PrismaService) {}

    async checkTourStatus(userId: string, tourId: string): Promise<boolean> {
        const completion = await this.prisma.tourCompletion.findUnique({
            where: {
                user_id_tour_id: {
                    user_id: userId,
                    tour_id: tourId,
                },
            },
        });

        return !!completion;
    }

    async completeTour(userId: string, tourId: string) {
        return this.prisma.tourCompletion.upsert({
            where: {
                user_id_tour_id: {
                    user_id: userId,
                    tour_id: tourId,
                },
            },
            update: {
                completed_at: new Date(),
            },
            create: {
                user_id: userId,
                tour_id: tourId,
                completed_at: new Date(),
            },
        });
    }
}

