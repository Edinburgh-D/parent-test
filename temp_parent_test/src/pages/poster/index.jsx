import Taro from '@tarojs/taro'
import { View, Text, Button, Canvas } from '@tarojs/components'
import { useState, useEffect } from 'react'
import './index.scss'

export default function PosterPage() {
  const [saved, setSaved] = useState(false)
  const [shareText, setShareText] = useState(0)

  const profile = {
    name: '温室园丁',
    quote: '你治愈的不是一个问题，是一个人',
    scores: { A: 8, B: 6, C: 5, D: 5 }
  }

  const shareOptions = [
    '测完发现我是「温室园丁」',
    '原来我带娃的方式叫...',
    '这道题我选了A，老公选了D'
  ]

  const scoreLabels = { A: '情绪', B: '规则', C: '探索', D: '行动' }
  const scoreColors = { A: '#FF8C42', B: '#8FBC8F', C: '#6B8E8B', D: '#9B7EBD' }

  useEffect(() => {
    const ctx = Taro.createCanvasContext('posterCanvas')
    const W = 375
    const H = 600

    // 背景
    ctx.setFillStyle('#FFFFFF')
    ctx.fillRect(0, 0, W, H)

    // 圆角矩形边框效果
    ctx.setStrokeStyle('#F0F0F0')
    ctx.setLineWidth(2)
    ctx.strokeRect(16, 16, W - 32, H - 32)

    // 标题
    ctx.setFillStyle('#999999')
    ctx.setFontSize(14)
    ctx.setTextAlign('center')
    ctx.fillText('父母成长等级测试', W / 2, 60)

    // 画像名
    ctx.setFillStyle('#FF8C42')
    ctx.setFontSize(36)
    ctx.fillText(profile.name, W / 2, 120)

    // 金句
    ctx.setFillStyle('#666666')
    ctx.setFontSize(13)
    ctx.fillText(`"${profile.quote}"`, W / 2, 170)

    // 四维度方块 2x2
    const sqSize = 80
    const gap = 16
    const startX = (W - sqSize * 2 - gap) / 2
    const startY = 220

    Object.entries(profile.scores).forEach(([key, val], idx) => {
      const row = Math.floor(idx / 2)
      const col = idx % 2
      const x = startX + col * (sqSize + gap)
      const y = startY + row * (sqSize + gap)

      ctx.setFillStyle(scoreColors[key])
      ctx.fillRect(x, y, sqSize, sqSize)

      ctx.setFillStyle('#FFFFFF')
      ctx.setFontSize(14)
      ctx.fillText(scoreLabels[key], x + sqSize / 2, y + sqSize / 2 - 6)
      ctx.setFontSize(20)
      ctx.fillText(String(val), x + sqSize / 2, y + sqSize / 2 + 16)
    })

    // 扫码提示
    ctx.setFillStyle('#999999')
    ctx.setFontSize(12)
    ctx.fillText('扫码测测你的育儿风格', W / 2, 430)

    // 二维码占位
    ctx.setFillStyle('#F5F5F5')
    ctx.fillRect((W - 100) / 2, 450, 100, 100)
    ctx.setStrokeStyle('#E5E5E5')
    ctx.strokeRect((W - 100) / 2, 450, 100, 100)

    ctx.draw()
  }, [])

  const handleSave = () => {
    Taro.canvasToTempFilePath({
      canvasId: 'posterCanvas',
      success: (res) => {
        Taro.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            setSaved(true)
            Taro.showToast({ title: '已保存到相册', icon: 'success' })
          },
          fail: () => {
            Taro.showToast({ title: '保存失败，请授权', icon: 'none' })
          }
        })
      }
    })
  }

  const handleShare = () => {
    const text = shareOptions[shareText]
    Taro.setClipboardData({
      data: text,
      success: () => Taro.showToast({ title: '文案已复制', icon: 'success' })
    })
  }

  return (
    <View className='poster-page'>
      <View className='page-title'>
        <Text className='title-text'>生成我的育儿海报</Text>
      </View>

      <View className='poster-preview'>
        <Canvas canvasId='posterCanvas' className='poster-canvas' style={{ width: '375px', height: '600px' }} />
      </View>

      <View className='action-section'>
        <Button className='save-btn' onClick={handleSave}>
          <Text className='btn-text'>{saved ? '已保存' : '保存到相册'}</Text>
        </Button>

        <Button className='share-btn' onClick={handleShare}>
          <Text className='btn-text'>分享给朋友</Text>
        </Button>
      </View>

      <View className='text-options'>
        <Text className='options-title'>文案模板</Text>
        <View className='pill-group'>
          {shareOptions.map((opt, idx) => (
            <View
              key={idx}
              className={`text-pill ${shareText === idx ? 'active' : ''}`}
              onClick={() => setShareText(idx)}
            >
              <Text className='pill-txt'>{opt}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}
