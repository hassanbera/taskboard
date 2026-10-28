import type { Request, Response } from 'express';
import { z } from 'zod';
import { taskboardService as service } from './taskboard.service.js';
import { id, boardInput, columnInput, cardInput, cardUpdate } from './taskboard.model.js';
export const controller = {
  async list(_req: Request, res: Response) {
    res.json({ data: await service.list() });
  },
  async get(req: Request, res: Response) {
    res.json({ data: await service.get(id.parse(req.params.id)) });
  },
  async create(req: Request, res: Response) {
    const data = boardInput.parse(req.body);
    res.status(201).json({ data: await service.create(data.name, data.description) });
  },
  async column(req: Request, res: Response) {
    const data = columnInput.parse(req.body);
    res.status(201).json({ data: await service.addColumn(id.parse(req.params.id), data.name) });
  },
  async card(req: Request, res: Response) {
    res.status(201).json({ data: await service.createCard(cardInput.parse(req.body)) });
  },
  async update(req: Request, res: Response) {
    res.json({
      data: await service.updateCard(id.parse(req.params.id), cardUpdate.parse(req.body)),
    });
  },
  async move(req: Request, res: Response) {
    const data = z.object({ columnId: id }).parse(req.body);
    res.json({ data: await service.moveCard(id.parse(req.params.id), data.columnId) });
  },
  async remove(req: Request, res: Response) {
    await service.deleteCard(id.parse(req.params.id));
    res.json({ data: { deleted: true } });
  },
};
