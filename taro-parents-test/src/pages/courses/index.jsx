import Taro from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components';
import './index.scss';

const COURSES = [
  {
    id: 'course-001',
    title: '温柔而坚定',
    targetProfiles: ['A', 'A+B', 'A+C', 'A+D'],
    description: '适合情绪回应型父母，学习在接纳情绪的同时建立清晰边界',
    duration: '15分钟',
    rating: 5,
    free: true,
  },
  {
    id: 'course-002',
    title: '从容器到镜子',
    targetProfiles: ['A+C', 'A+B+C'],
    description: '共情引导者进阶，让孩子学会自己看见情绪',
    duration: '20分钟',
    rating: 4,
    free: true,
  },
  {
    id: 'course-003',
    title: '钢筋里的温度',
    targetProfiles: ['B', 'B+D', 'B+C+D'],
    description: '秩序建构者的情感补丁，如何在规则中传递爱',
    duration: '18分钟',
    rating: 5,
    free: true,
  },
  {
    id: 'course-004',
    title: '果断之后',
    targetProfiles: ['D', 'A+D', 'C+D'],
    description: '行动派指挥官的情绪复盘，如何补回被跳过的情感连接',
    duration: '15分钟',
    rating: 4,
    free: true,
  },
];

export default function CoursesPage() {
  const resultKey = Taro.getStorageSync('quizResultKey') || 'A';
  const profileName = Taro.getStorageSync('quizProfileName') || '温室园丁';

  // 筛选匹配当前画像的课程
  const dims = resultKey.split('+');
  const matchedCourses = COURSES.filter(course =>
    dims.some(dim => course.targetProfiles.includes(dim))
  );

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <View className="courses-page">
      <View className="header">
        <Text className="title">📚 专属课程推荐</Text>
        <Text className="subtitle">基于你的「{profileName}」画像</Text>
      </View>

      <View className="courses-list">
        {matchedCourses.map((course) => (
          <View key={course.id} className="course-card">
            <View className="course-cover">
              <Text className="cover-placeholder">{course.title}</Text>
            </View>
            <View className="course-info">
              <Text className="course-title">{course.title}</Text>
              <View className="course-tags">
                {course.targetProfiles.slice(0, 2).map((p, i) => (
                  <Text key={i} className="course-tag">{p}型</Text>
                ))}
              </View>
              <View className="course-meta">
                <Text className="stars">{renderStars(course.rating)}</Text>
                <Text className="duration">{course.duration}</Text>
              </View>
              <Text className="course-desc">{course.description}</Text>
              <View className="course-btn">
                <Text className="btn-text">免费试看</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View className="more-link">
        <Text className="more-text">查看更多课程 →</Text>
      </View>
    </View>
  );
}
