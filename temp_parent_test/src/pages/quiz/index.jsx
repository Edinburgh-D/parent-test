import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { useState, useEffect } from 'react'
import './index.scss'

const questions = [
  {
    id: 1,
    scene: '凌晨2点，孩子突然哭闹着说"我害怕，睡不着"，你会......',
    options: [
      { label: 'A', text: '立刻过去安抚，抱抱他，陪他入睡', type: 'A', color: '#FF8C42' },
      { label: 'B', text: '问清原因，告诉他"有妈妈在，不怕"', type: 'B', color: '#8FBC8F' },
      { label: 'C', text: '让他自己躺着，告诉他要勇敢', type: 'C', color: '#6B8E8B' },
      { label: 'D', text: '有点不耐烦，觉得他又在找关注', type: 'D', color: '#9B7EBD' }
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
      {/* 顶部导航 */}
      <View className='nav-bar'>
        <View className='nav-back' onClick={() => Taro.navigateBack()}>
          <Text className='back-icon'>←</Text>
        </View>
        <Text className='nav-title'>父母成长测试</Text>
        <View className='nav-placeholder' />
      </View>

      {/* 进度区 */}
      <View className='progress-section'>
        <View className='progress-track'>
          <View className='progress-fill' style={{ width: `${progress}%` }} />
        </View>
        <Text className='progress-text'>第 {current + 1} 题 / 共 {total} 题</Text>
      </View>

      {/* 右侧插画 */}
      <View className='side-illustration'>
        <Text className='side-illus-label'>[水彩插画：妈妈和孩子在床上]</Text>
      </View>

      {/* 场景卡片 */}
      <View className='scene-card'>
        <View className='scene-header'>
          <View className='q-badge'>
            <Text className='q-text'>Q.</Text>
          </View>
          <Text className='scene-text'>{q.scene}</Text>
        </View>
        <View className='scene-divider' />

        {/* 选项 */}
        <View className='options-section'>
          {q.options.map((opt) => (
            <View
              key={opt.label}
              className={`option-row ${selected === opt.label ? 'selected' : ''}`}
              onClick={() => handleSelect(opt)}
            >
              <View className='option-label' style={{ backgroundColor: opt.color }}>
                <Text className='label-text'>{opt.label}</Text>
              </View>
              <Text className='option-text'>{opt.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 底部提示 */}
      <View className='footer-hint'>
        <Text className='hint-heart'>❤️</Text>
        <Text className='hint-text'> 选你第一反应，没有标准答案 </Text>
        <Text className='hint-heart'>❤️</Text>
      </View>

      {/* 底部装饰 */}
      <View className='bottom-deco'>
        <Text className='deco-label'>[水彩花卉装饰]</Text>
      </View>
    </View>
  )
}
