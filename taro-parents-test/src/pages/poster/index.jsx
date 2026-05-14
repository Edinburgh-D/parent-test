import Taro from '@tarojs/taro';
import { View, Text, Button } from '@tarojs/components';
import { useState } from 'react';
import './index.scss';

const SHARE_TEMPLATES = [
  '测完发现我是「{profile}」型父母，你呢？',
  '原来我带娃的方式叫「{profile}」，终于有名字了',
  '这道题我选了A，老公选了D——测完才发现我俩差这么多',
];

export default function PosterPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const counts = Taro.getStorageSync('quizCounts') || { A: 0, B: 0, C: 0, D: 0 };
  const resultKey = Taro.getStorageSync('quizResultKey') || 'A';
  const profileName = Taro.getStorageSync('quizProfileName') || '温室园丁';

  const handleSave = () => {
    Taro.showToast({ title: '已保存到相册', icon: 'success' });
  };

  const handleShare = () => {
    Taro.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    });
  };

  return (
    <View className="poster-page">
      {/* 海报预览 */}
      <View className="poster-preview">
        <View className="poster-card">
          <Text className="poster-brand">父母成长等级测试</Text>
          <Text className="poster-title">{profileName}</Text>
          <Text className="poster-quote">
            "你治愈的不是一个问题，是一个人"
          </Text>

          <View className="poster-dims">
            <View className="dim-box dim-a">A {counts.A}</View>
            <View className="dim-box dim-b">B {counts.B}</View>
            <View className="dim-box dim-c">C {counts.C}</View>
            <View className="dim-box dim-d">D {counts.D}</View>
          </View>

          <View className="poster-qrcode">
            <Text className="qrcode-text">扫码测测你的育儿风格</Text>
          </View>
        </View>
      </View>

      {/* 操作按钮 */}
      <View className="action-section">
        <Button className="btn-save" onClick={handleSave}>
          <Text className="btn-text">保存到相册</Text>
        </Button>
        <Button className="btn-share" onClick={handleShare}>
          <Text className="btn-text">分享给朋友</Text>
        </Button>
      </View>

      {/* 文案模板 */}
      <View className="templates-section">
        {SHARE_TEMPLATES.map((tpl, i) => (
          <View
            key={i}
            className={`template-btn ${selectedTemplate === i ? 'active' : ''}`}
            onClick={() => setSelectedTemplate(i)}
          >
            <Text className="template-text">
              {tpl.replace('{profile}', profileName)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
