// src/components/analytics/AnalysisModal.tsx
'use client'

import { X } from 'lucide-react';
import React from 'react';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function AnalysisModal({ isOpen, onClose, title, children }: AnalysisModalProps) {
  // We no longer return null when isOpen is false.
  // Instead, we use CSS classes to transition the modal in and out.
  
  return (
    // Overlay
    <div 
      className={`
        fixed inset-0 z-50 flex justify-center items-center p-4 
        transition-opacity duration-300 ease-in-out
        ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
      onClick={onClose}
    >
      {/* FIX: Added backdrop-filter for the frosted glass effect and a semi-transparent background.
      */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"></div>

      {/* Modal Content */}
      <div
        className={`
          bg-white rounded-lg shadow-2xl w-full max-w-4xl h-auto max-h-[90vh] 
          flex flex-col relative
          transition-all duration-300 ease-in-out
          ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 rounded-full hover:bg-gray-200 hover:text-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}