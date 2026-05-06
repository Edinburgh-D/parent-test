import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import courses from '../../data/courses.json';
import './index.css';

export default function Courses() {
  const handleBack = () => {
    Taro.navigateBack();
  };

  return (
    <View className="page courses">
      <View className="courses-header">
        <Button className="courses-back" onClick={handleBack}>←</Button>
        <Text className="courses-title">精选成长课程</Text>
      </View>
      <Text className="courses-subtitle">根据你的测试结果，推荐以下课程</Text>

      <View className="course-list">
        {courses.map((c) => (
          <View className="course-item" key={c.id}>
            <View className="course-item-header">
              <Text className="course-item-title">{c.title}</Text>
              <Text className="course-tag">{c.tag}</Text>
            </View>
            <Text className="course-item-desc">{c.desc}</Text>
            <View className="course-item-footer">
              <Text className="course-price">{c.price}</Text>
              <Button className="btn-small">了解详情</Button>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
