'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createAnnouncement } from './actions';
import { UploadCloud, X, ImageIcon, Video } from 'lucide-react';

export default function CreateAnnouncementForm() {
  const [isPending, setIsPending] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      let mediaUrl = '';
      let mediaType = '';

      if (file) {
        setUploadingMedia(true);
        const uploadData = new FormData();
        uploadData.append('file', file);
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        });
        
        if (!res.ok) throw new Error('Failed to upload media');
        
        const data = await res.json();
        mediaUrl = data.url;
        mediaType = file.type.startsWith('video/') ? 'video' : 'image';
        setUploadingMedia(false);
      }

      formData.append('mediaUrl', mediaUrl);
      formData.append('mediaType', mediaType);

      const publishAtInput = (document.querySelector('input[name="publishAt"]') as HTMLInputElement)?.value;
      if (publishAtInput) {
        formData.append('publishAt', publishAtInput);
      }

      await createAnnouncement(formData);
      toast.success("Broadcast published globally!");
      router.push('/principal/announcements');
    } catch (err: any) {
      toast.error(err.message || "Failed to publish announcement.");
      setUploadingMedia(false);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 text-sm">
      <div>
        <label className="block text-slate-500 font-bold mb-1 text-xs">Announcement Headline</label>
        <input 
          required 
          name="title" 
          type="text" 
          placeholder="e.g. Welcome to 2nd Term! Important Schedule Changes"
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-800 transition" 
        />
      </div>

      <div>
        <label className="block text-slate-500 font-bold mb-1 text-xs">Message Body</label>
        <textarea 
          required 
          name="content" 
          rows={6} 
          placeholder="Write the full details of your announcement here..."
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-y transition text-slate-700"
        ></textarea>
      </div>

      <div>
        <label className="block text-slate-500 font-bold mb-2 text-xs">Attach Media (Optional Image or Video)</label>
        
        {!preview ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition group"
          >
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-700">Click to upload media</p>
            <p className="text-xs font-bold text-slate-400 mt-1">Supports JPG, PNG, GIF, MP4</p>
          </div>
        ) : (
          <div className="relative inline-block border border-slate-200 rounded-xl overflow-hidden bg-slate-100 max-w-md w-full">
            <button 
              type="button"
              onClick={removeFile}
              className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-rose-500 text-white rounded-full transition z-10"
            >
              <X className="w-4 h-4" />
            </button>
            
            {file?.type.startsWith('video/') ? (
              <video src={preview} controls className="w-full h-auto max-h-[300px] object-contain" />
            ) : (
              <img src={preview} alt="Preview" className="w-full h-auto max-h-[300px] object-contain" />
            )}
            
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2 flex items-center gap-2 text-white text-xs font-bold">
              {file?.type.startsWith('video/') ? <Video className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
              <span className="truncate">{file?.name}</span>
            </div>
          </div>
        )}
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*,video/mp4,video/webm" 
          className="hidden" 
        />
      </div>

      <div>
        <label className="block text-slate-500 font-bold mb-1 text-xs">Publish Date & Time (Optional)</label>
        <input 
          name="publishAt" 
          type="datetime-local" 
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-800 transition" 
        />
        <p className="text-[10px] text-slate-400 mt-1 font-bold">Leave blank to publish immediately.</p>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
        <button disabled={isPending} type="submit" className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black rounded-xl shadow-lg hover:shadow-indigo-500/30 transition flex justify-center items-center gap-2">
          {uploadingMedia ? 'Uploading Media...' : isPending ? 'Publishing...' : 'Publish Broadcast'}
        </button>
      </div>
    </form>
  );
}
