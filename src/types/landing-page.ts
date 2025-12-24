export interface LandingPageColors {
  primary: string;
  background: string;
  text: string;
  buttonBg: string;
  buttonText: string;
}

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
}

export const defaultFormData: LandingPageFormData = {
  slug: '',
  template_id: 1,
  page_name: 'Minha Marca',
  profile_image_url: '',
  headline: 'Descubra o Segredo Para Transformar Sua Vida',
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
  }
};

export const templates = [
  { id: 1, name: 'Vendedor de Elite', description: 'Design limpo e profissional' },
  { id: 2, name: 'Minimalista', description: 'Foco total no conteúdo' },
  { id: 3, name: 'Bold', description: 'Cores vibrantes e impactantes' },
  { id: 4, name: 'Elegante', description: 'Sofisticado e refinado' },
  { id: 5, name: 'Tech', description: 'Moderno e tecnológico' },
];
