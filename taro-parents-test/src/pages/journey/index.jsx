import Taro from '@tarojs/taro';
import { View, Text, Switch } from '@tarojs/components';
import { useState } from 'react';
import './index.scss';

const ACTIONS = [
  {
    id: 1,
    title: '查看详细报告',
    desc: '回顾你的四维度分析',
    target: '/pages/result/index',
  },
  {
    id: 2,
    title: '生成分享海报',
    desc: '保存到相册发朋友圈',
    target: '/pages/poster/index',
  },
  {
    id: 3,
    title: '邀请伴侣测试',
    desc: '看看你们的育儿风格有多不同',
    target: '/pages/index/index',
  },
  {
    id: 4,
    title: '获取成长课程',
    desc: '针对你的画像专属推荐',
    target: '/pages/courses/index',
  },
];

const TIPS = {
  'A': '本周最易踩坑：孩子一哭就妥协，规则形同虚设',
  'B': '本周最易踩坑：目标导向太紧，孩子感受不到过程的快乐',
  'C': '本周最易踩坑：追问太多，孩子觉得"妈妈永远在分析我"',
  'D': '本周最易踩坑：行动太快，错过了让孩子自己站起来的机会',
};

export default function JourneyPage() {
  const [reminder, setReminder] = useState(false);
  const resultKey = Taro.getStorageSync('quizResultKey') || 'A';
  const mainDim = resultKey.split('+')[0];
  const tip = TIPS[mainDim] || TIPS['A'];

  const handleNavigate = (target) => {
    Taro.redirectTo({ url: target });
  };

  return (
    <View className="journey-page">
      <View className="header">
        <Text className="title">🎉 测试完成！</Text>
        <Text className="subtitle">
          你已经了解了自己的育儿风格，接下来可以...
        </Text>
      </View>

      {/* 行动卡片 */}
      <View className="actions-section">
        {ACTIONS.map((action) => (
          <View
            key={action.id}
            className="action-card"
            onClick={() => handleNavigate(action.target)}
          >
            <View className="action-badge">{action.id}</View>
            <View className="action-content">
              <Text className="action-title">{action.title}</Text>
              <Text className="action-desc">{action.desc}</Text>
            </View>
            <Text className="action-arrow">→</Text>
          </View>
        ))}
      </View>

      {/* 小贴士 */}
      <View className="tip-section">
        <Text className="tip-label">💡 本周小贴士</Text>
        <Text className="tip-text">{tip}</Text>
      </View>

      {/* 提醒开关 */}
      <View className="reminder-section">
        <Text className="reminder-text">3天后提醒我继续学习</Text>
        <Switch
          checked={reminder}
          onChange={(e) => setReminder(e.detail.value)}
          color="#8FBC8F"
        />
      </View>
    </View>
  );
}
