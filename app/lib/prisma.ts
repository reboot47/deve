import { PrismaClient } from '@prisma/client';

// PrismaClientのシングルトンインスタンスを作成
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

// 開発環境でのみ、Prismaクライアントをグローバルオブジェクトに割り当て
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
