import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
    return await file.text();
  }
  
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    try {
      return await extractTextFromPDF(file);
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error('Could not extract text from PDF file. Please ensure the PDF contains readable text.');
    }
  }
  
  if (file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
    throw new Error('Word document support requires additional setup. Please convert to text format (.txt) or PDF.');
  }
  
  // Fallback: try to read as text
  try {
    return await file.text();
  } catch (error) {
    throw new Error('Could not extract text from file. Please ensure it\'s a readable text format.');
  }
}

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  // Extract text from each page
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    
    fullText += pageText + '\n';
  }
  
  if (fullText.trim().length === 0) {
    throw new Error('No readable text found in PDF. The PDF might contain only images or be password protected.');
  }
  
  return fullText.trim();
}