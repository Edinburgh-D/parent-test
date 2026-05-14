import Taro from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'
import { useState } from 'react'
import './index.scss'

export default function InfoPage() {
  const [age, setAge] = useState('')
  const [childrenCount, setChildrenCount] = useState('')

  const ageOptions = ['备孕/怀孕中', '0-3岁', '4-6岁', '7-12岁', '13-18岁', '多个年龄段']
  const countOptions = ['还没有', '1个', '2个及以上']

  const handleNext = () => {
    Taro.vibrateShort({ type: 'light' })
    Taro.navigateTo({
      url: `/pages/quiz/index?age=${encodeURIComponent(age)}&count=${encodeURIComponent(childrenCount)}`
    })
  }

  return (
    <View className='info-page'>
      {/* 顶部标题区 */}
      <View className='header-section'>
        <View className='header-text'>
          <Text className='header-title'>先简单了解你一下</Text>
          <Text className='header-sub'>让我们更好地为你和孩子{'\n'}提供合适的内容 ❤️</Text>
        </View>
        <View className='header-illustration'>
          <Text className='illus-label'>[水彩插画：妈妈拥抱孩子]</Text>
        </View>
      </View>

      {/* 问题1 */}
      <View className='question-block'>
        <View className='question-header'>
          <View className='dot-marker' />
          <Text className='question-text'>你的年龄是？</Text>
        </View>
        <Text className='question-desc'>我们会根据你的年龄推荐更合适的内容</Text>
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

      {/* 问题2 */}
      <View className='question-block'>
        <View className='question-header'>
          <View className='dot-marker' />
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

      {/* 底部装饰 */}
      <View className='bottom-deco'>
        <Text className='deco-label'>[水彩装饰：小熊+书+植物]</Text>
      </View>

      {/* CTA按钮 */}
      <View className='action-section'>
        <Button className='next-btn' onClick={handleNext}>
          <Text className='btn-text'>下一步</Text>
        </Button>
      </View>
    </View>
  )
}
