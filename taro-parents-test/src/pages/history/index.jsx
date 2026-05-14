import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { useState } from 'react';
import './index.scss';

export default function HistoryPage() {
  const [records, setRecords] = useState(() => {
    return Taro.getStorageSync('testHistory') || [];
  });

  const handleViewDetail = (record) => {
    Taro.setStorageSync('quizCounts', record.counts);
    Taro.setStorageSync('quizResultKey', record.resultKey);
    Taro.redirectTo({ url: '/pages/result/index' });
  };

  const handleClear = () => {
    Taro.showModal({
      title: '确认清空',
      content: '确定要清空所有测试记录吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.removeStorageSync('testHistory');
          setRecords([]);
        }
      },
    });
  };

  const handleNewTest = () => {
    Taro.redirectTo({ url: '/pages/index/index' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <View className="history-page">
      <View className="header">
        <Text className="title">📋 我的测试记录</Text>
      </View>

      {records.length === 0 ? (
        <View className="empty-state">
          <Text className="empty-text">还没有记录，开始你的第一次测试吧</Text>
          <View className="empty-btn" onClick={handleNewTest}>
            <Text className="btn-text">开始测试</Text>
          </View>
        </View>
      ) : (
        <>
          <View className="records-list">
            {records.map((record, index) => (
              <View
                key={record.id || index}
                className="record-card"
                onClick={() => handleViewDetail(record)}
              >
                <View className="record-accent" />
                <View className="record-content">
                  <Text className="record-date">{formatDate(record.timestamp)}</Text>
                  <Text className="record-profile">{record.profileName || '温室园丁'}</Text>
                  <Text className="record-dims">
                    {Object.entries(record.counts || {})
                      .map(([k, v]) => `${k}=${v}`)
                      .join(' ')}
                  </Text>
                  <View className="record-tags">
                    <Text className="record-tag">{record.ageGroup || '全部题库'}</Text>
                    <Text className="record-tag">{record.questionCount || 28}题</Text>
                  </View>
                  <Text className="record-link">查看详情 →</Text>
                </View>
              </View>
            ))}
          </View>

          <View className="new-test-btn" onClick={handleNewTest}>
            <Text className="btn-text">+ 开始新测试</Text>
          </View>

          <Text className="clear-link" onClick={handleClear}>
            清空记录
          </Text>
        </>
      )}
    </View>
  );
}
