'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Play, 
  CheckCircle2, 
  Circle,
  Clock,
  Target,
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import { Task } from '../types';

interface TaskManagerProps {
  tasks: Task[];
  currentTask?: Task;
  selectTask: (task: Task) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  completeTask: (taskId: string) => void;
  timer: any;
  startTimer: () => void;
}

export default function TaskManager({
  tasks,
  currentTask,
  selectTask,
  addTask,
  updateTask,
  deleteTask,
  completeTask,
  timer,
  startTimer
}: TaskManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
    estimatedPomodoros: number;
  }>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'General',
    estimatedPomodoros: 1
  });

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && !task.isCompleted) ||
                         (filterStatus === 'completed' && task.isCompleted);
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;

    addTask({
      ...newTask,
      tags: [],
      isCompleted: false,
      completedPomodoros: 0,
      dueDate: undefined
    });

    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      category: 'General',
      estimatedPomodoros: 1
    });
    setShowAddForm(false);
  };

  const handleStartTaskTimer = (task: Task) => {
    selectTask(task);
    if (!timer.isActive) {
      startTimer();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Task Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">TASK MANAGER</h2>
          <p className="text-gray-600">Organize and track your pomodoro tasks</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          ADD TASK
        </Button>
      </div>      {/* Add Task Form */}
      {showAddForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>CREATE NEW TASK</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title..."
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Textarea
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Task description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask(prev => ({ 
                    ...prev, 
                    priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent'
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <Input
                  value={newTask.category}
                  onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Category"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Pomodoros
                </label>
                <Input
                  type="number"
                  min="1"
                  value={newTask.estimatedPomodoros}
                  onChange={(e) => setNewTask(prev => ({ 
                    ...prev, 
                    estimatedPomodoros: parseInt(e.target.value) || 1 
                  }))}
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <Button onClick={handleAddTask} className="bg-green-500 hover:bg-green-600">
                <Plus className="w-4 h-4 mr-2" />
                CREATE TASK
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
              >
                CANCEL
              </Button>
            </div>
          </CardContent>
        </Card>
      )}      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tasks..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Tasks</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No tasks found</p>
              <p className="text-sm text-gray-500">
                {tasks.length === 0 
                  ? "Create your first task to get started"
                  : "Try adjusting your filters"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card 
              key={task.id} 
              className={`transition-all duration-200 hover:shadow-md ${
                currentTask?.id === task.id ? 'border-blue-500 bg-blue-50' : ''
              } ${task.isCompleted ? 'opacity-75' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  {/* Completion Checkbox */}
                  <button
                    onClick={() => completeTask(task.id)}
                    className="mt-1 flex-shrink-0"
                  >
                    {task.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400 hover:text-green-500" />
                    )}
                  </button>                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-semibold text-lg ${
                        task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}>
                        {task.title}
                      </h3>
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority.toUpperCase()}
                        </Badge>
                        {currentTask?.id === task.id && (
                          <Badge className="bg-blue-100 text-blue-800">
                            ACTIVE
                          </Badge>
                        )}
                      </div>
                    </div>

                    {task.description && (
                      <p className={`text-sm mb-3 ${
                        task.isCompleted ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{task.completedPomodoros}/{task.estimatedPomodoros} pomodoros</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Target className="w-4 h-4" />
                          <span>{task.category}</span>
                        </span>
                        {task.dueDate && (
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{task.dueDate.toLocaleDateString()}</span>
                          </span>
                        )}
                      </div>

                      {!task.isCompleted && (
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => selectTask(task)}
                            className={currentTask?.id === task.id ? 'bg-blue-100' : ''}
                          >
                            {currentTask?.id === task.id ? 'SELECTED' : 'SELECT'}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleStartTaskTimer(task)}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            START
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {task.estimatedPomodoros > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{Math.round((task.completedPomodoros / task.estimatedPomodoros) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              task.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ 
                              width: `${Math.min((task.completedPomodoros / task.estimatedPomodoros) * 100, 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}