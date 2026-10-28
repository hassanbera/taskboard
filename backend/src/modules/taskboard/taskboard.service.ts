import { HttpError } from '../../common/http.js';
import { taskboardRepository as repo } from './taskboard.repository.js';
import type { CardInput, CardUpdate } from './taskboard.model.js';
export const taskboardService = {
  list: repo.list,
  async get(id: string) {
    const board = await repo.get(id);
    if (!board) throw new HttpError(404, 'Pano bulunamadı.');
    return board;
  },
  create: (name: string, description: string) => repo.create(name, description),
  async addColumn(boardId: string, name: string) {
    await this.get(boardId);
    return repo.addColumn(boardId, name);
  },
  async createCard(input: CardInput) {
    if (!(await repo.column(input.columnId))) throw new HttpError(404, 'Sütun bulunamadı.');
    return repo.createCard({ ...input, dueDate: input.dueDate ? new Date(input.dueDate) : null });
  },
  updateCard: (id: string, input: CardUpdate) =>
    repo.updateCard(id, {
      ...input,
      dueDate:
        input.dueDate === undefined ? undefined : input.dueDate ? new Date(input.dueDate) : null,
    }),
  async moveCard(id: string, columnId: string) {
    const [card, column] = await Promise.all([repo.card(id), repo.column(columnId)]);
    if (!card || !column) throw new HttpError(404, 'Kart veya sütun bulunamadı.');
    if (card.column.boardId !== column.boardId)
      throw new HttpError(400, 'Kart yalnızca kendi panosunda taşınabilir.');
    return repo.updateCard(id, { columnId });
  },
  deleteCard: repo.deleteCard,
};
