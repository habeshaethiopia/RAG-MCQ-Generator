# 📡 API Documentation

## Core Functions

### Document Processing

#### `extractTextFromFile(file: File): Promise<string>`

Extracts text content from uploaded files with support for multiple formats.

**Parameters:**
- `file: File` - The uploaded file object


**Returns:**
- `Promise<string>` - Extracted text content

**Supported Formats:**
- PDF (.pdf)
- Text files (.txt, .md)
- Word documents (.doc, .docx)

**Example:**
```typescript
const file = event.target.files[0];
const text = await extractTextFromFile(file);
console.log(`Extracted ${text.length} characters`);
```

**Error Handling:**
```typescript
try {
  const text = await extractTextFromFile(file);
} catch (error) {
  console.error('Extraction failed:', error.message);
}
```

### Question Generation

#### `generateQuestions(text: string, questionCount: number): Promise<Question[]>`

Generates multiple-choice questions using RAG technology.

**Parameters:**
- `text: string` - Source document text
- `questionCount: number` - Number of questions to generate (5-30)

**Returns:**
- `Promise<Question[]>` - Array of generated questions

**Example:**
```typescript
const questions = await generateQuestions(documentText, 15);
console.log(`Generated ${questions.length} questions`);
```

### AI Question Generator Class

#### `new AIQuestionGenerator(apiKey?: string, provider?: string)`

Creates an instance of the AI-powered question generator.

**Parameters:**
- `apiKey?: string` - Optional API key for external AI services
- `provider?: 'openai' | 'anthropic' | 'gemini' | 'local'` - AI provider selection

**Methods:**

##### `generateQuestions(text: string, questionCount: number): Promise<Question[]>`

Main question generation method with RAG implementation.

##### `chunkDocument(text: string): string[]`

Splits document into semantic chunks for analysis.

##### `analyzeChunks(chunks: string[]): AnalyzedChunk[]`

Performs semantic analysis on document chunks.

**Example:**
```typescript
// Local AI (default)
const generator = new AIQuestionGenerator();
const questions = await generator.generateQuestions(text, 10);

// With external API
const generator = new AIQuestionGenerator('your-api-key', 'openai');
const questions = await generator.generateQuestions(text, 10);
```

## Type Definitions

### Question Interface

```typescript
interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}
```

### Quiz Settings Interface

```typescript
interface QuizSettings {
  questionCount: number;
  mode: QuizMode;
}

type QuizMode = 'immediate' | 'end';
```

### Document Chunk Interface

```typescript
interface DocumentChunk {
  content: string;
  startIndex: number;
  endIndex: number;
  keyTerms: string[];
  concepts: string[];
  facts: string[];
}
```

### RAG Context Interface

```typescript
interface RAGContext {
  originalDocument: string;
  chunks: DocumentChunk[];
  questionCount: number;
  difficulty: 'mixed' | 'easy' | 'medium' | 'hard';
}
```

## Component APIs

### FileUpload Component

**Props:**
```typescript
interface FileUploadProps {
  onFileUpload: (file: File, settings: QuizSettings) => void;
  isProcessing: boolean;
}
```

**Events:**
- `onFileUpload` - Triggered when file is uploaded with settings

### QuestionDisplay Component

**Props:**
```typescript
interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answerIndex: number) => void;
  selectedAnswer?: number;
  mode: QuizMode;
}
```

**Events:**
- `onAnswer` - Triggered when user selects an answer

### Results Component

**Props:**
```typescript
interface ResultsProps {
  questions: Question[];
  userAnswers: { [key: number]: number };
  onRestart: () => void;
}
```

**Events:**
- `onRestart` - Triggered when user wants to start over

## Error Codes

### File Processing Errors

| Code | Message | Description |
|------|---------|-------------|
| `FILE_TOO_LARGE` | File size must be less than 10MB | File exceeds size limit |
| `UNSUPPORTED_FORMAT` | Please upload a supported file format | File type not supported |
| `EXTRACTION_FAILED` | Could not extract text from file | Text extraction error |
| `INSUFFICIENT_CONTENT` | Document is too short | Not enough content for questions |

### Question Generation Errors

| Code | Message | Description |
|------|---------|-------------|
| `GENERATION_FAILED` | Could not generate questions | AI generation error |
| `INVALID_COUNT` | Question count must be between 5-30 | Invalid question count |
| `API_ERROR` | External AI service unavailable | API service error |
| `TIMEOUT_ERROR` | Processing timeout exceeded | Operation took too long |

## Rate Limits

### Local Processing
- No rate limits for local AI processing
- Limited by browser memory and processing power

### External API Integration
- OpenAI: 60 requests per minute
- Anthropic: 50 requests per minute  
- Gemini: 100 requests per minute

## Best Practices

### File Upload
```typescript
// Validate file before processing
const validateFile = (file: File): string | null => {
  if (file.size > 10 * 1024 * 1024) {
    return 'File too large';
  }
  if (!supportedTypes.includes(file.type)) {
    return 'Unsupported format';
  }
  return null;
};
```

### Question Generation
```typescript
// Always handle errors gracefully
try {
  const questions = await generateQuestions(text, count);
  if (questions.length === 0) {
    throw new Error('No questions generated');
  }
  return questions;
} catch (error) {
  console.error('Generation failed:', error);
  return fallbackQuestions;
}
```

### Performance Optimization
```typescript
// Use React.memo for expensive components
const QuestionDisplay = React.memo(({ question, ...props }) => {
  // Component implementation
});

// Debounce file processing
const debouncedProcess = useCallback(
  debounce(processFile, 300),
  []
);
```