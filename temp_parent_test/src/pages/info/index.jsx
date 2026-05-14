import Taro from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'
import { useState } from 'react'
import './info.scss'

export default function InfoPage() {
  const [age, setAge] = useState('')
  const [childrenCount, setChildrenCount] = useState('')

  const ageOptions = ['备孕/怀孕中', '0-3岁', '4-6岁', '7-12岁', '13-18岁', '多个年龄段']
  const countOptions = ['还没有', '1个', '2个及以上']

  const handleStart = () => {
    Taro.vibrateShort({ type: 'light' })
    Taro.navigateTo({
      url: `/pages/quiz/index?age=${encodeURIComponent(age)}&count=${encodeURIComponent(childrenCount)}`
    })
  }

  const handleSkip = () => {
    Taro.navigateTo({ url: '/pages/quiz/index' })
  }

  return (
    <View className='info-page'>
      <View className='header'>
        <Text className='header-title'>先简单了解你一下</Text>
        <Text className='header-sub'>2个问题，30秒</Text>
      </View>

      <View className='question-card card-1'>
        <View className='question-header'>
          <View className='question-num'>①</View>
          <Text className='question-text'>你的孩子多大了？</Text>
        </View>
        <View className='options-wrap'>
          {ageOptions.map((opt) => (
            <View
              key={opt}
              className={`pill-btn ${age === opt ? 'active' : ''}`}
              onClick={() => setAge(opt)}
            >
              <Text className='pill-text'>{opt}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className='question-card card-2'>
        <View className='question-header'>
          <View className='question-num'>②</View>
          <Text className='question-text'>你有几个孩子？</Text>
        </View>
        <View className='options-wrap'>
          {countOptions.map((opt) => (
            <View
              key={opt}
              className={`pill-btn ${childrenCount === opt ? 'active' : ''}`}
              onClick={() => setChildrenCount(opt)}
            >
              <Text className='pill-text'>{opt}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className='action-section'>
        <Button className='start-btn' onClick={handleStart}>
          <Text className='btn-text'>开始测试</Text>
        </Button>
        <Text className='skip-link' onClick={handleSkip}>暂不填写，直接开始</Text>
      </View>
    </View>
  )
}
