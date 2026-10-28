import 'dotenv/config';
import { prisma as db } from '../src/config/database.js';

try {
  if (!(await db.board.findFirst())) {
    await db.board.create({
      data: {
        name: 'Portfolyo lansmanı',
        description: 'Küçük adımlar, görünür ilerleme. Bir sonraki sürümü birlikte hazırlıyoruz.',
        columns: {
          create: [
            {
              name: 'Yapılacak',
              position: 0,
              cards: {
                create: [
                  {
                    title: 'Proje hikâyelerini yaz',
                    description:
                      'Her proje için problem, çözüm ve teknik kararları anlatan kısa bir hikâye.',
                    label: 'İçerik',
                    assignee: 'Bera',
                    priority: 'HIGH',
                  },
                  {
                    title: 'Mobil ekranları gözden geçir',
                    label: 'Tasarım',
                    assignee: 'Deniz',
                    priority: 'NORMAL',
                  },
                  { title: 'Demo verilerini hazırla', label: 'Backend', priority: 'LOW' },
                ],
              },
            },
            {
              name: 'Devam ediyor',
              position: 1,
              cards: {
                create: [
                  {
                    title: 'Kanban etkileşimlerini tamamla',
                    description: 'Kartları sürükle veya kart detayındaki sütun seçimini kullan.',
                    label: 'Frontend',
                    assignee: 'Bera',
                    priority: 'HIGH',
                  },
                  {
                    title: 'API sözleşmesini netleştir',
                    label: 'Backend',
                    assignee: 'Ece',
                    priority: 'NORMAL',
                  },
                ],
              },
            },
            {
              name: 'Tamamlandı',
              position: 2,
              cards: {
                create: [
                  {
                    title: 'Görsel dili belirle',
                    label: 'Tasarım',
                    assignee: 'Deniz',
                    priority: 'NORMAL',
                  },
                  {
                    title: 'PostgreSQL şemasını oluştur',
                    label: 'Backend',
                    assignee: 'Bera',
                    priority: 'NORMAL',
                  },
                ],
              },
            },
          ],
        },
      },
    });
  }
  console.log('TaskBoard demo verisi hazır.');
} finally {
  await db.$disconnect();
}
