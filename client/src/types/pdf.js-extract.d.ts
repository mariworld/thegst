declare module 'pdf.js-extract' {
  export interface PDFExtractOptions {
    firstPage?: number;
    lastPage?: number;
    password?: string;
    verbosity?: number;
    normalizeWhitespace?: boolean;
    disableCombineTextItems?: boolean;
    max?: number; // Maximum number of pages to extract
  }

  export interface PDFExtractPage {
    pageInfo: {
      num: number;
      scale: number;
      rotation: number;
      offsetX: number;
      offsetY: number;
      width: number;
      height: number;
    };
    content: Array<{
      str: string;
      dir: string;
      width: number;
      height: number;
      transform: number[];
      fontName: string;
      hasEOL: boolean;
    }>;
  }

  export interface PDFExtractResult {
    filename?: string;
    meta?: any;
    pages: PDFExtractPage[];
    pdfInfo: {
      numPages: number;
      fingerprint: string;
    };
  }

  export class PDFExtract {
    constructor();
    extract(filename: string, options?: PDFExtractOptions): Promise<PDFExtractResult>;
    extractBuffer(buffer: Buffer, options?: PDFExtractOptions): Promise<PDFExtractResult>;
  }
} 