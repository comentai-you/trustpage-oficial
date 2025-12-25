export interface LandingPageColors {
  primary: string;
  background: string;
  text: string;
  buttonBg: string;
  buttonText: string;
}

export type PageTheme = 'dark' | 'light' | 'modern-gray';

export const pageThemes: Record<PageTheme, { name: string; colors: LandingPageColors }> = {
  dark: {
    name: 'Dark (Padrão)',
    colors: {
      primary: '#22C55E',
      background: '#000000',
      text: '#FFFFFF',
      buttonBg: '#22C55E',
      buttonText: '#FFFFFF'
    }
  },
  light: {
    name: 'Light',
    colors: {
      primary: '#2563EB',
      background: '#FFFFFF',
      text: '#111827',
      buttonBg: '#2563EB',
      buttonText: '#FFFFFF'
    }
  },
  'modern-gray': {
    name: 'Modern Gray',
    colors: {
      primary: '#10B981',
      background: '#1f2937',
      text: '#F9FAFB',
      buttonBg: '#10B981',
      buttonText: '#FFFFFF'
    }
  }
};

export interface LandingPage {
  id: string;
  user_id: string;
  slug: string;
  template_id: number;
  page_name: string | null;
  profile_image_url: string | null;
  headline: string | null;
  subheadline: string | null;
  video_url: string | null;
  description: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_url: string | null;
  whatsapp_number: string | null;
  pix_pixel_id: string | null;
  colors: LandingPageColors;
  is_published: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface LandingPageFormData {
  slug: string;
  template_id: number;
  page_name: string;
  profile_image_url: string;
  headline: string;
  headline_size: number;
  headline_size_mobile: number;
  headline_size_desktop: number;
  subheadline: string;
  video_url: string;
  video_storage_path: string;
  video_thumbnail_url: string;
  description: string;
  image_url: string;
  cta_text: string;
  cta_url: string;
  whatsapp_number: string;
  pix_pixel_id: string;
  colors: LandingPageColors;
  theme: PageTheme;
}

export const defaultFormData: LandingPageFormData = {
  slug: '',
  template_id: 1,
  page_name: '',
  profile_image_url: '',
  headline: 'Descubra o Segredo Para Transformar Sua Vida',
  headline_size: 2,
  headline_size_mobile: 1.2,
  headline_size_desktop: 2.5,
  subheadline: '',
  video_url: '',
  video_storage_path: '',
  video_thumbnail_url: '',
  description: '',
  image_url: '',
  cta_text: 'QUERO AGORA',
  cta_url: '',
  whatsapp_number: '',
  pix_pixel_id: '',
  colors: {
    primary: '#22C55E',
    background: '#000000',
    text: '#FFFFFF',
    buttonBg: '#22C55E',
    buttonText: '#FFFFFF'
  },
  theme: 'dark'
};

export const templates = [
  { id: 1, name: 'Vendedor de Elite', description: 'Design limpo e profissional' },
  { id: 2, name: 'Minimalista', description: 'Foco total no conteúdo' },
  { id: 3, name: 'Bold', description: 'Cores vibrantes e impactantes' },
  { id: 4, name: 'Elegante', description: 'Sofisticado e refinado' },
  { id: 5, name: 'Tech', description: 'Moderno e tecnológico' },
];
