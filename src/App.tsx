import React, { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import QuestionDisplay from './components/QuestionDisplay';
import Results from './components/Results';
import { generateQuestions } from './utils/questionGenerator';
import { extractTextFromFile } from './utils/textExtractor';
import type { Question, QuizState, QuizSettings } from './types';

function App() {
  const [quizState, setQuizState] = useState<QuizState>('upload');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizSettings, setQuizSettings] = useState<QuizSettings>({
    questionCount: 15,
    mode: 'immediate'
  });

  const handleFileUpload = useCallback(async (file: File, settings: QuizSettings) => {
    setIsProcessing(true);
    setError(null);
    setQuizSettings(settings);
    
    try {
      console.log('📄 Extracting text from file...');
      const text = await extractTextFromFile(file);
      
      if (!text || text.trim().length < 100) {
        throw new Error('Document is too short or could not be processed. Please upload a document with more content.');
      }
      
      console.log(`📊 Document extracted: ${text.length} characters`);
      console.log(`🤖 Starting AI-powered question generation for exactly ${settings.questionCount} questions...`);
      
      const generatedQuestions = await generateQuestions(text, settings.questionCount);
      
      if (generatedQuestions.length === 0) {
        throw new Error('Could not generate questions from this document. Please try a different document with more substantial content.');
      }
      
      // Ensure we have exactly the requested number of questions
      const exactQuestions = generatedQuestions.slice(0, settings.questionCount);
      
      console.log(`✅ Generated exactly ${exactQuestions.length} questions successfully`);
      
      setQuestions(exactQuestions);
      setQuizState('quiz');
      setCurrentQuestionIndex(0);
      setUserAnswers({});
    } catch (err) {
      console.error('❌ Error processing document:', err);
      setError(err instanceof Error ? err.message : 'Failed to process document');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleAnswer = useCallback((answerIndex: number) => {
    const newAnswers = {
      ...userAnswers,
      [currentQuestionIndex]: answerIndex
    };
    setUserAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      const delay = quizSettings.mode === 'immediate' ? 0 : 500;
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, delay);
    } else {
      const delay = quizSettings.mode === 'immediate' ? 0 : 500;
      setTimeout(() => {
        setQuizState('results');
      }, delay);
    }
  }, [currentQuestionIndex, questions.length, userAnswers, quizSettings.mode]);

  const restartQuiz = useCallback(() => {
    setQuizState('upload');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setError(null);
    setQuizSettings({
      questionCount: 15,
      mode: 'immediate'
    });
  }, []);

  // Render different pages based on quiz state
  if (quizState === 'upload') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              AI Question Generator
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-2">
              Upload your document and get AI-powered multiple choice questions using RAG technology
            </p>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              AI-Powered • RAG Technology
            </div>
          </header>

          <main className="max-w-4xl mx-auto">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <FileUpload 
              onFileUpload={handleFileUpload} 
              isProcessing={isProcessing}
            />
          </main>
        </div>
      </div>
    );
  }

  if (quizState === 'quiz' && questions.length > 0) {
    return (
      <QuestionDisplay
        question={questions[currentQuestionIndex]}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        onAnswer={handleAnswer}
        selectedAnswer={userAnswers[currentQuestionIndex]}
        mode={quizSettings.mode}
      />
    );
  }

  if (quizState === 'results') {
    return (
      <Results
        questions={questions}
        userAnswers={userAnswers}
        onRestart={restartQuiz}
      />
    );
  }

  return null;
}

export default App;