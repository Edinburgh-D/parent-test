import { useState } from 'react';
import questions from '../data/questions.json';

export default function Quiz({ onFinish }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);

  const current = questions[index];
  const progress = Math.round(((index) / questions.length) * 100);

  const handleSelect = (type) => {
    const next = [...answers, type];
    if (index + 1 < questions.length) {
      setAnswers(next);
      setIndex(index + 1);
    } else {
      onFinish(next);
    }
  };

  return (
    <div className="page quiz">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="card">
        <div className="question-num">问题 {index + 1} / {questions.length}</div>
        <h2>{current.question}</h2>
        <div className="options">
          {current.options.map((opt, i) => (
            <button
              key={i}
              className="option-btn"
              onClick={() => handleSelect(opt.type)}
            >
              {opt.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
