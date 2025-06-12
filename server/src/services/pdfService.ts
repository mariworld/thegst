import { PDFExtract, PDFExtractOptions } from 'pdf.js-extract';

export class PDFService {
  private pdfExtract: PDFExtract;

  constructor() {
    this.pdfExtract = new PDFExtract();
  }

  async extractTextFromBase64(base64Data: string): Promise<string> {
    // Validate input
    if (!base64Data.startsWith('data:application/pdf;base64,')) {
      throw new Error('PDF data must be in base64 format');
    }
    
    // Extract the base64 data
    const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, '');
    console.log('Extracted base64 data of length:', cleanBase64.length);
    
    // Convert base64 to buffer
    const dataBuffer = Buffer.from(cleanBase64, 'base64');
    console.log('Converted to buffer of length:', dataBuffer.length);

    // Set up options for PDF extraction
    const options: PDFExtractOptions = {};

    // Extract text from PDF using pdf.js-extract
    console.log('Extracting text from PDF buffer...');
    const data = await this.pdfExtract.extractBuffer(dataBuffer, options);
    console.log('PDF extraction data:', JSON.stringify(data).substring(0, 200) + '...');

    return this.processExtractedData(data);
  }

  private processExtractedData(data: any): string {
    let fullText = '';
    let pageCount = 0;

    if (data && data.pages && Array.isArray(data.pages)) {
      pageCount = data.pages.length;
      console.log('PDF extraction complete, pages found:', pageCount);
      
      for (const page of data.pages) {
        if (page.content && Array.isArray(page.content)) {
          const pageContent = page.content.map((item: any) => item.str || '').join(' ');
          fullText += pageContent + '\n\n';
        }
      }
      
      // Check if we extracted any meaningful text
      if (!fullText.trim()) {
        console.log('No text could be extracted from PDF, but structure was valid. Using fallback content.');
        return this.getFallbackContent();
      }
    } else {
      console.error('PDF extraction failed: Invalid or incomplete extraction data');
      throw new Error('Invalid or incomplete extraction data');
    }

    console.log('Successfully extracted text from PDF');
    console.log('Extracted text length:', fullText.length);
    console.log('Extracted text sample:', fullText.substring(0, 200) + '...');
    
    return fullText;
  }

  private getFallbackContent(): string {
    return `This PDF couldn't be extracted properly, likely because it contains:
- Scanned images without OCR
- Protected content
- Text embedded in a non-standard way
- Custom fonts or characters

You can still create flashcards from these sample resume topics:
1. Professional experience and responsibilities
2. Technical skills and proficiencies
3. Educational background and qualifications
4. Project highlights and achievements
5. Leadership roles and team contributions`;
  }

  getTestContent(): string {
    return "This is sample text from a PDF extraction test. This text would normally be extracted from an uploaded PDF file. You can use this to test the flashcard generation without needing to successfully parse a real PDF.";
  }
} 