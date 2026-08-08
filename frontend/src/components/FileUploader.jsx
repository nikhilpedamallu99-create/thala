import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, FileCode } from 'lucide-react';
import { uploadDocument } from '../services/api';

export default function FileUploader({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const validateAndProcessFile = (selectedFile) => {
    const validExts = ['pdf', 'txt', 'docx', 'doc', 'md'];
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (!validExts.includes(ext)) {
      setStatusMsg({
        type: 'error',
        text: `Invalid file type '.${ext}'. Please upload PDF, TXT, DOCX, or MD.`,
      });
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setStatusMsg(null);
  };

  const handleStartUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setStatusMsg(null);

    try {
      const response = await uploadDocument(file, (percent) => {
        setProgress(percent);
      });

      setStatusMsg({
        type: 'success',
        text: `Successfully uploaded "${file.name}". Document processing in background.`,
      });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onUploadSuccess) onUploadSuccess(response);
    } catch (err) {
      console.error(err);
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to upload document. Please check connection.',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/20 scale-[1.01]'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.docx,.doc,.md"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-inner">
            <UploadCloud className="h-7 w-7" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-200">
              Drag & Drop your document here, or <span className="text-cyan-400 underline decoration-cyan-500/40 underline-offset-4">browse</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports PDF, TXT, DOCX, and MD files up to 25MB
            </p>
          </div>
        </div>

        {file && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-cyan-400" />
              <div className="text-left">
                <p className="text-sm font-medium text-slate-200 truncate max-w-xs">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button
              onClick={handleStartUpload}
              disabled={uploading}
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-lg hover:from-cyan-400 hover:to-indigo-500 transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading {progress}%</span>
                </>
              ) : (
                <span>Upload & Extract</span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {uploading && (
        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Status Messages */}
      {statusMsg && (
        <div
          className={`p-3 rounded-xl border flex items-center gap-3 text-xs ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}
    </div>
  );
}
