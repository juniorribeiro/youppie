import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
    const email = 'junior@70x7.digital';
    const password = 'J@Neiro212121';
    const name = 'Administrador';

    try {
        const existingAdmin = await prisma.admin.findUnique({
            where: { email },
        });

        if (existingAdmin) {
            console.log('Admin já existe:', email);
            return;
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const admin = await prisma.admin.create({
            data: {
                email,
                password_hash: passwordHash,
                name,
            },
        });

        console.log('Admin criado com sucesso:');
        console.log('Email:', admin.email);
        console.log('Nome:', admin.name);
        console.log('ID:', admin.id);
    } catch (error) {
        console.error('Erro ao criar admin:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();

