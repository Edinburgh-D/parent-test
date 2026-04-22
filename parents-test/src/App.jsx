import { useState } from 'react';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import Courses from './pages/Courses';
import './styles/index.css';

export default function App() {
  const [step, setStep] = useState('home'); // home | quiz | result | courses
  const [answers, setAnswers] = useState([]);

  const start = () => {
    setAnswers([]);
    setStep('quiz');
  };

  const finish = (ans) => {
    setAnswers(ans);
    setStep('result');
  };

  const restart = () => {
    setAnswers([]);
    setStep('home');
  };

  return (
    <div className="app">
      {step === 'home' && <Home onStart={start} />}
      {step === 'quiz' && <Quiz onFinish={finish} />}
      {step === 'result' && (
        <Result answers={answers} onRestart={restart} onGoCourses={() => setStep('courses')} />
      )}
      {step === 'courses' && <Courses onBack={() => setStep('result')} />}
    </div>
  );
}
