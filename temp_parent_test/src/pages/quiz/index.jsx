import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { useState } from 'react'
import './index.scss'
import allQuestions from '../../data/questions.json'
import resultsMeta from '../../data/results.json'

const optionColors = { A: '#FF8C42', B: '#8FBC8F', C: '#6B8E8B', D: '#9B7EBD' }

function getQuestionsForAge(ageGroup) {
  const ageMap = {
    '备孕/怀孕中': '0-3',
    '0-3岁': '0-3',
    '4-6岁': '4-6',
    '7-12岁': '7-12',
    '13-18岁': '13-18',
    '多个年龄段': null
  }
  const target = ageMap[ageGroup]
  if (!target) return allQuestions.filter(q => q.age_group === '0-3').slice(0, 7)
    .concat(allQuestions.filter(q => q.age_group === '4-6').slice(0, 7))
    .concat(allQuestions.filter(q => q.age_group === '7-12').slice(0, 7))
    .concat(allQuestions.filter(q => q.age_group === '13-18').slice(0, 7))
  return allQuestions.filter(q => q.age_group === target).slice(0, 28)
}

export default function QuizPage() {
  const [current, setCurrent] = useState(0)
  const [scores, setScores] = useState({ A: 0, B: 0, C: 0, D: 0 })
  const [selected, setSelected] = useState('')
  const [animating, setAnimating] = useState(false)

  const instance = Taro.getCurrentInstance()
  const params = instance?.router?.params || {}
  const ageGroup = params.age || '0-3岁'

  const questions = getQuestionsForAge(ageGroup)
  const total = questions.length || 28
  const q = questions[current] || questions[0]
  const progress = total > 0 ? ((current + 1) / total) * 100 : 0

  const handleSelect = (option) => {
    if (animating) return
    setSelected(option.type)
    setAnimating(true)
    Taro.vibrateShort({ type: 'light' })

    setTimeout(() => {
      setScores(prev => {
        const next = {
          ...prev,
          [option.type]: prev[option.type] + 1
        }

        if (current + 1 >= total) {
          const resultKey = getResultKey(next)
          const profile = resultsMeta.profiles[resultKey]
          const record = {
            date: new Date().toISOString().slice(0, 10),
            scores: next,
            profile: profile?.title || resultKey,
            ageGroup: ageGroup,
            count: total
          }
          try {
            const existing = Taro.getStorageSync('quiz_records') || []
            Taro.setStorageSync('quiz_records', [record, ...existing])
          } catch (e) {
            console.error('save record failed', e)
          }

          const resultParams = Object.entries(next)
            .map(([k, v]) => `${k}=${v}`)
            .join('&') + `&key=${encodeURIComponent(resultKey)}`
          Taro.navigateTo({ url: `/pages/result/index?${resultParams}` })
        } else {
          setCurrent(prev => prev + 1)
          setSelected('')
          setAnimating(false)
        }

        return next
      })
    }, 400)
  }

  const getResultKey = (finalScores) => {
    const entries = Object.entries(finalScores)
    const values = entries.map(([_, v]) => v)
    const maxVal = Math.max(...values)
    const minVal = Math.min(...values)
    if (maxVal - minVal <= 2) return 'balanced'
    const maxKeys = entries.filter(([_, v]) => v === maxVal).map(([k]) => k).sort()
    return maxKeys.join('+') || 'balanced'
  }

  if (!q) {
    return (
      <View className='quiz-page'>
        <Text style={{ textAlign: 'center', marginTop: '200px' }}>题目加载中...</Text>
      </View>
    )
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
          <Text className='scene-text'>{q.question}</Text>
        </View>
        <View className='scene-divider' />

        {/* 选项 */}
        <View className='options-section'>
          {q.options.map((opt) => (
            <View
              key={opt.type}
              className={`option-row ${selected === opt.type ? 'selected' : ''}`}
              onClick={() => handleSelect(opt)}
            >
              <View className='option-label' style={{ backgroundColor: optionColors[opt.type] }}>
                <Text className='label-text'>{opt.type}</Text>
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
