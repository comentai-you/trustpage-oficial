export interface LandingPageColors {
  primary: string;
  background: string;
  text: string;
  buttonBg: string;
  buttonText: string;
}

export type PageTheme = 'dark' | 'light' | 'modern-gray';
export type TemplateType = 'vsl' | 'sales' | 'bio';

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

// Sales Page specific types
export interface Benefit {
  title: string;
  description: string;
  emoji: string;
  icon?: string; // Lucide icon name
}

export interface Testimonial {
  name: string;
  text: string;
  avatarUrl: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SalesPageContent {
  heroMediaType: 'video' | 'image';
  benefits: Benefit[];
  testimonials: Testimonial[];
  priceFrom: string;
  priceTo: string;
  guaranteeText: string;
  scarcityEnabled?: boolean;
  scarcityText?: string;
  // Offer section editable fields
  offerTitle?: string;
  offerSubtitle?: string;
  offerFeatures?: string[];
  // FAQ section
  faqEnabled?: boolean;
  faqTitle?: string;
  faqItems?: FAQItem[];
  // Carousel settings
  carouselEnabled?: boolean;
  carouselImages?: string[];
  carouselInterval?: number; // seconds
}

export const defaultSalesContent: SalesPageContent = {
  heroMediaType: 'image',
  benefits: [
    { title: 'Resultado Garantido', description: 'Transformação real em poucos dias', emoji: '✨', icon: 'Sparkles' },
    { title: 'Suporte 24h', description: 'Equipe pronta para ajudar', emoji: '💬', icon: 'MessageCircle' },
    { title: 'Bônus Exclusivos', description: 'Materiais extras inclusos', emoji: '🎁', icon: 'Gift' }
  ],
  testimonials: [
    { name: 'Maria Silva', text: 'Mudou completamente minha vida! Recomendo a todos.', avatarUrl: '' },
    { name: 'João Santos', text: 'Melhor investimento que já fiz. Vale cada centavo!', avatarUrl: '' },
    { name: 'Ana Costa', text: 'Resultados incríveis em pouco tempo. Estou muito feliz!', avatarUrl: '' }
  ],
  priceFrom: '197',
  priceTo: '97',
  guaranteeText: '7 dias de garantia incondicional',
  scarcityEnabled: true,
  scarcityText: '🔥 Oferta por tempo limitado! Garanta o preço promocional hoje.',
  offerTitle: 'Oferta Especial',
  offerSubtitle: 'Por apenas',
  offerFeatures: [
    'Acesso imediato ao conteúdo',
    'Suporte exclusivo VIP',
    'Bônus especiais inclusos',
    'Atualizações gratuitas'
  ],
  faqEnabled: true,
  faqTitle: 'Perguntas Frequentes',
  faqItems: [
    { question: 'Como funciona a garantia?', answer: 'Você tem 7 dias para testar. Se não gostar, devolvemos 100% do seu dinheiro.' },
    { question: 'Quanto tempo tenho acesso?', answer: 'Acesso vitalício! Uma vez adquirido, o conteúdo é seu para sempre.' },
    { question: 'Preciso ter experiência prévia?', answer: 'Não! O conteúdo foi criado para iniciantes e também agrega valor para avançados.' }
  ],
  carouselEnabled: false,
  carouselImages: [],
  carouselInterval: 4
};

// Bio Link specific types
export interface BioLink {
  id: string;
  text: string;
  url: string;
  thumbnailUrl?: string;
  isHighlighted?: boolean;
}

export interface BioSocialLinks {
  instagram?: string;
  whatsapp?: string;
  tiktok?: string;
  youtube?: string;
  linkedin?: string;
}

export interface BioLinkContent {
  avatarUrl: string;
  profileName: string;
  bio: string;
  socialLinks: BioSocialLinks;
  links: BioLink[];
}

export const defaultBioContent: BioLinkContent = {
  avatarUrl: '',
  profileName: '@seuperfil',
  bio: 'Sua bio aqui. Conte um pouco sobre você ou sua marca.',
  socialLinks: {},
  links: [
    { id: '1', text: 'Meu Site Principal', url: '', isHighlighted: true },
    { id: '2', text: 'Meu Canal do YouTube', url: '', thumbnailUrl: '' },
    { id: '3', text: 'Produto em Destaque', url: '', isHighlighted: false }
  ]
};

export interface LandingPage {
  id: string;
  user_id: string;
  slug: string;
  template_id: number;
  template_type: TemplateType;
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
  primary_color: string;
  content: SalesPageContent | BioLinkContent | null;
  is_published: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface LandingPageFormData {
  slug: string;
  template_id: number;
  template_type: TemplateType;
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
  cta_delay_enabled: boolean;
  cta_delay_percentage: number;
  whatsapp_number: string;
  pix_pixel_id: string;
  colors: LandingPageColors;
  primary_color: string;
  content: SalesPageContent | BioLinkContent;
  bioContent?: BioLinkContent;
  theme: PageTheme;
}

export const defaultFormData: LandingPageFormData = {
  slug: '',
  template_id: 1,
  template_type: 'vsl',
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
  cta_delay_enabled: false,
  cta_delay_percentage: 50,
  whatsapp_number: '',
  pix_pixel_id: '',
  colors: {
    primary: '#22c55e',
    background: '#09090b',
    text: '#ffffff',
    buttonBg: '#22c55e',
    buttonText: '#ffffff'
  },
  primary_color: '#8B5CF6',
  content: defaultSalesContent,
  theme: 'dark'
};

export const templates = [
  { id: 1, name: 'Vendedor de Elite', description: 'Design limpo e profissional' },
  { id: 2, name: 'Minimalista', description: 'Foco total no conteúdo' },
  { id: 3, name: 'Bold', description: 'Cores vibrantes e impactantes' },
  { id: 4, name: 'Elegante', description: 'Sofisticado e refinado' },
  { id: 5, name: 'Tech', description: 'Moderno e tecnológico' },
];
