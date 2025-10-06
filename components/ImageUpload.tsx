'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { DarkModeProps } from '@/types'

export default function ImageUpload({ isDarkMode }: DarkModeProps) {
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setMessage(null)
      setUploading(true)

      const file = event.target.files?.[0]
      if (!file) {
        return
      }

      // 验证文件类型
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setMessage({ type: 'error', text: '只支持 JPG, PNG, GIF, WEBP 格式的图片' })
        return
      }

      // 验证文件大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: '图片大小不能超过 5MB' })
        return
      }

      // 生成唯一文件名
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      // 上传到 Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file)

      if (uploadError) {
        throw uploadError
      }

      setMessage({ type: 'success', text: '图片上传成功！' })
      
      // 清空文件选择
      event.target.value = ''
      
      // 3秒后清除消息
      setTimeout(() => setMessage(null), 3000)
      
      // 触发页面刷新图片列表
      window.dispatchEvent(new Event('imageUploaded'))
    } catch (error) {
      console.error('上传错误:', error)
      setMessage({ type: 'error', text: '上传失败，请重试' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={`w-11/12 max-w-3xl mx-auto py-10 ${isDarkMode ? 'dark' : ''}`}>
      <div className="text-center">
        <h2 className={`text-3xl font-semibold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          上传图片
        </h2>
        
        <div className="flex flex-col items-center gap-4">
          <label 
            htmlFor="file-upload" 
            className={`
              px-8 py-3 rounded-full cursor-pointer transition-all
              ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
              ${isDarkMode 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
              }
            `}
          >
            {uploading ? '上传中...' : '选择图片'}
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          
          {message && (
            <div 
              className={`
                px-6 py-3 rounded-lg text-sm font-medium
                ${message.type === 'success' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                  : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                }
              `}
            >
              {message.text}
            </div>
          )}
          
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            支持 JPG, PNG, GIF, WEBP 格式，最大 5MB
          </p>
        </div>
      </div>
    </div>
  )
}

