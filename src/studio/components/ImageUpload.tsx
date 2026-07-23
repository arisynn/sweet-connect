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
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      <div className="relative flex items-center justify-center w-full h-28 border-2 border-dashed border-pink-200 rounded-2xl bg-pink-50/50 overflow-hidden group hover:border-pink-400 hover:bg-pink-100/50 transition-all cursor-pointer">
        {previewUrl ? (
          <>
            <img src={previewUrl} alt={label} className="w-full h-full object-contain p-2 drop-shadow-md" />
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
               <button 
                 onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                 className="p-3 bg-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 text-pink-500 transition-all border border-pink-100"
               >
                 <Upload className="w-4 h-4" />
               </button>
               <button 
                 onClick={(e) => { e.stopPropagation(); onChange(undefined); }}
                 className="p-3 bg-red-50 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 text-red-500 transition-all border border-red-100"
               >
                 <X className="w-4 h-4" />
               </button>
            </div>
          </>
        ) : (
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center w-full h-full text-pink-300 hover:text-pink-500 transition-colors"
          >
            <Upload className="w-6 h-6 mb-2" />
            <span className="text-xs font-bold">Select File</span>
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
