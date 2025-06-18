# 🤝 Contributing to RAG MCQ Generator

Thank you for your interest in contributing to the RAG-powered MCQ Generator! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Development Standards](#development-standards)

## Code of Conduct

This project adheres to a code of conduct that we expect all contributors to follow:

- **Be respectful** and inclusive in all interactions
- **Be collaborative** and help others learn and grow
- **Be constructive** when providing feedback
- **Be patient** with newcomers and those learning

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Git for version control
- Basic knowledge of React, TypeScript, and modern web development

### Development Setup

1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/yourusername/rag-mcq-generator.git
   cd rag-mcq-generator
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Run Tests**
   ```bash
   npm run test
   npm run lint
   ```

## Contributing Guidelines

### Types of Contributions

We welcome various types of contributions:

- 🐛 **Bug fixes**
- ✨ **New features**
- 📚 **Documentation improvements**
- 🎨 **UI/UX enhancements**
- ⚡ **Performance optimizations**
- 🧪 **Test coverage improvements**
- 🔧 **Tooling and infrastructure**

### Before You Start

1. **Check existing issues** to avoid duplicate work
2. **Create an issue** for major changes to discuss the approach
3. **Fork the repository** and create a feature branch
4. **Follow coding standards** outlined in this document

## Pull Request Process

### 1. Create a Feature Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style and patterns
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run all tests
npm run test

# Run linting
npm run lint

# Build the project
npm run build

# Test the build locally
npm run preview
```

### 4. Commit Your Changes

Use conventional commit messages:

```bash
# Feature
git commit -m "feat: add support for DOCX file processing"

# Bug fix
git commit -m "fix: resolve PDF extraction memory leak"

# Documentation
git commit -m "docs: update API documentation for question generation"

# Refactor
git commit -m "refactor: improve question generation algorithm performance"
```

### 5. Push and Create Pull Request

```bash
# Push your branch
git push origin feature/your-feature-name

# Create pull request on GitHub
```

### Pull Request Template

When creating a pull request, please include:

```markdown
## Description
Brief description of changes made

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

## Issue Reporting

### Bug Reports

When reporting bugs, please include:

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- OS: [e.g., Windows 10, macOS 12.0]
- Browser: [e.g., Chrome 96, Firefox 95]
- Node.js version: [e.g., 18.0.0]

## Additional Context
Any other relevant information
```

### Feature Requests

For feature requests, please include:

```markdown
## Feature Description
Clear description of the proposed feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should this feature work?

## Alternatives Considered
Other approaches you've considered

## Additional Context
Any other relevant information
```

## Development Standards

### Code Style

#### TypeScript/JavaScript

```typescript
// Use descriptive variable names
const questionGenerationSettings = { count: 15, difficulty: 'medium' };

// Use proper typing
interface QuestionGeneratorConfig {
  documentText: string;
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Use async/await for promises
async function generateQuestions(config: QuestionGeneratorConfig): Promise<Question[]> {
  try {
    const questions = await aiGenerator.generate(config);
    return questions;
  } catch (error) {
    console.error('Question generation failed:', error);
    throw error;
  }
}
```

#### React Components

```typescript
// Use functional components with hooks
const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ 
  question, 
  onAnswer, 
  ...props 
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  
  const handleAnswerSelect = useCallback((answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    onAnswer(answerIndex);
  }, [onAnswer]);

  return (
    <div className="question-container">
      {/* Component JSX */}
    </div>
  );
};

// Export with proper typing
export default QuestionDisplay;
```

#### CSS/Tailwind

```css
/* Use semantic class names */
.question-container {
  @apply bg-white rounded-lg shadow-md p-6;
}

/* Use consistent spacing */
.question-title {
  @apply text-xl font-semibold mb-4;
}

/* Use responsive design */
.answer-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}
```

### File Organization

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components
│   ├── forms/          # Form-related components
│   └── quiz/           # Quiz-specific components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
│   ├── ai/            # AI-related utilities
│   ├── file/          # File processing utilities
│   └── validation/    # Validation utilities
├── types/              # TypeScript type definitions
├── constants/          # Application constants
└── styles/            # Global styles and themes
```

### Testing Standards

#### Unit Tests

```typescript
// Component testing
import { render, screen, fireEvent } from '@testing-library/react';
import QuestionDisplay from './QuestionDisplay';

describe('QuestionDisplay', () => {
  const mockQuestion = {
    id: 1,
    question: 'Test question?',
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 0
  };

  it('renders question correctly', () => {
    render(<QuestionDisplay question={mockQuestion} onAnswer={jest.fn()} />);
    expect(screen.getByText('Test question?')).toBeInTheDocument();
  });

  it('handles answer selection', () => {
    const onAnswer = jest.fn();
    render(<QuestionDisplay question={mockQuestion} onAnswer={onAnswer} />);
    
    fireEvent.click(screen.getByText('A'));
    expect(onAnswer).toHaveBeenCalledWith(0);
  });
});
```

#### Integration Tests

```typescript
// End-to-end workflow testing
describe('Question Generation Workflow', () => {
  it('generates questions from uploaded document', async () => {
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const questions = await generateQuestions(await file.text(), 5);
    
    expect(questions).toHaveLength(5);
    expect(questions[0]).toHaveProperty('question');
    expect(questions[0]).toHaveProperty('options');
    expect(questions[0]).toHaveProperty('correctAnswer');
  });
});
```

### Documentation Standards

#### Code Comments

```typescript
/**
 * Generates multiple-choice questions using RAG technology
 * 
 * @param text - Source document text content
 * @param questionCount - Number of questions to generate (5-30)
 * @param difficulty - Question difficulty level
 * @returns Promise resolving to array of generated questions
 * 
 * @example
 * ```typescript
 * const questions = await generateQuestions(documentText, 15, 'medium');
 * console.log(`Generated ${questions.length} questions`);
 * ```
 */
async function generateQuestions(
  text: string, 
  questionCount: number, 
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<Question[]> {
  // Implementation
}
```

#### README Updates

When adding new features, update relevant documentation:

- API documentation for new functions
- Usage examples for new components
- Configuration options for new settings
- Troubleshooting guides for common issues

## Performance Guidelines

### Code Performance

```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Expensive rendering */}</div>;
});

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return performExpensiveCalculation(data);
}, [data]);

// Use useCallback for event handlers
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);
```

### Bundle Size

- Keep bundle size under 1MB
- Use dynamic imports for large dependencies
- Optimize images and assets
- Remove unused dependencies

### Memory Management

```typescript
// Clean up event listeners
useEffect(() => {
  const handleResize = () => {/* handler */};
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

// Clean up file readers
useEffect(() => {
  const reader = new FileReader();
  
  return () => {
    reader.abort();
  };
}, []);
```

## Security Guidelines

### Input Validation

```typescript
// Validate file uploads
const validateFile = (file: File): string | null => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['text/plain', 'application/pdf'];
  
  if (file.size > maxSize) {
    return 'File too large';
  }
  
  if (!allowedTypes.includes(file.type)) {
    return 'Invalid file type';
  }
  
  return null;
};

// Sanitize user input
const sanitizeText = (text: string): string => {
  return text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};
```

### Data Privacy

- Process files client-side only
- Don't store user data unnecessarily
- Use secure communication protocols
- Implement proper error handling

## Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Version number bumped
- [ ] Changelog updated
- [ ] Build artifacts generated
- [ ] Deployment tested

## Getting Help

### Resources

- **Documentation**: Check the `/docs` folder
- **Issues**: Search existing GitHub issues
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Request reviews from maintainers

### Contact

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: [maintainer-email@example.com] for security issues

## Recognition

Contributors will be recognized in:

- **README.md**: Contributors section
- **CHANGELOG.md**: Release notes
- **GitHub**: Contributor graphs and statistics

Thank you for contributing to the RAG MCQ Generator! 🎉