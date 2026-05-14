import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import './index.scss'

const courses = [
  {
    title: '温柔而坚定',
    tag: '适合温室园丁型父母',
    desc: '在爱与规则中，养出内心有光的孩子',
    duration: '15分钟',
    rating: 5,
    color: '#6B8E8B',
    coverLabel: '[水彩插画：妈妈蹲下来和孩子平视]'
  },
  {
    title: '从容器到镜子',
    tag: '共情引导者进阶',
    desc: '看见自己，才能更好地看见孩子',
    duration: '20分钟',
    rating: 4,
    color: '#6B8E8B',
    coverLabel: '[水彩插画：妈妈和孩子对着镜子]'
  }
]

export default function CoursesPage() {
  const handleTry = (course) => {
    Taro.showToast({ title: `试看「${course.title}」`, icon: 'none' })
  }

  const renderStars = (count) => '★'.repeat(count) + '☆'.repeat(5 - count)

  return (
    <View className='courses-page'>
      {/* 顶部区域 */}
      <View className='header-section'>
        <View className='header-text'>
          <View className='nav-bar'>
            <View className='nav-back' onClick={() => Taro.navigateBack()}>
              <Text className='back-icon'>←</Text>
            </View>
            <Text className='nav-title'>专属课程推荐</Text>
            <View className='nav-placeholder' />
          </View>
          <View className='sub-header'>
            <Text className='sub-icon'>🌿</Text>
            <Text className='sub-text'>基于你的「温室园丁」画像</Text>
            <Text className='sub-icon'>🌿</Text>
          </View>
        </View>
        <View className='header-illustration'>
          <Text className='illus-label'>[水彩插画：妈妈拥抱孩子]</Text>
        </View>
      </View>

      <ScrollView className='course-list' scrollY>
        {courses.map((course, idx) => (
          <View key={idx} className='course-card'>
            <View className='course-cover'>
              <Text className='cover-label'>{course.coverLabel}</Text>
              <View className='play-btn'>
                <Text className='play-icon'>▶</Text>
              </View>
            </View>

            <View className='course-info'>
              <Text className='course-title'>{course.title}</Text>
              <View className='course-tag' style={{ backgroundColor: course.color }}>
                <Text className='tag-text'>{course.tag}</Text>
              </View>
              <Text className='course-desc'>{course.desc}</Text>
              <Text className='course-meta'>{renderStars(course.rating)} {course.duration}</Text>
              <View className='try-btn' onClick={() => handleTry(course)}>
                <Text className='try-text'>免费试看</Text>
              </View>
            </View>
          </View>
        ))}

        <View className='more-link'>
          <Text className='more-text'>查看更多课程 →</Text>
        </View>
      </ScrollView>

      {/* 底部装饰 */}
      <View className='bottom-deco'>
        <Text className='deco-label'>[水彩花卉装饰]</Text>
      </View>
    </View>
  )
}
