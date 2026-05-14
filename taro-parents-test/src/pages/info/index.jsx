import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { useState } from 'react';
import './index.scss';

const AGE_OPTIONS = [
  { label: '备孕/怀孕中', value: 'preparing' },
  { label: '0-3岁', value: '0-3' },
  { label: '4-6岁', value: '4-6' },
  { label: '7-12岁', value: '7-12' },
  { label: '13-18岁', value: '13-18' },
  { label: '多个年龄段', value: 'mixed' },
];

const COUNT_OPTIONS = [
  { label: '还没有', value: 0 },
  { label: '1个', value: 1 },
  { label: '2个及以上', value: 2 },
];

export default function InfoPage() {
  const [age, setAge] = useState(null);
  const [count, setCount] = useState(null);

  const handleAgeSelect = (value) => {
    setAge(value);
  };

  const handleCountSelect = (value) => {
    setCount(value);
  };

  const handleStart = () => {
    const userInfo = {
      childAgeGroup: age,
      childCount: count,
      isSkipped: false,
      timestamp: Date.now(),
    };
    Taro.setStorageSync('userInfo', userInfo);
    Taro.redirectTo({ url: '/pages/quiz/index' });
  };

  const handleSkip = () => {
    const userInfo = {
      childAgeGroup: null,
      childCount: null,
      isSkipped: true,
      timestamp: Date.now(),
    };
    Taro.setStorageSync('userInfo', userInfo);
    Taro.redirectTo({ url: '/pages/quiz/index' });
  };

  const canStart = age !== null && count !== null;

  return (
    <View className="info-page">
      <View className="header">
        <Text className="title">先简单了解你一下</Text>
        <Text className="subtitle">2个问题，30秒</Text>
      </View>

      {/* 问题1：孩子年龄 */}
      <View className="question-card">
        <View className="question-header">
          <View className="question-badge">①</View>
          <Text className="question-text">你的孩子多大了？</Text>
        </View>
        <View className="options-row">
          {AGE_OPTIONS.map((opt) => (
            <View
              key={opt.value}
              className={`capsule-btn ${age === opt.value ? 'active' : ''}`}
              onClick={() => handleAgeSelect(opt.value)}
            >
              <Text className="capsule-text">{opt.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 问题2：孩子数量 */}
      <View className="question-card">
        <View className="question-header">
          <View className="question-badge">②</View>
          <Text className="question-text">你有几个孩子？</Text>
        </View>
        <View className="options-row">
          {COUNT_OPTIONS.map((opt) => (
            <View
              key={opt.value}
              className={`capsule-btn ${count === opt.value ? 'active' : ''}`}
              onClick={() => handleCountSelect(opt.value)}
            >
              <Text className="capsule-text">{opt.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 操作按钮 */}
      <View className="action-section">
        <View
          className={`btn-start ${canStart ? 'enabled' : 'disabled'}`}
          onClick={canStart ? handleStart : undefined}
        >
          <Text className="btn-text">开始测试</Text>
        </View>
        <Text className="btn-skip" onClick={handleSkip}>
          暂不填写，直接开始
        </Text>
      </View>
    </View>
  );
}
