declare module 'pdf2json' {
  class PDFParser {
    constructor();
    parseBuffer(buffer: Buffer): void;
    on(event: 'pdfParser_dataReady', callback: (data: any) => void): void;
    on(event: 'pdfParser_dataError', callback: (error: any) => void): void;
  }
  
  export default PDFParser;
} 