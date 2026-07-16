'use client';

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const QuillNoSSRWrapper = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <div className="h-64 bg-slate-50 border border-slate-200 rounded-lg animate-pulse flex items-center justify-center text-slate-400 text-sm font-bold">Loading Editor...</div>,
});

export default function DynamicQuill({ 
  value, 
  onChange, 
  placeholder 
}: { 
  value: string; 
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden quill-wrapper">
      <QuillNoSSRWrapper 
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        className="min-h-[200px]"
      />
    </div>
  );
}
