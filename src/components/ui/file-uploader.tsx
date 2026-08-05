import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, File, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from './button';

export interface FileUploaderProps {
  files: Array<{ url: string; file?: File; isUploading?: boolean; name?: string }>;
  onFilesAdded: (files: File[]) => void;
  onFileRemove: (index: number) => void;
  maxFiles?: number;
  className?: string;
}

export function FileUploader({ 
  files, 
  onFilesAdded, 
  onFileRemove, 
  maxFiles = 6,
  className = ''
}: FileUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (files.length + acceptedFiles.length > maxFiles) {
      alert(`Solo puedes adjuntar un máximo de ${maxFiles} archivos.`);
      return;
    }
    onFilesAdded(acceptedFiles);
  }, [files.length, maxFiles, onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: maxFiles - files.length,
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    disabled: files.length >= maxFiles
  });

  return (
    <div className={`space-y-4 ${className}`}>
      {files.length < maxFiles && (
        <div
          {...getRootProps()}
          className={`border border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors shadow-none ${
            isDragActive
              ? 'border-pharmako-care bg-pharmako-care-light'
              : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">
            {isDragActive ? 'Suelta los archivos aquí' : 'Haz clic o arrastra archivos aquí'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Imágenes y documentos (Máximo {maxFiles})
          </p>
        </div>
      )}

      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {files.map((fileObj, index) => {
            const isImage = fileObj.url.match(/\.(jpeg|jpg|png)$/i) || (fileObj.file && fileObj.file.type.startsWith('image/'));
            const displayName = fileObj.name || fileObj.file?.name || `Archivo adjunto ${index + 1}`;

            return (
              <div 
                key={index} 
                className="relative group border border-slate-200 rounded-lg overflow-hidden bg-white shadow-none p-2 flex flex-col gap-2 items-center text-center justify-center min-h-[100px]"
              >
                {fileObj.isUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-pharmako-care" />
                ) : isImage ? (
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                ) : (
                  <File className="w-6 h-6 text-slate-400" />
                )}
                
                <span className="text-[10px] font-medium text-slate-600 truncate w-full px-1" title={displayName}>
                  {displayName}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileRemove(index);
                  }}
                  className="absolute top-1 right-1 bg-white border border-slate-200 rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-50 shadow-none text-slate-500 hover:text-slate-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
