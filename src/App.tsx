import React, { useEffect, useState } from 'react';
import type { Task } from '../server/src/types';
import {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  addSubtask,
  updateSubtask,
  completeSubtask,
  deleteSubtask,
} from './services/taskService';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import './App.css';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editSubtaskTitle, setEditSubtaskTitle] = useState('');
  const [editTaskId, setEditTaskId] = useState<number | null>(null);
  const [editSubtaskId, setEditSubtaskId] = useState<{ taskId: number; subtaskId: number } | null>(null);

  useEffect(() => {
    getTasks().then(setTasks);
  }, []);

  const handleAddTask = async () => {
    const title = newTaskTitle.trim();
    if (title) {
      const newTask = await addTask(title);
      setTasks(prev => [...prev, newTask]);
      setNewTaskTitle('');
    }
  };

  const handleAddSubtask = async () => {
    if (!subtaskTitle || activeTaskId === null) return;
    const newSubtask = await addSubtask(activeTaskId, subtaskTitle);
    setTasks(prev =>
      prev.map(t =>
        t.id === activeTaskId
          ? { ...t, subtasks: [...t.subtasks, newSubtask] }
          : t
      )
    );
    setSubtaskTitle('');
  };

  const handleToggleTask = async (task: Task) => {
    const updated = await updateTask(task.id, task.title);
    updated.completed = !task.completed;
    setTasks(prev => prev.map(t => (t.id === task.id ? updated : t)));
  };

  const handleToggleSubtask = async (taskId: number, subtaskId: number, completed: boolean) => {
    const updated = await completeSubtask(taskId, subtaskId);
    updated.completed = !completed;
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map(s =>
                s.id === subtaskId ? updated : s
              )
            }
          : t
      )
    );
  };

  const handleEditTask = async () => {
    if (editTaskId === null || !editTaskTitle.trim()) return;
    const updated = await updateTask(editTaskId, editTaskTitle.trim());
    setTasks(prev => prev.map(t => (t.id === editTaskId ? updated : t)));
    setEditTaskId(null);
    setEditTaskTitle('');
  };

  const handleEditSubtask = async () => {
    if (!editSubtaskTitle.trim() || !editSubtaskId) return;
    const updated = await updateSubtask(editSubtaskId.taskId, editSubtaskId.subtaskId, editSubtaskTitle.trim());
    setTasks(prev =>
      prev.map(t =>
        t.id === editSubtaskId.taskId
          ? {
              ...t,
              subtasks: t.subtasks.map(s =>
                s.id === editSubtaskId.subtaskId ? updated : s
              )
            }
          : t
      )
    );
    setEditSubtaskId(null);
    setEditSubtaskTitle('');
  };

  return (
    <div>
      <div className='flex justify-center items-center'>
        <h1 className='text-4xl font-bold'>To-Do List</h1>
      </div>

      <div className='flex justify-center items-center mt-4'>
        <Input
          placeholder='Add a new task...'
          className='w-1/2'
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddTask();
          }}
        />
        <Button className='ml-2' onClick={handleAddTask}>
          Add Task
        </Button>
      </div>

      <div className='mt-8'>
        {tasks.length === 0 ? (
          <p className='text-center text-gray-500'>No tasks available</p>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {tasks.map((task) => (
              <Card key={task.id} className='shadow-lg'>
                <CardHeader>
                  <CardTitle>{task.title}</CardTitle>
                  <CardDescription>
                    {task.completed ? 'Completed' : 'In Progress'}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className='list-disc pl-5'>
                    {task.subtasks.map((sub) => (
                      <li key={sub.id} className='flex justify-between items-center'>
                        <span>{sub.title} {sub.completed ? '- Completed' : '- In Progress'}</span>
                        <div className='flex items-center'>
                          <Button size='sm' className='mx-1' onClick={() => handleToggleSubtask(task.id, sub.id, sub.completed)}>✓</Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size='sm' className='mx-1' onClick={() => {
                                setEditSubtaskId({ taskId: task.id, subtaskId: sub.id });
                                setEditSubtaskTitle(sub.title);
                              }}>Edit</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Subtask</DialogTitle>
                              </DialogHeader>
                              <Input value={editSubtaskTitle} onChange={(e) => setEditSubtaskTitle(e.target.value)} />
                              <DialogFooter>
                                <Button onClick={handleEditSubtask}>Save</Button>
                                <DialogClose asChild>
                                  <Button variant='outline'>Cancel</Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button size='sm' variant='outline' onClick={async () => {
                            await deleteSubtask(task.id, sub.id);
                            setTasks(prev =>
                              prev.map(t =>
                                t.id === task.id
                                  ? {
                                      ...t,
                                      subtasks: t.subtasks.filter(s => s.id !== sub.id)
                                    }
                                  : t
                              )
                            );
                          }}>🗑️</Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button className='mx-1' onClick={() => handleToggleTask(task)}>✓</Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className='mx-1' onClick={() => {
                        setActiveTaskId(task.id);
                      }}>Add Subtask</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Subtask</DialogTitle>
                        <DialogDescription>Enter the title of the subtask.</DialogDescription>
                      </DialogHeader>
                      <Input
                        placeholder='Subtask title'
                        value={subtaskTitle}
                        onChange={(e) => setSubtaskTitle(e.target.value)}
                      />
                      <DialogFooter>
                        <Button onClick={handleAddSubtask}>Add</Button>
                        <DialogClose asChild>
                          <Button variant='outline'>Cancel</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className='mx-1' onClick={() => {
                        setEditTaskId(task.id);
                        setEditTaskTitle(task.title);
                      }}>Edit</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                      </DialogHeader>
                      <Input value={editTaskTitle} onChange={(e) => setEditTaskTitle(e.target.value)} />
                      <DialogFooter>
                        <Button onClick={handleEditTask}>Save</Button>
                        <DialogClose asChild>
                          <Button variant='outline'>Cancel</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button className='mx-1' variant='outline' onClick={async () => {
                    await deleteTask(task.id);
                    setTasks(prev => prev.filter(t => t.id !== task.id));
                  }}>
                    Delete Task
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
