
import React, { useState } from 'react';
import { Assignment, QuizQuestion } from '../types';
import { Brain, CheckCircle2, XCircle, ChevronRight, RotateCcw, Sparkles, Loader2 } from 'lucide-react';
import { generateQuiz } from '../services/geminiService';

interface QuizViewProps {
  assignment: Assignment;
}

const QuizView: React.FC<QuizViewProps> = ({ assignment }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(-1); // -1 means start screen
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const startQuiz = async () => {
    setLoading(true);
    try {
      const q = await generateQuiz(assignment.title + "\n" + assignment.description);
      setQuestions(q);
      setCurrentIdx(0);
      setScore(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setShowAnswer(false);
    } else {
      setCurrentIdx(questions.length); // Result screen
    }
  };

  const handleSelect = (idx: number) => {
    if (showAnswer) return;
    setSelectedOption(idx);
    setShowAnswer(true);
    if (idx === questions[currentIdx].correctAnswer) {
      setScore(score + 1);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center space-y-4">
        <Loader2 size={48} className="animate-spin text-blue-600" />
        <p className="text-slate-600 font-bold">Kala is curating questions for you...</p>
      </div>
    );
  }

  // Result Screen
  if (currentIdx >= questions.length && questions.length > 0) {
    const passed = score >= questions.length * 0.7;
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center animate-in zoom-in duration-500">
        <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${passed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
          <CheckCircle2 size={48} />
        </div>
        <h3 className="text-3xl font-black text-slate-900 mb-2">Quiz Complete!</h3>
        <p className="text-slate-500 mb-8 text-lg">
          You scored <span className="text-blue-600 font-black">{score}/{questions.length}</span>.
          {passed ? " You have a solid grasp of the material!" : " A bit more review might help before submission."}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={startQuiz}
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <RotateCcw size={18} />
            Retake Quiz
          </button>
          <button className="flex items-center gap-2 text-slate-600 bg-slate-100 px-8 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-all">
            Share Result
          </button>
        </div>
      </div>
    );
  }

  // Start Screen
  if (currentIdx === -1) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600">
          <Brain size={40} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-900">Mastery Assessment</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
            Test your understanding of the core concepts of this assignment with a 5-question AI-generated quiz.
          </p>
        </div>
        <button
          onClick={startQuiz}
          className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2 mx-auto"
        >
          <Sparkles size={18} />
          Generate Assessment
        </button>
      </div>
    );
  }

  const q = questions[currentIdx];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black">
            Question {currentIdx + 1} of {questions.length}
          </span>
          <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="text-slate-400 font-bold text-sm">
          Score: {score}
        </div>
      </div>

      <h3 className="text-2xl font-bold text-slate-900 mb-8 leading-tight">
        {q.question}
      </h3>

      <div className="space-y-4">
        {q.options.map((opt, i) => {
          let styles = "border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50";
          if (showAnswer) {
            if (i === q.correctAnswer) {
              styles = "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-200/50";
            } else if (selectedOption === i) {
              styles = "border-rose-500 bg-rose-50 text-rose-700";
            } else {
              styles = "border-slate-100 text-slate-300 opacity-60";
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={showAnswer}
              className={`w-full text-left p-5 rounded-2xl border-2 font-medium transition-all flex items-center justify-between ${styles}`}
            >
              <span>{opt}</span>
              {showAnswer && i === q.correctAnswer && <CheckCircle2 size={20} className="text-emerald-500" />}
              {showAnswer && selectedOption === i && i !== q.correctAnswer && <XCircle size={20} className="text-rose-500" />}
            </button>
          );
        })}
      </div>

      {showAnswer && (
        <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 mb-6">
            <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Explanation</p>
            <p className="text-sm text-blue-900 leading-relaxed font-medium">
              {q.explanation}
            </p>
          </div>
          <button
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all"
          >
            {currentIdx === questions.length - 1 ? "Finish Quiz" : "Next Question"}
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizView;
