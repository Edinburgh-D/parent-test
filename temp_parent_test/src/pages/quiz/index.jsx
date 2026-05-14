import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { useState, useEffect } from 'react'
import './index.scss'

// 简化版题库，实际从JSON加载
const questions = [
  {
    id: 1,
    scene: '凌晨2点，2岁半的儿子突然从婴儿床坐起来大哭...你已经连续三周没睡过整觉...',
    options: [
      { label: 'A', text: '立刻抱起他，轻声安抚直到他平静', type: 'A' },
      { label: 'B', text: '先观察一下，如果继续哭再进去', type: 'B' },
      { label: 'C', text: '问他怎么了，鼓励他描述感受', type: 'C' },
      { label: 'D', text: '给他水喝，告诉他天亮了再玩', type: 'D' }
    ]
  }
]

export default function QuizPage() {
  const [current, setCurrent] = useState(0)
  const [scores, setScores] = useState({ A: 0, B: 0, C: 0, D: 0 })
  const [selected, setSelected] = useState('')
  const [animating, setAnimating] = useState(false)

  const q = questions[current] || questions[0]
  const total = 28
  const progress = ((current + 1) / total) * 100

  const handleSelect = (option) => {
    if (animating) return
    setSelected(option.label)
    setAnimating(true)
    Taro.vibrateShort({ type: 'light' })

    setTimeout(() => {
      setScores(prev => ({
        ...prev,
        [option.type]: prev[option.type] + 1
      }))

      if (current + 1 >= total) {
        const resultParams = Object.entries({
          ...scores,
          [option.type]: scores[option.type] + 1
        }).map(([k, v]) => `${k}=${v}`).join('&')
        Taro.navigateTo({ url: `/pages/result/index?${resultParams}` })
      } else {
        setCurrent(prev => prev + 1)
        setSelected('')
        setAnimating(false)
      }
    }, 400)
  }

  return (
    <View className='quiz-page'>
      <View className='nav-bar'>
        <View className='nav-back' onClick={() => Taro.navigateBack()}>
          <Text className='back-icon'>←</Text>
        </View>
        <Text className='nav-title'>父母成长测试</Text>
        <View className='nav-placeholder' />
      </View>

      <View className='progress-section'>
        <View className='progress-track'>
          <View className='progress-fill' style={{ width: `${progress}%` }} />
        </View>
        <Text className='progress-text'>第 {current + 1} 题 / 共 {total} 题</Text>
      </View>

      <View className='scene-card'>
        <Text className='scene-text'>{q.scene}</Text>
      </View>

      <View className='options-section'>
        {q.options.map((opt) => (
          <View
            key={opt.label}
            className={`option-row ${selected === opt.label ? 'selected' : ''}`}
            onClick={() => handleSelect(opt)}
          >
            <View className='option-label'>
              <Text className='label-text'>{opt.label}</Text>
            </View>
            <Text className='option-text'>{opt.text}</Text>
          </View>
        ))}
      </View>

      <View className='footer-hint'>
        <Text className='hint-text'>选你第一反应，没有标准答案</Text>
      </View>
    </View>
  )
}
