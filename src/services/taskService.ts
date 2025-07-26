import axios from 'axios';
import type { Task, Subtask } from '../../server/src/types';

const API_URL = 'http://localhost:3001/api/tasks';

export const getTasks = async (): Promise<Task[]> => {
  const response = await axios.get<Task[]>(API_URL);
  return response.data;
};

export const addTask = async (title: string): Promise<Task> => {
  const response = await axios.post<Task>(API_URL, { title });
  return response.data;
};

export const addSubtask = async (
  taskId: number,
  title: string
): Promise<Subtask> => {
  const response = await axios.post<Subtask>(`${API_URL}/${taskId}/subtasks`, {
    title,
  });
  return response.data;
};

export const completeTask = async (taskId: number): Promise<Task> => {
  const response = await axios.put<Task>(`${API_URL}/${taskId}/complete`);
  return response.data;
};

export const updateTask = async (
  taskId: number,
  title: string
): Promise<Task> => {
  const response = await axios.put<Task>(`${API_URL}/${taskId}`, { title });
  return response.data;
};

export const deleteTask = async (taskId: number): Promise<void> => {
  await axios.delete(`${API_URL}/${taskId}`);
};

export const completeSubtask = async (
  taskId: number,
  subtaskId: number
): Promise<Subtask> => {
  const response = await axios.put<Subtask>(
    `${API_URL}/${taskId}/subtasks/${subtaskId}/complete`
  );
  return response.data;
};

export const updateSubtask = async (
  taskId: number,
  subtaskId: number,
  title: string
): Promise<Subtask> => {
  const response = await axios.put<Subtask>(
    `${API_URL}/${taskId}/subtasks/${subtaskId}`,
    { title }
  );
  return response.data;
};

export const deleteSubtask = async (
  taskId: number,
  subtaskId: number
): Promise<void> => {
  await axios.delete(`${API_URL}/${taskId}/subtasks/${subtaskId}`);
};