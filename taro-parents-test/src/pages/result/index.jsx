import Taro from '@tarojs/taro';
import { View, Text, Image, Button } from '@tarojs/components';
import { useState } from 'react';
import resultsData from '../../data/results.json';
import './index.scss';

const DIMENSIONS = {
  A: { name: '情绪回应', color: '#FF8C42' },
  B: { name: '规则锚定', color: '#4A90E2' },
  C: { name: '探索追问', color: '#7ED321' },
  D: { name: '行动果断', color: '#9013FE' }
};

export default function ResultPage() {
  const [screen, setScreen] = useState(1);
  const counts = Taro.getStorageSync('quizCounts') || { A: 0, B: 0, C: 0, D: 0 };
  const resultKey = Taro.getStorageSync('quizResultKey') || 'A';
  const profile = resultsData.profiles[resultKey] || resultsData.profiles['A'];

  const handleShare = () => {
    Taro.redirectTo({ url: '/pages/poster/index' });
  };

  const handleRestart = () => {
    Taro.redirectTo({ url: '/pages/index/index' });
  };

  const handleCourses = () => {
    Taro.redirectTo({ url: '/pages/courses/index' });
  };

  const handleJourney = () => {
    Taro.redirectTo({ url: '/pages/journey/index' });
  };

  const maxCount = Math.max(counts.A, counts.B, counts.C, counts.D, 1);

  return (
    <View className="result-page">
      {/* 第一屏：首屏冲击 */}
      {screen === 1 && (
        <View className="screen screen-1">
          <View className="hero-section">
            <Image
              className="hero-illustration"
              src={`https://cdn.example.com/profiles/${resultKey}.png`}
              mode="aspectFit"
            />
          </View>
          <Text className="result-label">测试结果</Text>
          <Text className="profile-name">{profile.title}</Text>
          <Text className="profile-quote">"{profile.subtitle}"</Text>
          <View className="scroll-hint" onClick={() => setScreen(2)}>
            <Text className="scroll-text">查看详细分析 ↓</Text>
          </View>
        </View>
      )}

      {/* 第二屏：四维度解析 */}
      {screen === 2 && (
        <View className="screen screen-2">
          <Text className="section-title">📊 你的四维度分布</Text>

          <View className="scores-section">
            {['A', 'B', 'C', 'D'].map(dim => (
              <View className="score-bar" key={dim}>
                <Text className="score-label">
                  {dim} {DIMENSIONS[dim].name}
                </Text>
                <View className="score-track">
                  <View
                    className="score-fill"
                    style={{
                      width: `${(counts[dim] / maxCount) * 100}%`,
                      backgroundColor: DIMENSIONS[dim].color
                    }}
                  />
                </View>
                <Text className="score-value">{counts[dim]}次</Text>
              </View>
            ))}
          </View>

          <View className="content-section">
            <View className="content-block">
              <Text className="content-label">核心特征</Text>
              <Text className="content-text">{profile.description}</Text>
            </View>

            <View className="content-block">
              <Text className="content-label risk">潜在风险</Text>
              <Text className="content-text">{profile.risk}</Text>
            </View>

            <View className="content-block">
              <Text className="content-label">成长建议</Text>
              <Text className="content-text">{profile.suggestion}</Text>
            </View>
          </View>

          <View className="scroll-hint" onClick={() => setScreen(3)}>
            <Text className="scroll-text">查看行动建议 ↓</Text>
          </View>
        </View>
      )}

      {/* 第三屏：行动引导 */}
      {screen === 3 && (
        <View className="screen screen-3">
          <View className="course-card">
            <Text className="course-title">📚 专属课程推荐</Text>
            <Text className="course-name">{profile.course}</Text>
            <View className="course-btn" onClick={handleCourses}>
              <Text className="course-btn-text">免费试看</Text>
            </View>
          </View>

          <View className="action-buttons">
            <View className="btn-primary" onClick={handleShare}>
              <Text className="btn-text">生成我的育儿海报</Text>
            </View>
            <View className="btn-secondary" onClick={handleRestart}>
              <Text className="btn-text">重新测试</Text>
            </View>
            <View className="btn-text-link" onClick={handleJourney}>
              <Text className="btn-text">进入心路历程</Text>
            </View>
          </View>
        </View>
      )}

      {/* 分页指示器 */}
      <View className="pagination">
        {[1, 2, 3].map(i => (
          <View
            key={i}
            className={`dot ${screen === i ? 'active' : ''}`}
            onClick={() => setScreen(i)}
          />
        ))}
      </View>
    </View>
  );
}
