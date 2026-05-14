import Taro from '@tarojs/taro';
import { View, Text, Progress } from '@tarojs/components';
import { useState, useEffect } from 'react';
import questionsData from '../../data/questions.json';
import './index.scss';

export default function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [counts, setCounts] = useState({ A: 0, B: 0, C: 0, D: 0 });

  useEffect(() => {
    // 根据用户信息加载对应题库
    const userInfo = Taro.getStorageSync('userInfo') || {};
    let qs = questionsData;
    
    if (userInfo.childAgeGroup && !userInfo.isSkipped) {
      qs = questionsData.filter(q => q.age_group === userInfo.childAgeGroup);
    }
    
    // 随机打乱顺序
    qs = shuffleArray(qs);
    setQuestions(qs);
  }, []);

  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const handleSelect = (type) => {
    const nextAnswers = [...answers, type];
    const nextCounts = { ...counts };
    nextCounts[type]++;

    if (index + 1 < questions.length) {
      setAnswers(nextAnswers);
      setCounts(nextCounts);
      setIndex(index + 1);
    } else {
      // 答题完成，计算画像
      const resultKey = calculateProfile(nextCounts);
      Taro.setStorageSync('quizCounts', nextCounts);
      Taro.setStorageSync('quizResultKey', resultKey);
      Taro.setStorageSync('quizAnswers', nextAnswers);
      Taro.setStorageSync('quizQuestions', questions.map(q => q.id));
      Taro.redirectTo({ url: '/pages/result/index' });
    }
  };

  function calculateProfile(counts) {
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const maxVal = sorted[0][1];
    const closeOnes = sorted.filter(([k, v]) => maxVal - v <= 2);

    if (closeOnes.length === 1) {
      return closeOnes[0][0];  // "A"
    } else if (closeOnes.length === 2) {
      return closeOnes.map(([k]) => k).sort().join('+');  // "A+B"
    } else if (closeOnes.length === 3) {
      return closeOnes.map(([k]) => k).sort().join('+');  // "A+B+C"
    } else {
      const vals = sorted.map(([k, v]) => v);
      const isBalanced = vals.every(v => v === vals[0]);
      return isBalanced ? "A+B+C+D" : "balanced";
    }
  }

  const handleBack = () => {
    Taro.redirectTo({ url: '/pages/info/index' });
  };

  const currentQuestion = questions[index];
  const progress = questions.length > 0 ? ((index + 1) / questions.length) * 100 : 0;

  if (!currentQuestion) {
    return (
      <View className="quiz-page">
        <Text className="loading-text">正在准备题目...</Text>
      </View>
    );
  }

  return (
    <View className="quiz-page">
      {/* 导航栏 */}
      <View className="nav-bar">
        <Text className="back-btn" onClick={handleBack}>←</Text>
        <Text className="nav-title">父母成长测试</Text>
        <View className="nav-placeholder" />
      </View>

      {/* 进度条 */}
      <View className="progress-section">
        <Progress
          percent={progress}
          strokeWidth={4}
          activeColor="#FF8C42"
          backgroundColor="#E5E5E5"
        />
        <Text className="progress-text">
          第 {index + 1} 题 / 共 {questions.length} 题
        </Text>
      </View>

      {/* 场景描述 */}
      <View className="scene-card">
        <Text className="scene-text">{currentQuestion.question}</Text>
      </View>

      {/* 选项 */}
      <View className="options-section">
        {currentQuestion.options.map((opt, i) => (
          <View
            key={i}
            className="option-btn"
            onClick={() => handleSelect(opt.type)}
          >
            <View className="option-tag">{opt.type}</View>
            <Text className="option-text">{opt.text}</Text>
          </View>
        ))}
      </View>

      {/* 底部提示 */}
      <View className="hint-section">
        <Text className="hint-text">选你第一反应，没有标准答案</Text>
      </View>
    </View>
  );
}
