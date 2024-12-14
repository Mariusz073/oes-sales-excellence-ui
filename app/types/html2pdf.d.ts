declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: {
      type?: string;
      quality?: number;
    };
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      backgroundColor?: string;
      logging?: boolean;
      removeContainer?: boolean;
      letterRendering?: boolean;
      allowTaint?: boolean;
      foreignObjectRendering?: boolean;
      imageTimeout?: number;
      windowWidth?: number;
      onclone?: (clonedDoc: Document) => void;
    };
    jsPDF?: {
      unit?: string;
      format?: string;
      orientation?: 'portrait' | 'landscape';
      compress?: boolean;
      precision?: number;
      putOnlyUsedFonts?: boolean;
    };
    pagebreak?: {
      mode?: string | string[];
      before?: string[];
      after?: string[];
      avoid?: string[];
    };
    enable_smart_shrinking?: boolean;
  }

  interface Html2PdfInstance {
    from(element: Element): Html2PdfInstance;
    set(options: Html2PdfOptions): Html2PdfInstance;
    toPdf(): Html2PdfInstance;
    get(type: string): Promise<any>;
    save(): Promise<void>;
    output(type: string, options: any): Promise<any>;
  }

  function html2pdf(): Html2PdfInstance;
  export = html2pdf;
}
