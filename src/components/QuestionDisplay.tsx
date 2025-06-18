import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, BarChart3, Brain, Zap } from 'lucide-react';
import type { Question } from '../types';

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answerIndex: number) => void;
  selectedAnswer?: number;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  selectedAnswer
}) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const progress = (questionNumber / totalQuestions) * 100;

  useEffect(() => {
    setShowFeedback(false);
  }, [question.id]);

  const handleAnswerClick = (answerIndex: number) => {
    if (selectedAnswer !== undefined) return;
    
    setShowFeedback(true);
    setTimeout(() => {
      onAnswer(answerIndex);
    }, 1500);
  };

  const getDifficultyIcon = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return <Zap className="w-4 h-4 text-green-500" />;
      case 'medium':
        return <BarChart3 className="w-4 h-4 text-yellow-500" />;
      case 'hard':
        return <Brain className="w-4 h-4 text-red-500" />;
      default:
        return <BarChart3 className="w-4 h-4 text-blue-500" />;
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'hard':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Question {questionNumber} of {totalQuestions}
          </span>
          <div className="flex items-center space-x-2">
            {question.difficulty && (
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(question.difficulty)}`}>
                {getDifficultyIcon(question.difficulty)}
                <span className="ml-1 capitalize">{question.difficulty}</span>
              </div>
            )}
            <span className="text-sm font-medium text-gray-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* AI Badge */}
      <div className="mb-4 text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200">
          <Brain className="w-3 h-3 mr-1" />
          AI-Generated Question
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border border-gray-100">
        <div className="flex items-start mb-6">
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">
            {questionNumber}
          </div>
          <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
            {question.question}
          </h2>
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === question.correctAnswer;
            const showResult = showFeedback;
            
            let buttonClass = "w-full p-4 text-left border-2 rounded-lg transition-all duration-200 transform ";
            
            if (!showResult) {
              buttonClass += "border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500";
            } else {
              if (isCorrect) {
                buttonClass += "border-emerald-300 bg-emerald-50 text-emerald-800";
              } else if (isSelected && !isCorrect) {
                buttonClass += "border-red-300 bg-red-50 text-red-800";
              } else {
                buttonClass += "border-gray-200 bg-gray-50 text-gray-500";
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerClick(index)}
                disabled={showResult}
                className={buttonClass}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-6 h-6 border-2 border-current rounded-full flex items-center justify-center mr-3">
                    {showResult && isCorrect && (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    )}
                    {!showResult && (
                      <span className="text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                    )}
                  </div>
                  <span className="font-medium">{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {showFeedback && question.explanation && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <Brain className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 mb-1">AI Explanation</h4>
                <p className="text-blue-700 text-sm">{question.explanation}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timer/Status */}
      <div className="text-center text-gray-500">
        <div className="inline-flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          <span className="text-sm">AI-powered questions based on your document content</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionDisplay;