import { Upload, X } from 'lucide-react';
import React, { useRef } from 'react';

interface ImageUploadProps {
  label: string;
  value?: File | string;
  onChange: (file: File | string | undefined) => void;
  previewUrl: string;
}

export function ImageUpload({ label, value, onChange, previewUrl }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
      <div className="relative flex items-center justify-center w-full h-24 border-2 border-dashed border-slate-700 rounded-xl bg-slate-900/50 overflow-hidden group hover:border-pink-500 transition-colors">
        {previewUrl ? (
          <>
            <img src={previewUrl} alt={label} className="w-full h-full object-contain p-2" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-white"
               >
                 <Upload className="w-4 h-4" />
               </button>
               <button 
                 onClick={() => onChange(undefined)}
                 className="p-2 bg-red-900/80 rounded-lg hover:bg-red-800 text-white"
               >
                 <X className="w-4 h-4" />
               </button>
            </div>
          </>
        ) : (
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-pink-400 transition-colors"
          >
            <Upload className="w-6 h-6 mb-2 opacity-50" />
            <span className="text-xs font-medium">Click to upload</span>
          </button>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
      </div>
    </div>
  );
}
