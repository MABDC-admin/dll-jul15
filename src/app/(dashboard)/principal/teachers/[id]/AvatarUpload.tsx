'use client';

import { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { updateTeacherAvatar } from './actions';

export default function AvatarUpload({ 
  teacherProfileId, 
  currentAvatar, 
  teacherName 
}: { 
  teacherProfileId: string;
  currentAvatar: string | null;
  teacherName: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(teacherName)}&background=random`;
  const [avatarSrc, setAvatarSrc] = useState(currentAvatar || defaultAvatar);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Upload the file using the existing upload API
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await res.json();
      
      // Update the teacher profile in the database
      await updateTeacherAvatar(teacherProfileId, data.url);
      
      setAvatarSrc(data.url);
      toast.success('Teacher photo updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while uploading');
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative group">
      <img 
        src={avatarSrc} 
        alt={teacherName} 
        className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-50" 
      />
      
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
        title="Change Photo"
      >
        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
      </button>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
}
