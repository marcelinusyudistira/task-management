'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getUser, clearAuth, isAuthenticated } from '@/lib/auth';
import { Task, User } from '@/types';
import { Button, Input, Select } from '@/components/atoms';
import TaskModal from '@/components/TaskModal';
import ConfirmModal from '@/components/molecules/ConfirmModal';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [searchInput, setSearchInput] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const hasFetched = useRef<string>('');
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/login'); return; }
    setUser(getUser());
  }, [router]);

  useEffect(() => {
    const key = `${page}-${filters.status}-${filters.priority}-${filters.search}`;
    if (hasFetched.current === key) return;
    hasFetched.current = key;

    const fetchTasks = async () => {
      if (isInitialLoad.current) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      try {
        const params: Record<string, string | number> = { page, per_page: 10 };
        if (filters.status) params.status = filters.status;
        if (filters.priority) params.priority = filters.priority;
        if (filters.search) params.search = filters.search;
        const { data } = await api.get('/tasks', { params });
        setTasks(data.data.data);
        setLastPage(data.data.last_page);
      } catch {
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
        setRefreshing(false);
        isInitialLoad.current = false;
      }
    };
    fetchTasks();
  }, [page, filters]);

  const refetchTasks = () => {
    hasFetched.current = '';
    setFilters({ ...filters });
  };

  // Real-time updates via polling
  useEffect(() => {
    const interval = setInterval(() => {
      hasFetched.current = '';
      setFilters((f) => ({ ...f }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters((f) => ({ ...f, search: value }));
      setPage(1);
    }, 500);
  };

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    clearAuth();
    router.push('/login');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/tasks/${deleteTarget.id}`);
      toast.success('Task deleted');
      setDeleteTarget(null);
      refetchTasks();
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setDeleting(false);
    }
  };

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  const priorityColor: Record<string, string> = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const priorityOptions = [
    { value: '', label: 'All Priority' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Task Management</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3 mb-6">
          <Input
            placeholder="Search tasks..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            wrapperClassName="w-64"
          />
          <Select
            value={filters.status}
            onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
            options={statusOptions}
            wrapperClassName="w-40"
          />
          <Select
            value={filters.priority}
            onChange={(e) => { setFilters({ ...filters, priority: e.target.value }); setPage(1); }}
            options={priorityOptions}
            wrapperClassName="w-40"
          />
          {refreshing && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
          )}
          <div className="ml-auto">
            <Button onClick={() => { setShowModal(true); setEditTask(null); }}>
              + New Task
            </Button>
          </div>
        </div>

        {/* Task List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No tasks found.</p>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm table-fixed">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 w-[30%]">Title</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 w-[14%]">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 w-[12%]">Priority</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 w-[18%]">Assigned To</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 w-[12%]">Due Date</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600 w-[14%]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <a
                          onClick={() => router.push(`/tasks/${task.id}`)}
                          className="text-indigo-700 hover:text-indigo-900 hover:underline font-medium cursor-pointer"
                        >
                          {task.title}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block w-24 text-center px-2 py-1 rounded-full text-xs font-medium ${statusColor[task.status]}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block w-16 text-center px-2 py-1 rounded-full text-xs font-medium ${priorityColor[task.priority]}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 truncate">
                        {task.assigned_user?.name || 'Unassigned'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => { setEditTask(task); setShowModal(true); }}>
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(task)}>
                            <span className="text-red-600">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  Previous
                </Button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  Page {page} of {lastPage}
                </span>
                <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.min(lastPage, p + 1))} disabled={page === lastPage}>
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Task Create/Edit Modal */}
      {showModal && (
        <TaskModal
          task={editTask}
          onClose={() => { setShowModal(false); setEditTask(null); }}
          onSaved={() => { setShowModal(false); setEditTask(null); refetchTasks(); }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmModal
          title="Delete Task"
          message={`Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
