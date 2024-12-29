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
      
      if (!element) {
        console.error('Element not found');
        return;
      }

      const opt = {
        margin: [10, 10],
        filename: 'report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          backgroundColor: '#FFFFFF',
          logging: true,
          useCORS: true
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      try {
        await html2pdf().from(element).set(opt).save();
        await generatePdf();
      } catch (pdfError) {
        console.error('PDF generation failed:', pdfError);
        // Optionally show user-friendly error message
        alert('Failed to generate PDF. Please try again.');
      }

    } catch (error) {
      console.error('Error in handleCreatePDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button 
      type="button"
      onClick={handleCreatePDF}
      disabled={isGenerating}
      className={`
        bg-[#FF6B8A] 
        text-white 
        px-6 
        py-2 
        rounded 
        transition-colors 
        duration-200
        ${isGenerating 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:bg-[#ff8da6] active:bg-[#ff5273]'
        }
      `}
      aria-busy={isGenerating.toString()}
    >
      {isGenerating ? 'Generating...' : 'Create PDF (experimental)'}
    </button>
  );
}