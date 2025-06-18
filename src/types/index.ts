export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export type QuizState = 'upload' | 'quiz' | 'results';

export type QuizMode = 'immediate' | 'end';

export interface DocumentChunk {
  content: string;
  startIndex: number;
  endIndex: number;
  keyTerms: string[];
  concepts: string[];
  facts: string[];
}

export interface RAGContext {
  originalDocument: string;
  chunks: DocumentChunk[];
  questionCount: number;
  difficulty: 'mixed' | 'easy' | 'medium' | 'hard';
}

export interface QuizSettings {
  questionCount: number;
  mode: QuizMode;
}