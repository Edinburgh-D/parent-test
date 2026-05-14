import Taro from '@tarojs/taro'
import { View, Text, Switch } from '@tarojs/components'
import { useState } from 'react'
import './index.scss'

export default function JourneyPage() {
  const [remind, setRemind] = useState(false)

  const actions = [
    { num: '1', title: '查看详细报告', desc: '回顾你的四维度分析' },
    { num: '2', title: '生成分享海报', desc: '保存到相册发朋友圈' },
    { num: '3', title: '邀请伴侣测试', desc: '看看你们的育儿风格有多不同' },
    { num: '4', title: '获取成长课程', desc: '针对你的画像专属推荐' }
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
      <View className='header'>
        <Text className='header-title'>🎉 测试完成！</Text>
        <Text className='header-sub'>你已经了解了自己的育儿风格，接下来可以...</Text>
      </View>

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
            <Text className='action-arrow'>→</Text>
          </View>
        ))}
      </View>

      <View className='divider' />

      <View className='tips-section'>
        <Text className='tips-title'>💡 本周小贴士</Text>
        <Text className='tips-content'>
          温室园丁型父母本周最容易踩的坑：过度共情导致规则模糊
        </Text>
      </View>

      <View className='remind-section'>
        <Text className='remind-text'>3天后提醒我继续学习</Text>
        <Switch
          className='remind-switch'
          checked={remind}
          onChange={() => setRemind(!remind)}
          color='#8FBC8F'
        />
      </View>
    </View>
  )
}
