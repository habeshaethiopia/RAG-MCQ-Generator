import React from 'react';
import { Trophy, Target, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import type { Question } from '../types';

interface ResultsProps {
  questions: Question[];
  userAnswers: { [key: number]: number };
  onRestart: () => void;
}

const Results: React.FC<ResultsProps> = ({ questions, userAnswers, onRestart }) => {
  const correctAnswers = questions.filter((q, index) => 
    userAnswers[index] === q.correctAnswer
  ).length;
  
  const totalQuestions = questions.length;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  
  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-emerald-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeMessage = (percentage: number) => {
    if (percentage >= 90) return 'Outstanding! 🌟';
    if (percentage >= 80) return 'Great job! 💪';
    if (percentage >= 70) return 'Good work! 👍';
    if (percentage >= 60) return 'Keep practicing! 📚';
    return 'Room for improvement! 💯';
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Results Header */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center border border-gray-100">
        <div className="mb-6">
          <Trophy className={`w-16 h-16 mx-auto mb-4 ${getGradeColor(percentage)}`} />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
          <p className="text-lg text-gray-600">{getGradeMessage(percentage)}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {correctAnswers}/{totalQuestions}
            </div>
            <div className="text-sm text-blue-700">Correct Answers</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className={`text-2xl font-bold mb-1 ${getGradeColor(percentage)}`}>
              {percentage}%
            </div>
            <div className="text-sm text-purple-700">Score</div>
          </div>
          
          <div className="bg-emerald-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-emerald-600 mb-1">
              {totalQuestions}
            </div>
            <div className="text-sm text-emerald-700">Total Questions</div>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105 transition-all duration-200"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Try Another Document
        </button>
      </div>

      {/* Detailed Results */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <Target className="w-6 h-6 mr-2 text-blue-600" />
            Question Review
          </h3>
        </div>

        <div className="p-6 space-y-6">
          {questions.map((question, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            
            return (
              <div key={question.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-start mb-3">
                  <div className="flex-shrink-0 mr-3">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 mb-2">
                      Question {index + 1}: {question.question}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-gray-600 mb-1">Your Answer:</div>
                        <div className={`text-sm p-2 rounded ${
                          isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                        }`}>
                          {question.options[userAnswer] || 'No answer selected'}
                        </div>
                      </div>
                      
                      {!isCorrect && (
                        <div>
                          <div className="text-sm font-medium text-gray-600 mb-1">Correct Answer:</div>
                          <div className="text-sm p-2 rounded bg-emerald-50 text-emerald-800">
                            {question.options[question.correctAnswer]}
                          </div>
                        </div>
                      )}
                    </div>

                    {question.explanation && (
                      <div className="mt-3 p-3 bg-blue-50 rounded text-sm text-blue-800">
                        <strong>Explanation:</strong> {question.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Results;