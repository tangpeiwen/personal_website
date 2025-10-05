import { ReactNode } from 'react';

export interface DarkModeProps {
  isDarkMode: boolean;
}

export interface NavbarProps extends DarkModeProps {
  setIsDarkMode: (value: boolean | ((prev: boolean) => boolean)) => void;
}

export interface HeaderProps extends DarkModeProps {}
export interface AboutProps extends DarkModeProps {}
export interface ServicesProps extends DarkModeProps {}
export interface WorkProps extends DarkModeProps {}
export interface GalleryProps extends DarkModeProps {}
export interface ContactProps extends DarkModeProps {}
export interface FooterProps extends DarkModeProps {}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description: string;
  created_at: string;
  file_name: string;
} 