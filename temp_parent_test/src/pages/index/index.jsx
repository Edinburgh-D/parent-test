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

  return (
    <View className='home-page'>
      {/* 顶部插画区 */}
      <View className='hero-section'>
        <View className='hero-illustration'>
          <Text className='illustration-label'>[水彩插画：妈妈牵着孩子散步]</Text>
        </View>
      </View>

      {/* 标题区 */}
      <View className='title-section'>
        <Text className='main-title'>父母成长等级测试</Text>
        <Text className='sub-title'>了解自己，成为更好的父母 ❤️</Text>
      </View>

      {/* 三列功能卡片 */}
      <View className='features-section'>
        <View className='feature-card'>
          <View className='feature-icon-wrap'>
            <Text className='feature-icon'>📋</Text>
          </View>
          <Text className='feature-title'>科学测评</Text>
          <Text className='feature-desc'>专业量表设计{'\n'}全面评估父母成长状态</Text>
        </View>
        <View className='feature-card'>
          <View className='feature-icon-wrap'>
            <Text className='feature-icon'>📊</Text>
          </View>
          <Text className='feature-title'>精准定位</Text>
          <Text className='feature-desc'>多维度分析：认知、情绪、{'\n'}行为等全面解读</Text>
        </View>
        <View className='feature-card'>
          <View className='feature-icon-wrap'>
            <Text className='feature-icon'>❤️</Text>
          </View>
          <Text className='feature-title'>成长建议</Text>
          <Text className='feature-desc'>个性化成长建议{'\n'}助力成为更好的父母</Text>
        </View>
      </View>

      {/* CTA按钮 */}
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

      {/* 底部装饰 */}
      <View className='bottom-decoration'>
        <Text className='deco-label'>[水彩植物装饰]</Text>
      </View>
    </View>
  )
}
