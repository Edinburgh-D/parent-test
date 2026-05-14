import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useEffect } from 'react'
import './index.scss'

const resultsData = {
  '温室园丁': {
    title: '温室园丁',
    subtitle: '你治愈的不是一个问题，是一个人',
    features: '你优先处理情绪再处理事情。孩子在你这里学到"我的感受是被接纳的"。',
    risk: '规则弹性过大，孩子可能分不清"被接纳"和"可以为所欲为"。',
    suggestion: '在情绪接纳后，主动补一句"但这件事我们还是要聊聊"。',
    course: '温柔而坚定',
    color: '#D4A574'
  }
}

export default function ResultPage() {
  const [screen, setScreen] = useState(0)
  const [profile, setProfile] = useState(null)
  const [scores, setScores] = useState({ A: 8, B: 6, C: 5, D: 5 })

  useEffect(() => {
    const instance = Taro.getCurrentInstance()
    const params = instance?.router?.params || {}
    const parsed = {}
    ;['A','B','C','D'].forEach(k => {
      parsed[k] = parseInt(params[k] || scores[k], 10)
    })
    setScores(parsed)

    const maxKey = Object.entries(parsed).reduce((a, b) => a[1] > b[1] ? a : b)[0]
    const profileMap = {
      A: '温室园丁', B: '规则建筑师', C: '探索引路人', D: '行动指挥官'
    }
    setProfile(resultsData[profileMap[maxKey]] || resultsData['温室园丁'])
  }, [])

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
      <View className='pagination'>
        {[0, 1, 2].map(i => (
          <View key={i} className={`dot ${screen === i ? 'active' : ''}`} />
        ))}
      </View>

      {screen === 0 && (
        <View className='screen screen-1'>
          <View className='hero-illustration'>
            <Text className='illus-label'>[水彩插画：父母拥抱孩子]</Text>
          </View>
          <Text className='result-label'>测试结果</Text>
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
        <ScrollView className='screen screen-2' scrollY>
          <Text className='section-title'>📊 你的四维度分布</Text>
          <View className='dimension-list'>
            {Object.entries(scores).map(([key, val]) => (
              <View key={key} className='dimension-row'>
                <Text className='dim-label'>
                  {key === 'A' ? '情绪回应' : key === 'B' ? '规则锚定' : key === 'C' ? '探索追问' : '行动果断'}
                </Text>
                <View className='dim-bar-wrap'>
                  <View
                    className='dim-bar'
                    style={{
                      width: `${(val / maxScore) * 100}%`,
                      backgroundColor: key === 'A' ? '#FF8C42' : key === 'B' ? '#6B8E8B' : key === 'C' ? '#8FBC8F' : '#9B7EBD'
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
        <ScrollView className='screen screen-3' scrollY>
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
