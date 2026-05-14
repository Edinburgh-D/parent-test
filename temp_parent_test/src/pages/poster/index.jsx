import Taro from '@tarojs/taro'
import { View, Text, Button, Canvas } from '@tarojs/components'
import { useState, useEffect, useRef } from 'react'
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

  useEffect(() => {
    const ctx = Taro.createCanvasContext('posterCanvas')
    const W = 375
    const H = 600

    ctx.setFillStyle('#F5F0EB')
    ctx.fillRect(0, 0, W, H)

    ctx.setStrokeStyle('#E5E5E5')
    ctx.setLineWidth(2)
    ctx.strokeRect(20, 20, W - 40, H - 40)

    ctx.setFillStyle('#1A1A1A')
    ctx.setFontSize(16)
    ctx.setTextAlign('center')
    ctx.fillText('父母成长等级测试', W / 2, 70)

    ctx.setFillStyle('#D4A574')
    ctx.setFontSize(32)
    ctx.fillText(profile.name, W / 2, 130)

    ctx.setFillStyle('#666666')
    ctx.setFontSize(14)
    ctx.fillText(`"${profile.quote}"`, W / 2, 180)

    const colors = { A: '#FF8C42', B: '#6B8E8B', C: '#8FBC8F', D: '#9B7EBD' }
    const labels = { A: '情绪', B: '规则', C: '探索', D: '行动' }
    const positions = [
      { x: 80, y: 240 },
      { x: 200, y: 240 },
      { x: 80, y: 310 },
      { x: 200, y: 310 }
    ]

    Object.entries(profile.scores).forEach(([key, val], idx) => {
      const pos = positions[idx]
      ctx.setFillStyle(colors[key])
      ctx.fillRect(pos.x, pos.y, 90, 50)
      ctx.setFillStyle('#FFFFFF')
      ctx.setFontSize(12)
      ctx.fillText(`${labels[key]} ${val}`, pos.x + 45, pos.y + 30)
    })

    ctx.setFillStyle('#FFFFFF')
    ctx.fillRect((W - 120) / 2, 400, 120, 120)
    ctx.setStrokeStyle('#E5E5E5')
    ctx.strokeRect((W - 120) / 2, 400, 120, 120)
    ctx.setFillStyle('#999999')
    ctx.setFontSize(10)
    ctx.fillText('扫码测测你的育儿风格', W / 2, 540)

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
