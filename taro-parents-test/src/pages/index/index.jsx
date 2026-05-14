import Taro from '@tarojs/taro';
import { View, Text, Image, Button } from '@tarojs/components';
import './index.scss';

export default function Index() {
  const handleStart = () => {
    Taro.redirectTo({ url: '/pages/info/index' });
  };

  const handleSkip = () => {
    Taro.redirectTo({ url: '/pages/quiz/index' });
  };

  const handleHistory = () => {
    Taro.redirectTo({ url: '/pages/history/index' });
  };

  return (
    <View className="index-page">
      {/* 顶部插画 */}
      <View className="hero-section">
        <Image
          className="hero-illustration"
          src="https://cdn.example.com/parent-guide/hero-watercolor.png"
          mode="aspectFit"
        />
      </View>

      {/* 品牌标题 */}
      <View className="brand-section">
        <Text className="brand-title">父母成长等级测试</Text>
        <Text className="brand-subtitle">
          28道场景题，看懂你的育儿方式
        </Text>
      </View>

      {/* 卖点卡片 */}
      <View className="features-section">
        <View className="feature-card">
          <View className="feature-icon icon-science" />
          <View className="feature-content">
            <Text className="feature-title">科学测评</Text>
            <Text className="feature-desc">4维度解析你的育儿风格</Text>
          </View>
        </View>

        <View className="feature-card">
          <View className="feature-icon icon-profile" />
          <View className="feature-content">
            <Text className="feature-title">16种画像</Text>
            <Text className="feature-desc">千人千面，不是贴标签</Text>
          </View>
        </View>

        <View className="feature-card">
          <View className="feature-icon icon-suggest" />
          <View className="feature-content">
            <Text className="feature-title">专属建议</Text>
            <Text className="feature-desc">基于你的风格给出成长方向</Text>
          </View>
        </View>
      </View>

      {/* 社交证明 */}
      <View className="social-proof">
        <Text className="social-text">已有 12,847 位家长完成测试</Text>
      </View>

      {/* CTA 按钮 */}
      <View className="cta-section">
        <Button className="btn-primary" onClick={handleStart}>
          <Text className="btn-text">开始测试</Text>
        </Button>
        <Text className="btn-skip" onClick={handleSkip}>
          暂不测试，随便逛逛
        </Text>
      </View>

      {/* 底部历史记录入口 */}
      <View className="bottom-section">
        <Text className="history-link" onClick={handleHistory}>
          查看历史记录
        </Text>
      </View>
    </View>
  );
}
