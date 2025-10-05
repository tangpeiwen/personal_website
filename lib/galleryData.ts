export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description: string;
}

// 本地图片数据
// 将你的图片放在 /public/gallery/ 文件夹中，然后在这里添加配置
export const galleryImages: GalleryImage[] = [
  {
    id: '1',
    url: '/work-1.png',
    title: 'Project One',
    description: 'A stunning example of modern web design',
  },
  {
    id: '2',
    url: '/work-2.png',
    title: 'Project Two',
    description: 'Creative solution for complex problems',
  },
  {
    id: '3',
    url: '/work-3.png',
    title: 'Project Three',
    description: 'Innovative approach to user experience',
  },
  {
    id: '4',
    url: '/work-4.png',
    title: 'Project Four',
    description: 'Beautiful and functional design',
  },
];
