'use client';

import { useState } from 'react';
import { generatePdf } from '../actions/generatePdf';
import html2pdf from 'html2pdf.js';

export default function CreatePdfButton() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCreatePDF = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const element = document.querySelector('.max-w-5xl');
      if (!element) return;

      const opt = {
        filename: 'report.pdf',
        html2canvas: { backgroundColor: '#1E1E1E' }
      };

      await html2pdf().from(element).set(opt).save();
      await generatePdf();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button 
      onClick={handleCreatePDF}
      disabled={isGenerating}
      className={`bg-[#FF6B8A] text-white px-6 py-2 rounded transition-colors duration-200 ${
        isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#ff8da6]'
      }`}
    >
      {isGenerating ? 'Generating...' : 'Create .pdf'}
    </button>
  );
}
