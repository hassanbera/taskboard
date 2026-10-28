export interface Card {
  id: string;
  title: string;
  description: string;
  label: string;
  assignee: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  dueDate: string | null;
  columnId: string;
}
export interface Column {
  id: string;
  name: string;
  position: number;
  cards: Card[];
}
export interface Board {
  id: string;
  name: string;
  description: string;
  columns: Column[];
}
export interface BoardSummary {
  id: string;
  name: string;
  description: string;
}
