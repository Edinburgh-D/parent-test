import { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import questions from '../../data/questions.json';
import './index.css';

export default function Quiz() {
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
      const counts = next.reduce((acc, cur) => {
        acc[cur] = (acc[cur] || 0) + 1;
        return acc;
      }, {});
      const resultType = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      Taro.setStorageSync('quizAnswers', next);
      Taro.setStorageSync('quizResultType', resultType);
      Taro.redirectTo({ url: '/pages/result/index' });
    }
  };

  const handleClose = () => {
    Taro.showModal({
      title: '确认退出',
      content: '退出后进度将丢失，是否确认？',
      success: (res) => {
        if (res.confirm) {
          Taro.redirectTo({ url: '/pages/index/index' });
        }
      }
    });
  };

  return (
    <View className="page quiz">
      <View className="quiz-header">
        <Text className="quiz-header-title">父母成长测试</Text>
        <Button className="quiz-header-close" onClick={handleClose}>×</Button>
      </View>

      <View className="progress-bar">
        <View className="progress-fill" style={{ width: `${progress}%` }}></View>
      </View>

      <View className="question-card">
        <Text className="question-num">问题 {index + 1} / {questions.length}</Text>
        <Text className="question-text">{current.question}</Text>
        <View className="options">
          {current.options.map((opt, i) => (
            <Button
              key={i}
              className="option-btn"
              onClick={() => handleSelect(opt.type)}
            >
              <Text className="option-index">{String.fromCharCode(65 + i)}</Text>
              <Text className="option-text">{opt.text}</Text>
            </Button>
          ))}
        </View>
      </View>
    </View>
  );
}
