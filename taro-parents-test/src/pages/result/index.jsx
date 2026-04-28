import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import results from '../../data/results.json';
import './index.scss';

export default function Result() {
  const answers = Taro.getStorageSync('quizAnswers') || [];
  const resultType = Taro.getStorageSync('quizResultType') || 'empathy';

  const counts = answers.reduce((acc, cur) => {
    acc[cur] = (acc[cur] || 0) + 1;
    return acc;
  }, { control: 0, empathy: 0, freedom: 0 });

  const data = results[resultType];

  const handleShare = () => {
    Taro.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  };

  const handleRestart = () => {
    Taro.redirectTo({ url: '/pages/index/index' });
  };

  const handleGoCourses = () => {
    Taro.navigateTo({ url: '/pages/courses/index' });
  };

  const maxCount = Math.max(counts.control, counts.empathy, counts.freedom) || 1;

  return (
    <View className="result">
      <View className="result-top">
        <Text className="result-badge">测试结果</Text>
        <Text className="result-type">{data.title}</Text>
        <Text className="result-subtitle">{data.subtitle}</Text>
      </View>

      <View className="result-card">
        <Text className="result-section-title">📊 风格分布</Text>
        <View className="score-bars">
          <View className="score-bar-item">
            <Text className="score-bar-label">控制型</Text>
            <View className="score-bar-track">
              <View className="score-bar-fill control" style={{ width: `${(counts.control / maxCount) * 100}%` }}></View>
            </View>
            <Text className="score-bar-value">{counts.control}</Text>
          </View>
          <View className="score-bar-item">
            <Text className="score-bar-label">共情型</Text>
            <View className="score-bar-track">
              <View className="score-bar-fill empathy" style={{ width: `${(counts.empathy / maxCount) * 100}%` }}></View>
            </View>
            <Text className="score-bar-value">{counts.empathy}</Text>
          </View>
          <View className="score-bar-item">
            <Text className="score-bar-label">放养型</Text>
            <View className="score-bar-track">
              <View className="score-bar-fill freedom" style={{ width: `${(counts.freedom / maxCount) * 100}%` }}></View>
            </View>
            <Text className="score-bar-value">{counts.freedom}</Text>
          </View>
        </View>
      </View>

      <View className="result-card">
        <Text className="result-section-title">📝 分析报告</Text>
        <Text className="result-desc">{data.description}</Text>
      </View>

      <View className="result-tip">
        <Text className="result-tip-title">💡 成长建议</Text>
        <Text className="result-tip-text">{data.suggestion}</Text>
      </View>

      <View className="result-course">
        <Text className="result-course-title">📚 专属推荐</Text>
        <Text className="result-course-text">{data.course}</Text>
      </View>

      <View className="result-actions">
        <Button className="btn-primary" onClick={handleGoCourses}>查看课程</Button>
        <Button className="btn-secondary" openType="share" onClick={handleShare}>分享给朋友</Button>
        <Button className="btn-ghost" onClick={handleRestart}>再测一次</Button>
      </View>
    </View>
  );
}
