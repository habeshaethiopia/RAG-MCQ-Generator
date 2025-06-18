import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, Settings, Eye, Clock } from 'lucide-react';
import type { QuizSettings } from '../types';

interface FileUploadProps {
  onFileUpload: (file: File, settings: QuizSettings) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isProcessing }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [settings, setSettings] = useState<QuizSettings>({
    questionCount: 15,
    mode: 'immediate'
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'text/markdown',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.txt') && !file.name.endsWith('.md') && !file.name.endsWith('.pdf')) {
      return 'Please upload a text file, PDF, or Word document';
    }

    return null;
  };

  const handleFile = useCallback((file: File) => {
    setUploadError(null);
    const error = validateFile(file);
    
    if (error) {
      setUploadError(error);
      return;
    }

    onFileUpload(file, settings);
  }, [onFileUpload, settings]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Quiz Settings */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
        <div className="flex items-center mb-6">
          <Settings className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Quiz Settings</h3>
        </div>
        
        {/* Question Count */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="questionCount" className="text-sm font-medium text-gray-700">
              Number of questions:
            </label>
            <div className="min-w-[3rem] px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium text-center">
              {settings.questionCount}
            </div>
          </div>
          <input
            type="range"
            id="questionCount"
            min="5"
            max="30"
            step="5"
            value={settings.questionCount}
            onChange={(e) => setSettings(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            disabled={isProcessing}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5</span>
            <span>15</span>
            <span>30</span>
          </div>
        </div>

        {/* Quiz Mode */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            Quiz Mode:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, mode: 'immediate' }))}
              disabled={isProcessing}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                settings.mode === 'immediate'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center mb-2">
                <Eye className="w-5 h-5 mr-2" />
                <span className="font-medium">Immediate Feedback</span>
              </div>
              <p className="text-sm opacity-80">
                See results and explanations after each question
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, mode: 'end' }))}
              disabled={isProcessing}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                settings.mode === 'end'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center mb-2">
                <Clock className="w-5 h-5 mr-2" />
                <span className="font-medium">End Review</span>
              </div>
              <p className="text-sm opacity-80">
                Complete all questions, then review results
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-blue-400 bg-blue-50 scale-105'
            : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Processing Document...
            </h3>
            <p className="text-gray-500">
              Analyzing content and generating exactly {settings.questionCount} questions
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <Upload className="mx-auto h-16 w-16 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Upload Your Document
              </h3>
              <p className="text-gray-500 mb-6">
                Drag and drop your file here, or click to browse
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                <FileText className="w-4 h-4 mr-1" />
                TXT
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700">
                <FileText className="w-4 h-4 mr-1" />
                PDF
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-700">
                <FileText className="w-4 h-4 mr-1" />
                DOC
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700">
                <FileText className="w-4 h-4 mr-1" />
                MD
              </span>
            </div>

            <input
              type="file"
              onChange={handleFileInput}
              accept=".txt,.pdf,.doc,.docx,.md"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isProcessing}
            />

            <button
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105 transition-all duration-200"
              disabled={isProcessing}
            >
              Choose File
            </button>
          </>
        )}
      </div>

      {uploadError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          {uploadError}
        </div>
      )}

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Maximum file size: 10MB</p>
        <p className="mt-1">Supported formats: TXT, PDF, DOC, DOCX, MD</p>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default FileUpload;