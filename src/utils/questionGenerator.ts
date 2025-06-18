import type { Question } from '../types';
import { generateQuestionsWithAI } from './aiQuestionGenerator';

export async function generateQuestions(text: string, questionCount: number = 15): Promise<Question[]> {
  console.log('🚀 Starting AI-powered question generation...');
  
  try {
    // Use AI-powered generation
    const questions = await generateQuestionsWithAI(text, questionCount);
    
    if (questions.length > 0) {
      console.log(`✅ Successfully generated ${questions.length} AI questions`);
      return questions;
    } else {
      console.log('⚠️ AI generation returned no questions, falling back to rule-based');
      return generateFallbackQuestions(text, questionCount);
    }
  } catch (error) {
    console.error('❌ AI generation failed:', error);
    console.log('🔄 Falling back to rule-based generation');
    return generateFallbackQuestions(text, questionCount);
  }
}

// Fallback rule-based generation (simplified version of the original)
function generateFallbackQuestions(text: string, questionCount: number): Question[] {
  console.log('📝 Generating fallback questions...');
  
  const cleanText = text.replace(/\s+/g, ' ').trim();
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const questions: Question[] = [];
  
  // Generate basic questions from sentences
  for (let i = 0; i < Math.min(questionCount, sentences.length); i++) {
    const sentence = sentences[i].trim();
    
    questions.push({
      id: i + 1,
      question: `What does the document state about this topic?`,
      options: [
        sentence.length > 100 ? sentence.substring(0, 100) + '...' : sentence,
        'This information is not mentioned in the document',
        'The document contradicts this statement',
        'This is only partially correct according to the document'
      ],
      correctAnswer: 0,
      explanation: `This information is directly stated in the document.`,
      difficulty: 'medium'
    });
  }
  
  // Fill remaining slots with general questions
  while (questions.length < questionCount) {
    questions.push({
      id: questions.length + 1,
      question: `Based on the document, what is the main focus of the content?`,
      options: [
        'The document provides comprehensive information on the topic',
        'The document only covers basic introductory material',
        'The document focuses on unrelated topics',
        'The document contains contradictory information'
      ],
      correctAnswer: 0,
      explanation: 'The document is designed to provide informative content on its subject matter.',
      difficulty: 'easy'
    });
  }
  
  return questions.slice(0, questionCount);
}