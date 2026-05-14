import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import './index.scss'

const courses = [
  {
    title: '温柔而坚定',
    tag: '温室园丁型父母',
    duration: '15分钟',
    rating: 5,
    color: '#D4A574'
  },
  {
    title: '从容器到镜子',
    tag: '共情引导者进阶',
    duration: '20分钟',
    rating: 4,
    color: '#6B8E8B'
  }
]

export default function CoursesPage() {
  const handleTry = (course) => {
    Taro.showToast({ title: `试看「${course.title}」`, icon: 'none' })
  }

  const renderStars = (count) => '★'.repeat(count) + '☆'.repeat(5 - count)

  return (
    <View className='courses-page'>
      <View className='nav-bar'>
        <View className='nav-back' onClick={() => Taro.navigateBack()}>
          <Text className='back-icon'>←</Text>
        </View>
        <Text className='nav-title'>专属课程推荐</Text>
        <View className='nav-placeholder' />
      </View>

      <View className='sub-header'>
        <Text className='sub-text'>基于你的「温室园丁」画像</Text>
      </View>

      <ScrollView className='course-list' scrollY>
        {courses.map((course, idx) => (
          <View key={idx} className='course-card'>
            <View className='course-cover'>
              <Text className='cover-label'>[课程封面]</Text>
            </View>

            <Text className='course-title'>{course.title}</Text>

            <View className='course-tag' style={{ backgroundColor: course.color }}>
              <Text className='tag-text'>适合{course.tag}</Text>
            </View>

            <Text className='course-meta'>{renderStars(course.rating)} {course.duration}</Text>

            <View className='try-btn' onClick={() => handleTry(course)}>
              <Text className='try-text'>免费试看</Text>
            </View>
          </View>
        ))}

        <View className='more-link'>
          <Text className='more-text'>查看更多课程 →</Text>
        </View>
      </ScrollView>
    </View>
  )
}
