import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import type { FormField } from '../../types'
import { ocrApi } from '../../services/api'
import './OcrUploader.scss'

interface Props {
  field: FormField
  value: string
  onChange: (val: string) => void
}

export default function OcrUploader({ field, value, onChange }: Props) {
  const [ocrText, setOcrText] = useState('')
  const [recognizing, setRecognizing] = useState(false)
  const [imageUrl, setImageUrl] = useState(value)

  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempPath = res.tempFilePaths[0]
        setImageUrl(tempPath)
        onChange(tempPath)

        // 自动 OCR
        if (field.ocr?.enabled && field.ocr.mode === 'auto') {
          await runOcr(tempPath)
        }
      }
    })
  }

  const runOcr = async (imgPath: string) => {
    setRecognizing(true)
    try {
      // 将图片转为 base64
      const fs = Taro.getFileSystemManager()
      const base64 = fs.readFileSync(imgPath, 'base64')

      const result = await ocrApi.recognize(base64 as string, field.ocr?.ocrType || 'general')
      setOcrText(result.text)
      if (!field.ocr?.targetFields?.length) {
        // 识别结果填入本字段
        onChange(result.text)
      }
      Taro.showToast({ title: 'OCR 识别完成', icon: 'success' })
    } catch (e) {
      Taro.showToast({ title: 'OCR 识别失败', icon: 'error' })
    } finally {
      setRecognizing(false)
    }
  }

  return (
    <View className='ocr-uploader'>
      {/* 图片预览/上传区 */}
      {imageUrl ? (
        <View className='upload-preview'>
          <Image
            className='preview-img'
            src={imageUrl}
            mode='aspectFill'
            onClick={handleChooseImage}
          />
          <View className='preview-actions'>
            <View className='preview-action' onClick={handleChooseImage}>
              <Text>重新上传</Text>
            </View>
            {field.ocr?.enabled && field.ocr.mode === 'manual' && (
              <View
                className={`preview-action preview-action--ocr ${recognizing ? 'preview-action--loading' : ''}`}
                onClick={() => runOcr(imageUrl)}
              >
                <Text>{recognizing ? '识别中...' : '🔍 OCR识别'}</Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View className='upload-zone' onClick={handleChooseImage}>
          <Text className='upload-zone__icon'>📷</Text>
          <Text className='upload-zone__text'>
            {field.ocr?.enabled ? '上传图片（支持OCR识别）' : '点击上传图片'}
          </Text>
          <Text className='upload-zone__hint'>支持相册或拍照</Text>
        </View>
      )}

      {/* OCR 识别状态 */}
      {recognizing && (
        <View className='ocr-status'>
          <Text className='ocr-status__text'>🔍 正在识别中，请稍候...</Text>
        </View>
      )}

      {/* OCR 识别结果 */}
      {ocrText && !recognizing && (
        <View className='ocr-result'>
          <Text className='ocr-result__title'>识别结果</Text>
          <Text className='ocr-result__text'>{ocrText}</Text>
        </View>
      )}
    </View>
  )
}
