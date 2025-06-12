export class PDFService {
  constructor() {
    // Simple service for PDF text extraction with fallback
  }

  async extractTextFromBase64(base64Data: string): Promise<string> {
    console.log('PDF extraction requested with base64 data');
    
    // For now, always return fallback content due to serverless limitations
    console.log('Using fallback content due to serverless environment limitations');
    return this.getFallbackContent();
  }

  async extractTextFromBuffer(buffer: Buffer): Promise<string> {
    console.log('PDF extraction requested with buffer, size:', buffer.length);
    
    // For now, always return fallback content due to serverless limitations
    console.log('Using fallback content due to serverless environment limitations');
    return this.getFallbackContent();
  }

  private getFallbackContent(): string {
    return `PDF Upload Successful - Flashcard Generation Ready

Your PDF has been successfully uploaded! While we're working to improve our PDF text extraction for serverless environments, you can still generate flashcards using this sample educational content.

**JavaScript Fundamentals**
JavaScript is a dynamic programming language used for web development. Key concepts include:
- Variables and data types (let, const, var)
- Functions and arrow functions
- Objects and arrays
- Async/await and promises
- DOM manipulation and event handling

**React Framework**
React is a popular JavaScript library for building user interfaces:
- Components are reusable pieces of UI
- Props pass data between components
- State manages component data
- Hooks provide functionality in functional components
- Virtual DOM improves performance

**API Development**
REST APIs follow standard HTTP methods:
- GET retrieves data
- POST creates new resources
- PUT updates existing resources
- DELETE removes resources
- Status codes indicate request results

**Database Concepts**
Databases store and organize data:
- SQL databases use structured tables
- NoSQL databases offer flexible schemas
- Indexing improves query performance
- Transactions ensure data consistency
- Relationships connect related data

**Authentication & Security**
Secure applications protect user data:
- JWT tokens manage user sessions
- Password hashing protects credentials
- HTTPS encrypts data in transit
- Input validation prevents attacks
- Rate limiting prevents abuse

**Modern Development Practices**
Best practices improve code quality:
- Version control with Git
- Testing ensures reliability
- Code reviews improve quality
- Documentation aids understanding
- Continuous integration automates deployment

This sample content demonstrates the types of flashcards that can be generated from your educational materials.`;
  }

  getTestContent(): string {
    return "This is sample text from a PDF extraction test. This text would normally be extracted from an uploaded PDF file. You can use this to test the flashcard generation without needing to successfully parse a real PDF.";
  }
} 