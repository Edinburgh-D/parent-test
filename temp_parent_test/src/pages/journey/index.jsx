import Taro from '@tarojs/taro'
import { View, Text, Switch } from '@tarojs/components'
import { useState } from 'react'
import './index.scss'

export default function JourneyPage() {
  const [remind, setRemind] = useState(false)

  const actions = [
    { num: '1', title: '查看详细报告', desc: '深入了解你的育儿风格与特点', icon: '📋' },
    { num: '2', title: '生成分享海报', desc: '分享你的育儿风格到朋友圈', icon: '💌' },
    { num: '3', title: '邀请伴侣测试', desc: '一起了解，成为更默契的父母', icon: '☕' },
    { num: '4', title: '获取成长课程', desc: '精选课程，助力科学育儿', icon: '📚' }
  ]

  const handleAction = (idx) => {
    const urls = [
      '/pages/result/index',
      '/pages/poster/index',
      '/pages/index/index',
      '/pages/courses/index'
    ]
    if (urls[idx]) Taro.navigateTo({ url: urls[idx] })
  }

  return (
    <View className='journey-page'>
      {/* 顶部标题区 */}
      <View className='header-section'>
        <View className='header-text'>
          <Text className='header-title'>测试完成！</Text>
          <Text className='header-sub'>你已经了解了自己的育儿风格，{'\n'}接下来可以...</Text>
        </View>
        <View className='header-illustration'>
          <Text className='illus-label'>[水彩插画：妈妈拥抱孩子]</Text>
        </View>
      </View>

      {/* 行动卡片 */}
      <View className='actions-list'>
        {actions.map((item, idx) => (
          <View key={idx} className='action-card' onClick={() => handleAction(idx)}>
            <View className='action-num'>
              <Text className='num-text'>{item.num}</Text>
            </View>
            <View className='action-text'>
              <Text className='action-title'>{item.title}</Text>
              <Text className='action-desc'>{item.desc}</Text>
            </View>
            <View className='action-icon'>
              <Text className='icon-text'>{item.icon}</Text>
            </View>
            <Text className='action-arrow'>›</Text>
          </View>
        ))}
      </View>

      {/* 本周小贴士 */}
      <View className='tips-section'>
        <View className='tips-header'>
          <Text className='tips-icon'>🌿</Text>
          <Text className='tips-title'>本周小贴士</Text>
        </View>
        <Text className='tips-content'>
          孩子的情绪需要被看见、被接纳。{'\n'}耐心的回应，是给孩子最好的安全感。
        </Text>
        <View className='tips-illustration'>
          <Text className='tips-illus-label'>[水彩插画：浇水壶+盆栽]</Text>
        </View>
      </View>

      {/* 提醒开关 */}
      <View className='remind-section'>
        <View className='remind-left'>
          <Text className='remind-icon'>🔔</Text>
          <Text className='remind-text'>3天后提醒我继续学习</Text>
        </View>
        <Switch
          className='remind-switch'
          checked={remind}
          onChange={() => setRemind(!remind)}
          color='#8FBC8F'
        />
      </View>

      {/* 底部装饰 */}
      <View className='bottom-deco'>
        <Text className='deco-label'>[水彩花卉装饰]</Text>
      </View>
    </View>
  )
}
