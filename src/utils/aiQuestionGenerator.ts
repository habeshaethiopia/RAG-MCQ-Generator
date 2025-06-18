import type { Question } from '../types';

// AI-powered question generation using various AI providers
export class AIQuestionGenerator {
  private apiKey: string | null = null;
  private provider: 'openai' | 'anthropic' | 'gemini' | 'local' = 'local';

  constructor(apiKey?: string, provider?: 'openai' | 'anthropic' | 'gemini' | 'local') {
    this.apiKey = apiKey || null;
    this.provider = provider || 'local';
  }

  async generateQuestions(text: string, questionCount: number = 15): Promise<Question[]> {
    // For demo purposes, we'll use a local AI simulation
    // In production, you would integrate with actual AI APIs
    
    if (this.apiKey && this.provider !== 'local') {
      return await this.generateWithAI(text, questionCount);
    } else {
      return await this.generateWithLocalAI(text, questionCount);
    }
  }

  private async generateWithAI(text: string, questionCount: number): Promise<Question[]> {
    const prompt = this.createRAGPrompt(text, questionCount);
    
    try {
      let response: string;
      
      switch (this.provider) {
        case 'openai':
          response = await this.callOpenAI(prompt);
          break;
        case 'anthropic':
          response = await this.callAnthropic(prompt);
          break;
        case 'gemini':
          response = await this.callGemini(prompt);
          break;
        default:
          throw new Error('Unsupported AI provider');
      }
      
      return this.parseAIResponse(response);
    } catch (error) {
      console.error('AI generation failed, falling back to local generation:', error);
      return await this.generateWithLocalAI(text, questionCount);
    }
  }

  private async generateWithLocalAI(text: string, questionCount: number): Promise<Question[]> {
    // Simulate AI processing with enhanced rule-based generation
    // This demonstrates the RAG concept using document chunks
    
    console.log('🤖 Generating questions with Local AI simulation...');
    
    // Step 1: Document Chunking (RAG Retrieval phase)
    const chunks = this.chunkDocument(text);
    console.log(`📄 Document split into ${chunks.length} chunks`);
    
    // Step 2: Semantic Analysis (RAG Understanding phase)
    const analyzedChunks = this.analyzeChunks(chunks);
    console.log('🔍 Chunks analyzed for semantic content');
    
    // Step 3: Question Generation (RAG Generation phase)
    const questions = await this.generateFromChunks(analyzedChunks, questionCount);
    console.log(`✅ Generated ${questions.length} AI-powered questions`);
    
    return questions;
  }

  private chunkDocument(text: string): string[] {
    // Split document into meaningful chunks (RAG retrieval strategy)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const chunks: string[] = [];
    
    // Create overlapping chunks of 3-5 sentences
    for (let i = 0; i < sentences.length; i += 3) {
      const chunk = sentences.slice(i, i + 5).join('. ').trim();
      if (chunk.length > 100) {
        chunks.push(chunk);
      }
    }
    
    return chunks;
  }

  private analyzeChunks(chunks: string[]): Array<{
    content: string;
    keyTerms: string[];
    concepts: string[];
    facts: string[];
    difficulty: 'easy' | 'medium' | 'hard';
  }> {
    return chunks.map(chunk => ({
      content: chunk,
      keyTerms: this.extractKeyTerms(chunk),
      concepts: this.extractConcepts(chunk),
      facts: this.extractFacts(chunk),
      difficulty: this.assessDifficulty(chunk)
    }));
  }

  private async generateFromChunks(
    analyzedChunks: Array<{
      content: string;
      keyTerms: string[];
      concepts: string[];
      facts: string[];
      difficulty: 'easy' | 'medium' | 'hard';
    }>,
    questionCount: number
  ): Promise<Question[]> {
    const questions: Question[] = [];
    let questionId = 1;

    // Distribute questions across difficulty levels
    const easyCount = Math.floor(questionCount * 0.4);
    const mediumCount = Math.floor(questionCount * 0.4);
    const hardCount = questionCount - easyCount - mediumCount;

    // Generate questions from each chunk
    for (const chunk of analyzedChunks) {
      if (questions.length >= questionCount) break;

      // Generate different types of questions based on chunk analysis
      const chunkQuestions = await this.generateQuestionsFromChunk(chunk, questionId);
      questions.push(...chunkQuestions);
      questionId += chunkQuestions.length;
    }

    // Ensure we have the right distribution
    const finalQuestions = this.balanceQuestionDifficulty(questions, easyCount, mediumCount, hardCount);
    
    return finalQuestions.slice(0, questionCount);
  }

  private async generateQuestionsFromChunk(
    chunk: {
      content: string;
      keyTerms: string[];
      concepts: string[];
      facts: string[];
      difficulty: 'easy' | 'medium' | 'hard';
    },
    startId: number
  ): Promise<Question[]> {
    const questions: Question[] = [];

    // Generate concept-based questions
    if (chunk.concepts.length > 0) {
      const concept = chunk.concepts[0];
      questions.push({
        id: startId,
        question: `According to the document, what is the main concept related to "${concept}"?`,
        options: [
          this.generateConceptAnswer(concept, chunk.content),
          this.generateDistractor('concept'),
          this.generateDistractor('concept'),
          this.generateDistractor('concept')
        ],
        correctAnswer: 0,
        explanation: `This concept is explained in the document: "${chunk.content.substring(0, 150)}..."`,
        difficulty: chunk.difficulty
      });
    }

    // Generate fact-based questions
    if (chunk.facts.length > 0 && questions.length < 2) {
      const fact = chunk.facts[0];
      questions.push({
        id: startId + questions.length,
        question: `What does the document state about this topic?`,
        options: [
          fact,
          this.generateDistractor('fact'),
          this.generateDistractor('fact'),
          this.generateDistractor('fact')
        ],
        correctAnswer: 0,
        explanation: `This information is directly stated in the document.`,
        difficulty: chunk.difficulty
      });
    }

    // Generate inference questions for harder difficulty
    if (chunk.difficulty === 'hard' && questions.length < 3) {
      questions.push({
        id: startId + questions.length,
        question: `Based on the information provided, what can be inferred?`,
        options: [
          this.generateInferenceAnswer(chunk.content),
          this.generateDistractor('inference'),
          this.generateDistractor('inference'),
          this.generateDistractor('inference')
        ],
        correctAnswer: 0,
        explanation: `This inference can be drawn from the context provided in the document.`,
        difficulty: 'hard'
      });
    }

    return questions;
  }

  private createRAGPrompt(text: string, questionCount: number): string {
    return `
You are an expert educational content creator. Using the RAG (Retrieval-Augmented Generation) approach:

1. RETRIEVE: Analyze the following document and identify key information
2. AUGMENT: Enhance your understanding with educational best practices
3. GENERATE: Create ${questionCount} high-quality multiple choice questions

Document:
${text.substring(0, 4000)}...

Requirements:
- Generate exactly ${questionCount} questions
- Each question should have 4 options (A, B, C, D)
- Include explanations for correct answers
- Mix difficulty levels (40% easy, 40% medium, 20% hard)
- Cover different aspects: facts, concepts, analysis, inference

Format your response as JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text?",
      "options": ["Correct answer", "Wrong 1", "Wrong 2", "Wrong 3"],
      "correctAnswer": 0,
      "explanation": "Why this is correct...",
      "difficulty": "easy"
    }
  ]
}
`;
  }

  private extractKeyTerms(text: string): string[] {
    const words = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    return [...new Set(words)].filter(word => word.length > 3).slice(0, 5);
  }

  private extractConcepts(text: string): string[] {
    // Look for concept indicators
    const conceptPatterns = [
      /\b(concept|principle|theory|method|approach|strategy|technique)\b/gi,
      /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g
    ];
    
    const concepts: string[] = [];
    conceptPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      concepts.push(...matches);
    });
    
    return [...new Set(concepts)].slice(0, 3);
  }

  private extractFacts(text: string): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 30);
    return sentences.filter(sentence => {
      return /\b(is|are|was|were|has|have|contains|shows|indicates|demonstrates)\b/i.test(sentence);
    }).slice(0, 3);
  }

  private assessDifficulty(text: string): 'easy' | 'medium' | 'hard' {
    const complexityIndicators = [
      /\b(however|nevertheless|furthermore|consequently|therefore)\b/gi,
      /\b(analysis|synthesis|evaluation|comparison|contrast)\b/gi,
      /\b(implies|suggests|indicates|demonstrates|establishes)\b/gi
    ];
    
    let complexityScore = 0;
    complexityIndicators.forEach(pattern => {
      const matches = text.match(pattern) || [];
      complexityScore += matches.length;
    });
    
    if (complexityScore >= 3) return 'hard';
    if (complexityScore >= 1) return 'medium';
    return 'easy';
  }

  private generateConceptAnswer(concept: string, context: string): string {
    const sentences = context.split(/[.!?]+/);
    const relevantSentence = sentences.find(s => 
      s.toLowerCase().includes(concept.toLowerCase())
    );
    
    if (relevantSentence) {
      return relevantSentence.trim().substring(0, 100) + (relevantSentence.length > 100 ? '...' : '');
    }
    
    return `A key concept that is central to understanding the document's main theme`;
  }

  private generateInferenceAnswer(context: string): string {
    return `Based on the evidence presented, this represents a logical conclusion from the given information`;
  }

  private generateDistractor(type: 'concept' | 'fact' | 'inference'): string {
    const distractors = {
      concept: [
        "A concept that sounds related but is not mentioned in the document",
        "A general idea that doesn't specifically relate to the content",
        "A misconception that might arise from superficial reading"
      ],
      fact: [
        "A statement that sounds factual but contradicts the document",
        "Information that is partially correct but missing key details",
        "A fact from a different context that doesn't apply here"
      ],
      inference: [
        "A conclusion that goes beyond what the evidence supports",
        "An assumption that isn't backed by the provided information",
        "A logical fallacy that might seem reasonable but is incorrect"
      ]
    };
    
    const options = distractors[type];
    return options[Math.floor(Math.random() * options.length)];
  }

  private balanceQuestionDifficulty(
    questions: Question[],
    easyCount: number,
    mediumCount: number,
    hardCount: number
  ): Question[] {
    const easy = questions.filter(q => q.difficulty === 'easy').slice(0, easyCount);
    const medium = questions.filter(q => q.difficulty === 'medium').slice(0, mediumCount);
    const hard = questions.filter(q => q.difficulty === 'hard').slice(0, hardCount);
    
    return [...easy, ...medium, ...hard];
  }

  // Placeholder methods for actual AI API calls
  private async callOpenAI(prompt: string): Promise<string> {
    // Implementation for OpenAI API
    throw new Error('OpenAI API not implemented - add your API key and implementation');
  }

  private async callAnthropic(prompt: string): Promise<string> {
    // Implementation for Anthropic API
    throw new Error('Anthropic API not implemented - add your API key and implementation');
  }

  private async callGemini(prompt: string): Promise<string> {
    // Implementation for Google Gemini API
    throw new Error('Gemini API not implemented - add your API key and implementation');
  }

  private parseAIResponse(response: string): Question[] {
    try {
      const parsed = JSON.parse(response);
      return parsed.questions || [];
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return [];
    }
  }
}

// Export the generator function for backward compatibility
export async function generateQuestionsWithAI(text: string, questionCount: number = 15): Promise<Question[]> {
  const generator = new AIQuestionGenerator();
  return await generator.generateQuestions(text, questionCount);
}