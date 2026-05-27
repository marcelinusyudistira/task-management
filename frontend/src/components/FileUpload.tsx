'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '@/lib/api';
import { TaskAttachment } from '@/types';
import toast from 'react-hot-toast';

interface Props {
  taskId: number;
  attachments: TaskAttachment[];
  onUploaded: () => void;
}

export default function FileUpload({ taskId, attachments, onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    setProgress(0);

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        await api.post(`/tasks/${taskId}/attachments`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
          },
        });
        toast.success(`${file.name} uploaded`);
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    setProgress(0);
    onUploaded();
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 50 * 1024 * 1024, // 50MB
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'video/*': ['.mp4', '.webm'],
      'text/*': ['.txt', '.csv'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

  const handleDownload = async (attachment: TaskAttachment) => {
    try {
      const response = await api.get(`/attachments/${attachment.id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.file_name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download file');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/attachments/${id}`);
      toast.success('File deleted');
      onUploaded();
    } catch {
      toast.error('Failed to delete file');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div>
            <p className="text-sm text-gray-600">Uploading... {progress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : isDragActive ? (
          <p className="text-blue-600">Drop files here...</p>
        ) : (
          <div>
            <p className="text-gray-600">Drag & drop files here, or click to select</p>
            <p className="text-xs text-gray-400 mt-1">Max 50MB. Images, PDFs, documents, videos.</p>
          </div>
        )}
      </div>

      {/* File List */}
      {attachments.length > 0 && (
        <ul className="mt-4 space-y-2">
          {attachments.map((a) => (
            <li key={a.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{a.file_name}</span>
                <span className="text-xs text-gray-400">{formatSize(a.file_size)}</span>
              </div>
              <div className="flex gap-2">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleDownload(a); }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Download
                </a>
                <button onClick={() => handleDelete(a.id)} className="text-xs text-red-600 hover:text-red-800">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
