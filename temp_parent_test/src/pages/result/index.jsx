import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useEffect } from 'react'
import './index.scss'
import resultsMeta from '../../data/results.json'

const dimColors = { A: '#FF8C42', B: '#8FBC8F', C: '#6B8E8B', D: '#9B7EBD' }
const dimNames = { A: '情绪回应', B: '规则锚定', C: '探索追问', D: '行动果断' }

export default function ResultPage() {
  const [screen, setScreen] = useState(0)
  const [profile, setProfile] = useState(null)
  const [scores, setScores] = useState({ A: 0, B: 0, C: 0, D: 0 })
  const [winHeight, setWinHeight] = useState(600)

  useEffect(() => {
    const info = Taro.getSystemInfoSync()
    setWinHeight(info.windowHeight - 80)

    const instance = Taro.getCurrentInstance()
    const params = instance?.router?.params || {}
    const parsed = {}
    ;['A','B','C','D'].forEach(k => {
      parsed[k] = parseInt(params[k] || '0', 10)
    })
    setScores(parsed)

    const key = params.key || getResultKey(parsed)
    const found = resultsMeta.profiles[key]
    if (found) {
      setProfile({
        title: found.title,
        subtitle: found.subtitle,
        features: found.description,
        risk: found.risk,
        suggestion: found.suggestion,
        course: found.course?.replace('推荐：《', '')?.replace('》', '') || '',
        color: dimColors[key?.split('+')?.[0]] || '#D4A574'
      })
    }
  }, [])

  const getResultKey = (finalScores) => {
    const entries = Object.entries(finalScores)
    const values = entries.map(([_, v]) => v)
    const maxVal = Math.max(...values)
    const minVal = Math.min(...values)
    if (maxVal - minVal <= 2) return 'balanced'
    const maxKeys = entries.filter(([_, v]) => v === maxVal).map(([k]) => k).sort()
    return maxKeys.join('+') || 'balanced'
  }

  const handleNext = () => {
    if (screen < 2) setScreen(screen + 1)
  }

  const handlePoster = () => {
    Taro.navigateTo({ url: '/pages/poster/index' })
  }

  const handleRetest = () => {
    Taro.redirectTo({ url: '/pages/index/index' })
  }

  const handleCourse = () => {
    Taro.navigateTo({ url: '/pages/courses/index' })
  }

  if (!profile) return null
  const maxScore = Math.max(...Object.values(scores))

  return (
    <View className='result-page'>
      {/* 分页指示器 */}
      <View className='pagination'>
        {[0, 1, 2].map(i => (
          <View key={i} className={`dot ${screen === i ? 'active' : ''}`} />
        ))}
      </View>

      {screen === 0 && (
        <View className='screen screen-1'>
          <View className='nav-bar'>
            <View className='nav-back' onClick={() => Taro.navigateBack()}>
              <Text className='back-icon'>←</Text>
            </View>
            <Text className='nav-title'>父母成长测试</Text>
            <View className='nav-placeholder' />
          </View>

          <View className='hero-illustration'>
            <Text className='illus-label'>[水彩插画：妈妈拥抱孩子在花园]</Text>
          </View>

          <View className='result-badge'>
            <Text className='badge-text'>测试结果</Text>
          </View>

          <Text className='profile-name' style={{ color: profile.color }}>
            {profile.title}
          </Text>

          <Text className='golden-quote'>"{profile.subtitle}"</Text>

          <View className='next-btn' onClick={handleNext}>
            <Text className='next-text'>查看详细分析 ↓</Text>
          </View>
        </View>
      )}

      {screen === 1 && (
        <ScrollView className='screen screen-2' scrollY style={{ height: `${winHeight}px` }}>
          <Text className='section-title'>📊 你的四维度分布</Text>

          <View className='dimension-list'>
            {Object.entries(scores).map(([key, val]) => (
              <View key={key} className='dimension-row'>
                <Text className='dim-label'>{dimNames[key]}</Text>
                <View className='dim-bar-wrap'>
                  <View
                    className='dim-bar'
                    style={{
                      width: `${maxScore > 0 ? (val / maxScore) * 100 : 0}%`,
                      backgroundColor: dimColors[key]
                    }}
                  />
                </View>
                <Text className='dim-count'>{val}次</Text>
              </View>
            ))}
          </View>

          <View className='radar-placeholder'>
            <Text className='radar-label'>[雷达图占位]</Text>
          </View>

          <View className='divider' />

          <Text className='section-title'>核心特征</Text>
          <Text className='desc-text'>{profile.features}</Text>

          <View className='risk-block'>
            <Text className='risk-label'>潜在风险</Text>
            <Text className='risk-text'>{profile.risk}</Text>
          </View>

          <View className='suggestion-block'>
            <Text className='suggestion-label'>成长建议</Text>
            <Text className='suggestion-text'>{profile.suggestion}</Text>
          </View>

          <View className='next-btn' onClick={handleNext}>
            <Text className='next-text'>下一步行动 ↓</Text>
          </View>
        </ScrollView>
      )}

      {screen === 2 && (
        <ScrollView className='screen screen-3' scrollY style={{ height: `${winHeight}px` }}>
          <Text className='section-title'>📚 专属课程推荐</Text>

          <View className='course-card'>
            <View className='course-cover'>
              <Text className='cover-label'>[课程封面]</Text>
            </View>
            <Text className='course-title'>{profile.course}</Text>
            <View className='course-tag' style={{ backgroundColor: profile.color }}>
              <Text className='tag-text'>适合{profile.title}型父母</Text>
            </View>
            <Text className='stars'>★★★★★ 15分钟</Text>
            <View className='try-btn' onClick={handleCourse}>
              <Text className='try-text'>免费试看</Text>
            </View>
          </View>

          <View className='action-buttons'>
            <View className='action-btn primary' onClick={handlePoster}>
              <Text className='btn-txt'>生成我的育儿海报</Text>
            </View>
            <View className='action-btn secondary' onClick={handleRetest}>
              <Text className='btn-txt'>邀请伴侣一起测试</Text>
            </View>
            <Text className='retest-link' onClick={handleRetest}>重新测试</Text>
          </View>

          <View className='hook-section'>
            <Text className='hook-title'>💡 添加到我的小程序</Text>
            <Text className='hook-desc'>孩子闹的时候快速查建议</Text>
          </View>
        </ScrollView>
      )}
    </View>
  )
}
