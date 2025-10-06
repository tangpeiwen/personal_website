'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { DarkModeProps } from '@/types'

interface ImageItem {
  name: string
  url: string
}

export default function ImageGallery({ isDarkMode }: DarkModeProps) {
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadImages = async () => {
    try {
      setLoading(true)
      
      // 获取 bucket 中的所有文件
      const { data, error } = await supabase.storage
        .from('images')
        .list()

      if (error) {
        throw error
      }

      // 获取每个文件的公开 URL
      const imageUrls = data.map(file => {
        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(file.name)
        
        return {
          name: file.name,
          url: urlData.publicUrl
        }
      })

      setImages(imageUrls)
    } catch (error) {
      console.error('加载图片错误:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadImages()
    
    // 监听上传事件，自动刷新图片列表
    const handleImageUploaded = () => {
      loadImages()
    }
    
    window.addEventListener('imageUploaded', handleImageUploaded)
    
    return () => {
      window.removeEventListener('imageUploaded', handleImageUploaded)
    }
  }, [])

  if (loading) {
    return (
      <div className={`w-11/12 max-w-6xl mx-auto py-10 ${isDarkMode ? 'dark' : ''}`}>
        <div className="text-center">
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            加载中...
          </p>
        </div>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className={`w-11/12 max-w-6xl mx-auto py-10 ${isDarkMode ? 'dark' : ''}`}>
        <div className="text-center">
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            暂无图片，请先上传图片
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-11/12 max-w-6xl mx-auto py-10 ${isDarkMode ? 'dark' : ''}`}>
      <h2 className={`text-3xl font-semibold mb-8 text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        图片展示
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((image) => (
          <div
            key={image.name}
            className={`
              relative aspect-square overflow-hidden rounded-lg
              transition-transform hover:scale-105
              ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}
            `}
          >
            <img
              src={image.url}
              alt={image.name}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

