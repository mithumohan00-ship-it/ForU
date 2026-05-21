import React, { useState } from 'react';
import { Image, Upload, X, Loader2 } from 'lucide-react';
import { uploadMedia } from '../../firebase/config';

export default function ImageUploader({ onImageUploaded, currentImageUrl }) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file!');
      return;
    }

    setIsUploading(true);
    try {
      // Use config upload (base64 fallback automatic)
      const url = await uploadMedia(file, 'card-images');
      onImageUploaded(url);
    } catch (error) {
      console.error('Upload error', error);
      alert('Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1.5 text-slate-500 font-medium text-xs tracking-wider uppercase">
        <Image className="w-3.5 h-3.5 text-indigo-400" />
        <span>Photo Attachment</span>
      </div>

      {currentImageUrl ? (
        <div className="relative rounded-2xl overflow-hidden aspect-video border border-slate-200 shadow-sm bg-slate-50 flex items-center justify-center">
          <img
            src={currentImageUrl}
            alt="Upload Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onImageUploaded('')}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white transition-all active:scale-95"
            title="Remove Photo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all ${
            dragActive
              ? 'border-pink-400 bg-pink-50/20'
              : 'border-slate-200 bg-white/40 hover:border-pink-300 hover:bg-white/60'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Uploading visual memory...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-pink-50 rounded-xl text-pink-400 shadow-xs">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">Upload a Photo</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Drag and drop or click to browse</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
