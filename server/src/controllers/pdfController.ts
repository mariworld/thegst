import { Request, Response } from 'express';
import { PDFService } from '../services/pdfService.js';

export class PDFController {
  private pdfService: PDFService;

  constructor() {
    this.pdfService = new PDFService();
  }

  async extractPDF(req: Request, res: Response): Promise<Response> {
    
    try {
      // Check if we have a file uploaded
      const file = (req as any).file;
      if (!file) {

        return res.status(400).json({
          success: false,
          message: 'No PDF file found in request'
        });
      }


      
      try {
        const extractedText = await this.pdfService.extractTextFromBuffer(file.buffer);
        
        return res.status(200).json({
          success: true,
          extractedText: extractedText
        });
      } catch (error) {
        console.error('Error extracting text from PDF:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to extract text from PDF',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    } catch (error) {
      console.error('Unexpected error in PDF extraction:', error);
      return res.status(500).json({
        success: false,
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async testExtractPDF(req: Request, res: Response): Promise<Response> {
    try {
      const testContent = this.pdfService.getTestContent();
      
      return res.status(200).json({
        success: true,
        extractedText: testContent
      });
    } catch (error) {
      console.error('Error with test PDF extraction:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to provide test PDF text',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
} 