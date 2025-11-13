'use client';

import { useRef, useState, DragEvent } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

export default function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    } else {
      alert('画像ファイルを選択してください');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
        isDragging ? 'border-primary bg-accent' : 'border-border hover:border-primary/50'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className='space-y-4'>
        <Upload
          className={`mx-auto h-12 w-12 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`}
        />
        <div>
          <label
            htmlFor='file-upload'
            className='cursor-pointer text-primary hover:text-primary/80 font-medium'
          >
            クリックして画像を選択
          </label>
          <span className='text-muted-foreground'> またはドラッグ&ドロップ</span>
        </div>
        <p className='text-sm text-muted-foreground'>PNG, JPG, GIF などの画像ファイル</p>
        <input
          ref={fileInputRef}
          id='file-upload'
          type='file'
          accept='image/*'
          onChange={handleFileInputChange}
          className='hidden'
        />
      </div>
    </div>
  );
}
