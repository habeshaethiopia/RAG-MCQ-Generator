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
    
    console.log(`🤖 Generating exactly ${questionCount} questions with Local AI simulation...`);
    
    // Step 1: Document Chunking (RAG Retrieval phase)
    const chunks = this.chunkDocument(text);
    console.log(`📄 Document split into ${chunks.length} chunks`);
    
    // Step 2: Semantic Analysis (RAG Understanding phase)
    const analyzedChunks = this.analyzeChunks(chunks);
    console.log('🔍 Chunks analyzed for semantic content');
    
    // Step 3: Question Generation (RAG Generation phase)
    const questions = await this.generateFromChunks(analyzedChunks, questionCount);
    console.log(`✅ Generated exactly ${questions.length} AI-powered questions`);
    
    return questions;
  }

  private chunkDocument(text: string): string[] {
    // Split document into meaningful chunks (RAG retrieval strategy)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const chunks: string[] = [];
    
    // Create overlapping chunks of 3-5 sentences
    for (let i = 0; i < sentences.length; i += 2) {
      const chunk = sentences.slice(i, i + 4).join('. ').trim();
      if (chunk.length > 50) {
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

    // Calculate how many questions to generate from each chunk
    const questionsPerChunk = Math.max(1, Math.floor(questionCount / Math.min(analyzedChunks.length, questionCount)));
    const remainingQuestions = questionCount - (questionsPerChunk * Math.min(analyzedChunks.length, questionCount));

    // Generate questions from each chunk
    let totalGenerated = 0;
    for (let i = 0; i < analyzedChunks.length && totalGenerated < questionCount; i++) {
      const chunk = analyzedChunks[i];
      const questionsToGenerate = questionsPerChunk + (i < remainingQuestions ? 1 : 0);
      
      const chunkQuestions = await this.generateQuestionsFromChunk(chunk, questionId, questionsToGenerate);
      questions.push(...chunkQuestions.slice(0, Math.min(questionsToGenerate, questionCount - totalGenerated)));
      
      questionId += chunkQuestions.length;
      totalGenerated += chunkQuestions.length;
    }

    // If we still need more questions, generate additional ones from random chunks
    while (questions.length < questionCount && analyzedChunks.length > 0) {
      const randomChunk = analyzedChunks[Math.floor(Math.random() * analyzedChunks.length)];
      const additionalQuestions = await this.generateQuestionsFromChunk(randomChunk, questionId, 1);
      
      if (additionalQuestions.length > 0) {
        questions.push(additionalQuestions[0]);
        questionId++;
      } else {
        break; // Prevent infinite loop
      }
    }

    // Ensure we return exactly the requested number of questions
    const finalQuestions = questions.slice(0, questionCount);
    
    // If we somehow have fewer questions, pad with generic ones
    while (finalQuestions.length < questionCount) {
      finalQuestions.push({
        id: finalQuestions.length + 1,
        question: `Based on the document content, what is a key point mentioned?`,
        options: [
          'The document provides valuable information on the topic',
          'The document contains no relevant information',
          'The document is entirely fictional',
          'The document contradicts itself throughout'
        ],
        correctAnswer: 0,
        explanation: 'This represents the general informative nature of the document.',
        difficulty: 'easy'
      });
    }

    return finalQuestions;
  }

  private async generateQuestionsFromChunk(
    chunk: {
      content: string;
      keyTerms: string[];
      concepts: string[];
      facts: string[];
      difficulty: 'easy' | 'medium' | 'hard';
    },
    startId: number,
    maxQuestions: number = 3
  ): Promise<Question[]> {
    const questions: Question[] = [];

    // Generate concept-based questions
    if (chunk.concepts.length > 0 && questions.length < maxQuestions) {
      const concept = chunk.concepts[0];
      questions.push({
        id: startId + questions.length,
        question: `According to the document, what is mentioned about "${concept}"?`,
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
    if (chunk.facts.length > 0 && questions.length < maxQuestions) {
      const fact = chunk.facts[0];
      questions.push({
        id: startId + questions.length,
        question: `What does the document state about this topic?`,
        options: [
          fact.length > 80 ? fact.substring(0, 80) + '...' : fact,
          this.generateDistractor('fact'),
          this.generateDistractor('fact'),
          this.generateDistractor('fact')
        ],
        correctAnswer: 0,
        explanation: `This information is directly stated in the document.`,
        difficulty: chunk.difficulty
      });
    }

    // Generate key term questions
    if (chunk.keyTerms.length > 0 && questions.length < maxQuestions) {
      const keyTerm = chunk.keyTerms[0];
      questions.push({
        id: startId + questions.length,
        question: `In the context of the document, what is significant about "${keyTerm}"?`,
        options: [
          `It is an important term mentioned in the document`,
          `It is not mentioned in the document`,
          `It contradicts the main theme`,
          `It is only briefly referenced`
        ],
        correctAnswer: 0,
        explanation: `"${keyTerm}" is identified as a key term in the document content.`,
        difficulty: chunk.difficulty
      });
    }

    // Generate inference questions for harder difficulty
    if (chunk.difficulty === 'hard' && questions.length < maxQuestions) {
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

    // If we still need more questions, generate generic ones
    while (questions.length < maxQuestions) {
      questions.push({
        id: startId + questions.length,
        question: `What information is presented in this section of the document?`,
        options: [
          chunk.content.length > 100 ? chunk.content.substring(0, 100) + '...' : chunk.content,
          'Information not found in the document',
          'Contradictory information',
          'Unrelated content'
        ],
        correctAnswer: 0,
        explanation: 'This information is directly presented in the document.',
        difficulty: chunk.difficulty
      });
    }

    return questions;
  }

  private createRAGPrompt(text: string, questionCount: number): string {
    return `
You are an expert educational content creator. Using the RAG (Retrieval-Augmented Generation) approach:

1. RETRIEVE: Analyze the following document and identify key information
2. AUGMENT: Enhance your understanding with educational best practices
3. GENERATE: Create EXACTLY ${questionCount} high-quality multiple choice questions

Document:
${text.substring(0, 4000)}...

Requirements:
- Generate EXACTLY ${questionCount} questions, no more, no less
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
        "A misconception that might arise from superficial reading",
        "An unrelated concept from a different field"
      ],
      fact: [
        "A statement that sounds factual but contradicts the document",
        "Information that is partially correct but missing key details",
        "A fact from a different context that doesn't apply here",
        "A common misconception about the topic"
      ],
      inference: [
        "A conclusion that goes beyond what the evidence supports",
        "An assumption that isn't backed by the provided information",
        "A logical fallacy that might seem reasonable but is incorrect",
        "An overgeneralization not supported by the text"
      ]
    };
    
    const options = distractors[type];
    return options[Math.floor(Math.random() * options.length)];
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