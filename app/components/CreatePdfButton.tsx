'use client';

import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { generatePdf } from '../actions/generatePdf';

export default function CreatePdfButton() {
  const handleCreatePDF = async () => {
    try {
      // Get the main content element (excluding the PDF button)
      const element = document.querySelector('.max-w-5xl') as HTMLElement;
      if (!element) return;

      // Remove the PDF button temporarily for capture
      const pdfButton = element.querySelector('div.flex.justify-center') as HTMLElement;
      if (pdfButton) {
        pdfButton.style.display = 'none';
      }

      // Create canvas from the element
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Enable CORS for images
        logging: false, // Disable logging
        backgroundColor: '#1E1E1E', // Match the page background
      });

      // Restore the PDF button
      if (pdfButton) {
        pdfButton.style.display = 'flex';
      }

      // Calculate dimensions
      const contentWidth = element.offsetWidth;
      const contentHeight = element.offsetHeight;
      
      // Convert pixels to mm (assuming 96 DPI)
      const pxToMm = 0.264583333;
      const marginMm = 10; // 10mm margin
      
      // Calculate PDF dimensions
      const pdfWidth = (contentWidth * pxToMm) + (marginMm * 2);
      const pdfHeight = 297; // A4 height in mm
      
      // Create PDF with custom width
      const pdf = new jsPDF('p', 'mm', [pdfWidth, pdfHeight]);
      
      // Calculate how many pages we need
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdfHeight - (marginMm * 2);
      const pageCount = Math.ceil(imgHeight / pageHeight);
      
      // Add pages one by one
      for (let i = 0; i < pageCount; i++) {
        if (i > 0) {
          pdf.addPage([pdfWidth, pdfHeight]);
        }
        
        // Calculate which portion of the image to use for this page
        const sourceY = i * pageHeight * (canvas.height / imgHeight);
        const sourceHeight = pageHeight * (canvas.height / imgHeight);
        
        // Create a temporary canvas for this portion
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = sourceHeight;
        const ctx = tempCanvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(
            canvas,
            0, sourceY, canvas.width, sourceHeight, // Source rectangle
            0, 0, canvas.width, sourceHeight // Destination rectangle
          );
          
          // Add this portion to the PDF
          pdf.addImage(
            tempCanvas.toDataURL('image/png'),
            'PNG',
            marginMm,
            marginMm,
            pdfWidth - (marginMm * 2),
            pageHeight
          );
        }
      }

      // Save the PDF
      pdf.save('report.pdf');

      // Call server action to log the generation
      await generatePdf();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <button 
      onClick={handleCreatePDF}
      className="bg-[#FF6B8A] text-white px-6 py-2 rounded hover:bg-[#ff8da6] transition-colors duration-200"
    >
      Create .pdf
    </button>
  );
}
