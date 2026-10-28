import { prisma } from '../../config/database.js';
import type { Prisma } from '../../generated/prisma/client.js';
const columns = {
  orderBy: { position: 'asc' as const },
  include: { cards: { orderBy: [{ createdAt: 'asc' as const }, { id: 'asc' as const }] } },
};
export const taskboardRepository = {
  list: () =>
    prisma.board.findMany({
      orderBy: { createdAt: 'asc' },
      include: { _count: { select: { columns: true } } },
    }),
  get: (id: string) => prisma.board.findUnique({ where: { id }, include: { columns } }),
  create: (name: string, description: string) =>
    prisma.board.create({
      data: {
        name,
        description,
        columns: {
          create: [
            { name: 'Yapılacak', position: 0 },
            { name: 'Devam ediyor', position: 1 },
            { name: 'Tamamlandı', position: 2 },
          ],
        },
      },
      include: { columns },
    }),
  addColumn: (boardId: string, name: string) =>
    prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Board" WHERE id = ${boardId}::uuid FOR UPDATE`;
      const max = await tx.column.aggregate({ where: { boardId }, _max: { position: true } });
      return tx.column.create({ data: { boardId, name, position: (max._max.position ?? -1) + 1 } });
    }),
  column: (id: string) => prisma.column.findUnique({ where: { id } }),
  card: (id: string) => prisma.card.findUnique({ where: { id }, include: { column: true } }),
  createCard: (data: Prisma.CardUncheckedCreateInput) => prisma.card.create({ data }),
  updateCard: (id: string, data: Prisma.CardUncheckedUpdateInput) =>
    prisma.card.update({ where: { id }, data }),
  deleteCard: (id: string) => prisma.card.delete({ where: { id } }),
};
