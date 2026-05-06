import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

export default function Index() {
  const handleStart = () => {
    Taro.navigateTo({ url: '/pages/quiz/index' });
  };

  return (
    <View className="home">
      <View className="home-icon">👨‍👩‍👧</View>
      <Text className="home-title">父母成长等级测试</Text>
      <Text className="home-subtitle">25道题，测出你的育儿风格与成长方向</Text>

      <View className="home-features">
        <View className="home-feature-item">
          <View className="home-feature-icon purple">📊</View>
          <Text>科学测评，精准定位育儿风格</Text>
        </View>
        <View className="home-feature-item">
          <View className="home-feature-icon green">📋</View>
          <Text>即时报告，专属成长建议</Text>
        </View>
        <View className="home-feature-item">
          <View className="home-feature-icon orange">🎯</View>
          <Text>课程推荐，助力父母成长</Text>
        </View>
      </View>

      <View className="home-stats">
        <View className="home-stat">
          <Text className="home-stat-num">10</Text>
          <Text className="home-stat-label">道精选题</Text>
        </View>
        <View className="home-stat">
          <Text className="home-stat-num">3</Text>
          <Text className="home-stat-label">种父母类型</Text>
        </View>
        <View className="home-stat">
          <Text className="home-stat-num">4</Text>
          <Text className="home-stat-label">门推荐课程</Text>
        </View>
      </View>

      <Button className="btn-primary" onClick={handleStart}>开始测试</Button>
    </View>
  );
}
