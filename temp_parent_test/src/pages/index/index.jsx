import Taro from '@tarojs/taro'
import { View, Text, Image, Button } from '@tarojs/components'
import { useState } from 'react'
import './index.scss'

export default function IndexPage() {
  const [pressed, setPressed] = useState(false)

  const handleStart = () => {
    Taro.vibrateShort({ type: 'light' })
    Taro.navigateTo({ url: '/pages/info/index' })
  }

  const handleBrowse = () => {
    Taro.navigateTo({ url: '/pages/courses/index' })
  }

  const features = [
    { icon: '📊', title: '科学测评', desc: '4维度解析你的育儿风格' },
    { icon: '🎯', title: '16种画像', desc: '千人千面，不是贴标签' },
    { icon: '📚', title: '专属建议', desc: '基于你的风格给出成长方向' }
  ]

  return (
    <View className='home-page'>
      <View className='hero-section'>
        <View className='illustration-placeholder'>
          <Text className='illustration-label'>[水彩插画：父母牵手孩子]</Text>
        </View>
      </View>

      <View className='title-section'>
        <Text className='main-title'>父母成长等级测试</Text>
        <Text className='sub-title'>28道场景题，看懂你的育儿方式</Text>
      </View>

      <View className='features-section'>
        {features.map((item, idx) => (
          <View key={idx} className='feature-card'>
            <View className='feature-icon-wrap'>
              <Text className='feature-icon'>{item.icon}</Text>
            </View>
            <View className='feature-text'>
              <Text className='feature-title'>{item.title}</Text>
              <Text className='feature-desc'>{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className='divider' />

      <View className='social-proof'>
        <Text className='proof-text'>已有 12,847 位家长完成测试</Text>
      </View>

      <View className='action-section'>
        <Button
          className={`start-btn ${pressed ? 'pressed' : ''}`}
          onClick={handleStart}
          onTouchStart={() => setPressed(true)}
          onTouchEnd={() => setPressed(false)}
        >
          <Text className='btn-text'>开始测试</Text>
        </Button>
        <Text className='browse-link' onClick={handleBrowse}>暂不测试，随便逛逛</Text>
      </View>
    </View>
  )
}
