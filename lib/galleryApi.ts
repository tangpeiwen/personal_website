import { supabase } from './supabase';
import type { GalleryImage } from '@/types';

const BUCKET_NAME = 'gallery-images';

export interface UploadImageParams {
  file: File;
  title: string;
  description: string;
}

export interface UpdateImageParams {
  id: string;
  title: string;
  description: string;
}

/**
 * 从 Supabase 获取所有图片
 */
export async function fetchImages(): Promise<GalleryImage[]> {
  try {
    // 从 gallery_metadata 表获取图片元数据
    const { data, error } = await supabase
      .from('gallery_metadata')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  }
}

/**
 * 上传图片到 Supabase Storage 并保存元数据
 */
export async function uploadImage({ file, title, description }: UploadImageParams): Promise<GalleryImage> {
  try {
    // 生成唯一的文件名
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    // 上传文件到 Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // 获取公开 URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    // 保存元数据到数据库
    const { data, error: dbError } = await supabase
      .from('gallery_metadata')
      .insert([
        {
          url: urlData.publicUrl,
          title,
          description,
          file_name: fileName,
        },
      ])
      .select()
      .single();

    if (dbError) throw dbError;

    return data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * 更新图片元数据
 */
export async function updateImage({ id, title, description }: UpdateImageParams): Promise<GalleryImage> {
  try {
    const { data, error } = await supabase
      .from('gallery_metadata')
      .update({ title, description })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating image:', error);
    throw error;
  }
}

/**
 * 删除图片（从 Storage 和数据库）
 */
export async function deleteImage(id: string, fileName: string): Promise<void> {
  try {
    // 从 Storage 删除文件
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName]);

    if (storageError) throw storageError;

    // 从数据库删除元数据
    const { error: dbError } = await supabase
      .from('gallery_metadata')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

