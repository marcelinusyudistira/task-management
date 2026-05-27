'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { Task, TaskComment } from '@/types';
import { Button, Input } from '@/components/atoms';
import FileUpload from '@/components/FileUpload';
import toast from 'react-hot-toast';

export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fetched = useRef(false);

  const fetchTask = useCallback(async () => {
    try {
      const { data } = await api.get(`/tasks/${id}`);
      setTask(data.data);
    } catch {
      toast.error('Failed to load task');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/login'); return; }
    if (fetched.current) return;
    fetched.current = true;
    fetchTask();
  }, [router, fetchTask]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/tasks/${id}/comments`, { comment });
      setComment('');
      toast.success('Comment added');
      fetchTask();
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await api.delete(`/comments/${commentId}`);
      toast.success('Comment deleted');
      fetchTask();
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!task) return <p className="text-center py-12">Task not found</p>;

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <a onClick={() => router.push('/dashboard')} className="text-blue-600 hover:text-blue-800 cursor-pointer">
            ← Back
          </a>
          <h1 className="text-xl font-bold">{task.title}</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Task Details */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <span className="text-xs text-gray-500">Status</span>
              <p className="font-medium capitalize">{task.status.replace('_', ' ')}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Priority</span>
              <p className="font-medium capitalize">{task.priority}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Assigned To</span>
              <p className="font-medium">{task.assigned_user?.name || 'Unassigned'}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Due Date</span>
              <p className="font-medium">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
          {task.description && <p className="text-gray-700">{task.description}</p>}
        </div>

        {/* File Upload */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">Attachments</h2>
          <FileUpload taskId={task.id} attachments={task.attachments || []} onUploaded={fetchTask} />
        </div>

        {/* Comments */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">Comments ({task.comments?.length || 0})</h2>
          <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
            <Input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              wrapperClassName="flex-1"
            />
            <Button type="submit" loading={submitting}>
              Send
            </Button>
          </form>
          <div className="space-y-3">
            {task.comments?.map((c: TaskComment) => (
              <div key={c.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium">{c.user?.name}</span>
                  <p className="text-sm text-gray-700 mt-1">{c.comment}</p>
                  <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteComment(c.id)}>
                  <span className="text-red-500">Delete</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
