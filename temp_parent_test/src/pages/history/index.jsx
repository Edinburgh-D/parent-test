import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useEffect } from 'react'
import './index.scss'

const mockRecords = [
  {
    date: '2025-05-13',
    profile: '温室园丁',
    scores: { A: 8, B: 6, C: 5, D: 5 },
    ageGroup: '0-3岁题库',
    count: 7
  },
  {
    date: '2025-04-28',
    profile: '牧羊人',
    scores: { A: 7, B: 6, C: 4, D: 6 },
    ageGroup: '全部题库',
    count: 28
  }
]

export default function HistoryPage() {
  const [records, setRecords] = useState([])

  useEffect(() => {
    try {
      const stored = Taro.getStorageSync('quiz_records')
      if (stored && stored.length > 0) {
        setRecords(stored)
      } else {
        setRecords(mockRecords)
      }
    } catch {
      setRecords(mockRecords)
    }
  }, [])

  const handleViewDetail = (record) => {
    const params = Object.entries(record.scores)
      .map(([k, v]) => `${k}=${v}`)
      .join('&')
    Taro.navigateTo({ url: `/pages/result/index?${params}` })
  }

  const handleNewTest = () => {
    Taro.redirectTo({ url: '/pages/index/index' })
  }

  const handleClear = () => {
    Taro.showModal({
      title: '确认清空',
      content: '确定要清空所有测试记录吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.removeStorageSync('quiz_records')
          setRecords([])
          Taro.showToast({ title: '已清空', icon: 'success' })
        }
      }
    })
  }

  return (
    <View className='history-page'>
      <View className='nav-bar'>
        <View className='nav-back' onClick={() => Taro.navigateBack()}>
          <Text className='back-icon'>←</Text>
        </View>
        <Text className='nav-title'>我的测试记录</Text>
        <View className='nav-placeholder' />
      </View>

      <ScrollView className='record-list' scrollY>
        {records.map((record, idx) => (
          <View key={idx} className='record-card' onClick={() => handleViewDetail(record)}>
            <View className='record-accent' />
            <View className='record-content'>
              <Text className='record-date'>{record.date}</Text>
              <Text className='record-profile'>{record.profile}</Text>
              <Text className='record-scores'>
                A={record.scores.A} B={record.scores.B} C={record.scores.C} D={record.scores.D}
              </Text>
              <View className='record-tags'>
                <Text className='record-tag'>{record.ageGroup} · {record.count}题</Text>
              </View>
              <Text className='record-link'>查看详情 →</Text>
            </View>
          </View>
        ))}

        {records.length === 0 && (
          <View className='empty-state'>
            <Text className='empty-icon'>🐱</Text>
            <Text className='empty-text'>还没有记录，开始你的第一次测试吧</Text>
            <View className='empty-btn' onClick={handleNewTest}>
              <Text className='empty-btn-text'>开始测试</Text>
            </View>
          </View>
        )}

        {records.length > 0 && (
          <View className='new-test-section'>
            <View className='new-test-btn' onClick={handleNewTest}>
              <Text className='new-test-text'>+ 开始新测试</Text>
            </View>
          </View>
        )}

        {records.length > 0 && (
          <Text className='clear-link' onClick={handleClear}>清空记录</Text>
        )}
      </ScrollView>
    </View>
  )
}
