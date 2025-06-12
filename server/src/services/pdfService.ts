import PDFParse from 'pdf-parse';

export class PDFService {
  constructor() {
    // No initialization needed for pdf-parse
  }

  async extractTextFromBase64(base64Data: string): Promise<string> {
    try {
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

      // Extract text from PDF using pdf-parse
      console.log('Extracting text from PDF buffer...');
      const data = await PDFParse(dataBuffer);
      
      console.log('PDF extraction complete:', {
        numPages: data.numpages,
        textLength: data.text.length,
        textSample: data.text.substring(0, 100) + '...'
      });

      // Check if we extracted any meaningful text
      if (!data.text || data.text.trim().length === 0) {
        console.log('No text could be extracted from PDF. Using fallback content.');
        return this.getFallbackContent();
      }

      console.log('Successfully extracted text from PDF');
      console.log('Extracted text length:', data.text.length);
      
      return data.text;
    } catch (error) {
      console.error('Error in PDF extraction:', error);
      
      // If extraction fails, provide fallback content
      console.log('PDF extraction failed, using fallback content');
      return this.getFallbackContent();
    }
  }

  async extractTextFromBuffer(buffer: Buffer): Promise<string> {
    try {
      console.log('Extracting text from PDF buffer, size:', buffer.length);

      // Extract text from PDF using pdf-parse
      const data = await PDFParse(buffer);
      
      console.log('PDF extraction complete:', {
        numPages: data.numpages,
        textLength: data.text.length,
        textSample: data.text.substring(0, 100) + '...'
      });

      // Check if we extracted any meaningful text
      if (!data.text || data.text.trim().length === 0) {
        console.log('No text could be extracted from PDF. Using fallback content.');
        return this.getFallbackContent();
      }

      console.log('Successfully extracted text from PDF');
      console.log('Extracted text length:', data.text.length);
      
      return data.text;
    } catch (error) {
      console.error('Error in PDF extraction:', error);
      
      // If extraction fails, provide fallback content
      console.log('PDF extraction failed, using fallback content');
      return this.getFallbackContent();
    }
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