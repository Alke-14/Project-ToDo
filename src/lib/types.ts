export interface Subtask {
  id: number;
  title: string;
  completed: boolean;
}

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  subtasks: Subtask[];
}