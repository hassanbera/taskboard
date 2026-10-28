import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/config/database.js';
const created: string[] = [];
afterAll(async () => {
  await prisma.board.deleteMany({ where: { id: { in: created } } });
  await prisma.$disconnect();
});
describe('TaskBoard API with PostgreSQL', () => {
  it('creates a board, persists a card, moves and deletes it', async () => {
    const res = await request(app)
      .post('/api/boards')
      .send({ name: 'Integration board' })
      .expect(201);
    const b = res.body.data;
    created.push(b.id);
    expect(b.columns).toHaveLength(3);
    const card = (
      await request(app)
        .post('/api/cards')
        .send({
          title: 'Ship it',
          description: 'Preserve this description',
          assignee: 'Bera',
          columnId: b.columns[0].id,
        })
        .expect(201)
    ).body.data;
    const edited = await request(app)
      .patch('/api/cards/' + card.id)
      .send({ title: 'Ship it now' })
      .expect(200);
    expect(edited.body.data.description).toBe('Preserve this description');
    expect(edited.body.data.assignee).toBe('Bera');
    await request(app)
      .patch('/api/cards/' + card.id + '/move')
      .send({ columnId: b.columns[2].id })
      .expect(200);
    const detail = (
      await request(app)
        .get('/api/boards/' + b.id)
        .expect(200)
    ).body.data;
    expect(detail.columns[2].cards[0].title).toBe('Ship it now');
    await request(app)
      .delete('/api/cards/' + card.id)
      .expect(200);
    expect(await prisma.card.findUnique({ where: { id: card.id } })).toBeNull();
  });
  it('rejects cross-board moves and invalid input', async () => {
    const a = (await request(app).post('/api/boards').send({ name: 'A' })).body.data;
    const b = (await request(app).post('/api/boards').send({ name: 'B' })).body.data;
    created.push(a.id, b.id);
    const card = (
      await request(app).post('/api/cards').send({ title: 'Task', columnId: a.columns[0].id })
    ).body.data;
    await request(app)
      .patch('/api/cards/' + card.id + '/move')
      .send({ columnId: b.columns[0].id })
      .expect(400);
    await request(app)
      .post('/api/cards')
      .send({ title: '', columnId: a.columns[0].id })
      .expect(400);
    await request(app).get('/api/boards/not-a-uuid').expect(400);
  });
});
