export interface Note {
  id: number;
  text: string;
  createdDate?: string;
  completed?: boolean;
  status?: string; // 'not started' | 'in progress' | 'done'
  dueDate?: string; // YYYY-MM-DD format
}
