'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { GalleryProps, GalleryImage } from '@/types';
import { fetchImages, uploadImage, updateImage, deleteImage } from '@/lib/galleryApi';
import { assets } from '@/assets/assets';

const Gallery: React.FC<GalleryProps> = ({ isDarkMode }) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 上传表单状态
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    file: null as File | null,
  });

  // 编辑表单状态
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
  });

  // 加载图片
  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      const data = await fetchImages();
      setImages(data);
    } catch (error) {
      console.error('Failed to load images:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadForm({ ...uploadForm, file });
    }
  };

  // 处理拖拽上传
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadForm({ ...uploadForm, file });
    }
  };

  // 上传图片
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.title) return;

    try {
      setUploading(true);
      await uploadImage({
        file: uploadForm.file,
        title: uploadForm.title,
        description: uploadForm.description,
      });
      setUploadForm({ title: '', description: '', file: null });
      setShowUploadForm(false);
      await loadImages();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  // 开始编辑
  const handleStartEdit = (image: GalleryImage) => {
    setEditingImage(image);
    setEditForm({
      title: image.title,
      description: image.description,
    });
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editingImage) return;

    try {
      await updateImage({
        id: editingImage.id,
        title: editForm.title,
        description: editForm.description,
      });
      setEditingImage(null);
      await loadImages();
    } catch (error) {
      console.error('Update failed:', error);
      alert('更新失败，请重试');
    }
  };

  // 删除图片
  const handleDelete = async (id: string, fileName: string) => {
    try {
      await deleteImage(id, fileName);
      setDeleteConfirm(null);
      await loadImages();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('删除失败，请重试');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      id="gallery"
      className="w-full px-[12%] py-10 scroll-mt-20"
    >
      {/* 标题 */}
      <motion.h4
        initial={{ y: -20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-center mb-2 text-lg font-Ovo"
      >
        Gallery
      </motion.h4>

      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-center text-5xl font-Ovo"
      >
        Photo Gallery
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="text-center max-w-2xl mx-auto mt-5 mb-12 font-Ovo"
      >
        A collection of memorable moments and inspiring visuals
      </motion.p>

      {/* 上传按钮 */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="flex justify-center mb-8"
      >
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="flex items-center gap-2 px-6 py-3 border-[0.5px] border-gray-700 dark:border-white rounded-full hover:bg-lightHover dark:hover:bg-darkHover duration-500"
        >
          <span>➕</span>
          <span>Upload Image</span>
        </button>
      </motion.div>

      {/* 上传表单 */}
      <AnimatePresence>
        {showUploadForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-2xl mx-auto mb-12 overflow-hidden"
          >
            <form onSubmit={handleUpload} className="bg-white dark:bg-darkHover p-6 rounded-lg shadow-lg">
              {/* 文件上传区域 */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 mb-4 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-lime-500 bg-lime-50 dark:bg-lime-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {uploadForm.file ? (
                  <div className="text-gray-700 dark:text-gray-300">
                    <p className="font-semibold">{uploadForm.file.name}</p>
                    <p className="text-sm">Click to change file</p>
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400">
                    <p className="text-lg mb-2">📁</p>
                    <p>Drag & drop an image here, or click to select</p>
                  </div>
                )}
              </div>

              {/* 标题 */}
              <input
                type="text"
                placeholder="Image title *"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                required
                className="w-full mb-4 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-darkTheme text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
              />

              {/* 描述 */}
              <textarea
                placeholder="Description (optional)"
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                rows={3}
                className="w-full mb-4 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-darkTheme text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
              />

              {/* 按钮 */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={uploading || !uploadForm.file || !uploadForm.title}
                  className="flex-1 px-6 py-3 bg-lime-500 text-black rounded-full hover:bg-lime-400 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadForm(false);
                    setUploadForm({ title: '', description: '', file: null });
                  }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-darkTheme transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 加载状态 */}
      {loading ? (
        <div className="text-center py-20">
          <p className="text-gray-500">Loading images...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">No images yet. Upload your first image!</p>
        </div>
      ) : (
        /* 图片网格 */
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-10"
        >
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer bg-gray-100 dark:bg-gray-800"
              onClick={() => setSelectedImage(image)}
            >
              <Image
                src={image.url}
                alt={image.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              
              {/* 悬停信息 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="font-semibold text-lg mb-1">{image.title}</h3>
                  {image.description && (
                    <p className="text-sm text-gray-200 line-clamp-2">{image.description}</p>
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(image);
                    }}
                    className="p-2 bg-white/90 dark:bg-black/90 rounded-full hover:bg-white dark:hover:bg-black transition-colors"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(image.id);
                    }}
                    className="p-2 bg-white/90 dark:bg-black/90 rounded-full hover:bg-white dark:hover:bg-black transition-colors"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* 图片预览模态框 */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl max-h-[90vh] w-full"
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 text-white text-4xl hover:text-gray-300 transition-colors"
              >
                ×
              </button>
              <div className="relative w-full h-[80vh]">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  fill
                  className="object-contain"
                  sizes="90vw"
                />
              </div>
              <div className="mt-4 text-white text-center">
                <h3 className="text-2xl font-semibold mb-2">{selectedImage.title}</h3>
                {selectedImage.description && (
                  <p className="text-gray-300">{selectedImage.description}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 编辑模态框 */}
      <AnimatePresence>
        {editingImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setEditingImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-darkHover p-6 rounded-lg shadow-xl max-w-md w-full"
            >
              <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Edit Image</h3>
              
              <input
                type="text"
                placeholder="Title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full mb-4 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-darkTheme text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
              />

              <textarea
                placeholder="Description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={4}
                className="w-full mb-4 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-darkTheme text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-6 py-3 bg-lime-500 text-black rounded-full hover:bg-lime-400 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingImage(null)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-darkTheme transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 删除确认对话框 */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-darkHover p-6 rounded-lg shadow-xl max-w-sm w-full"
            >
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Delete Image?</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                This action cannot be undone. Are you sure you want to delete this image?
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const image = images.find(img => img.id === deleteConfirm);
                    if (image) {
                      handleDelete(image.id, image.file_name);
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-darkTheme transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Gallery;

