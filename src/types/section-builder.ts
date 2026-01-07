// Section Builder Types - Dynamic content blocks for landing pages

export type SectionType = 
  | 'hero'
  | 'text'
  | 'full-image'
  | 'dual-column'
  | 'video-grid'
  | 'benefits'
  | 'faq'
  | 'testimonials'
  | 'cta'
  | 'spacer';

// Base interface for all sections
export interface BaseSection {
  id: string;
  type: SectionType;
  order: number;
}

// Hero Section
export interface HeroSection extends BaseSection {
  type: 'hero';
  data: {
    headline: string;
    subheadline?: string;
    mediaType: 'video' | 'image' | 'carousel';
    videoUrl?: string;
    imageUrl?: string;
    carouselImages?: string[];
    carouselInterval?: number;
    showCta?: boolean;
    ctaText?: string;
    ctaUrl?: string;
  };
}

// Free Text (Rich Text)
export interface TextSection extends BaseSection {
  type: 'text';
  data: {
    content: string; // Rich text / markdown content
    alignment?: 'left' | 'center' | 'right';
    maxWidth?: 'sm' | 'md' | 'lg' | 'full';
  };
}

// Full Width Image
export interface FullImageSection extends BaseSection {
  type: 'full-image';
  data: {
    imageUrl: string;
    alt?: string;
    linkUrl?: string;
    maxHeight?: number; // in px
  };
}

// Dual Column (Image + Text)
export interface DualColumnSection extends BaseSection {
  type: 'dual-column';
  data: {
    layout: 'image-left' | 'image-right';
    imageUrl: string;
    title: string;
    content: string;
    ctaText?: string;
    ctaUrl?: string;
  };
}

// Video Grid (Multiple Video Testimonials)
export interface VideoGridSection extends BaseSection {
  type: 'video-grid';
  data: {
    title?: string;
    videos: Array<{
      id: string;
      url: string;
      thumbnailUrl?: string;
      name?: string;
    }>;
    columns?: 2 | 3 | 4;
  };
}

// Benefits/Bonus List
export interface BenefitsSection extends BaseSection {
  type: 'benefits';
  data: {
    title?: string;
    style: 'cards' | 'checklist' | 'icons';
    items: Array<{
      id: string;
      title: string;
      description?: string;
      icon?: string;
      emoji?: string;
    }>;
  };
}

// FAQ Accordion
export interface FAQSection extends BaseSection {
  type: 'faq';
  data: {
    title?: string;
    items: Array<{
      id: string;
      question: string;
      answer: string;
    }>;
  };
}

// Testimonials Section
export interface TestimonialsSection extends BaseSection {
  type: 'testimonials';
  data: {
    title?: string;
    items: Array<{
      id: string;
      name: string;
      text: string;
      avatarUrl?: string;
      role?: string;
    }>;
    layout?: 'grid' | 'carousel';
  };
}

// CTA Button Section
export interface CTASection extends BaseSection {
  type: 'cta';
  data: {
    text: string;
    url: string;
    subtext?: string;
    size?: 'medium' | 'large';
  };
}

// Spacer Section
export interface SpacerSection extends BaseSection {
  type: 'spacer';
  data: {
    height: 'sm' | 'md' | 'lg' | 'xl';
  };
}

// Union type for all sections
export type ContentSection = 
  | HeroSection
  | TextSection
  | FullImageSection
  | DualColumnSection
  | VideoGridSection
  | BenefitsSection
  | FAQSection
  | TestimonialsSection
  | CTASection
  | SpacerSection;

// Content structure that replaces fixed SalesPageContent
export interface SectionBuilderContent {
  sections: ContentSection[];
  // Global settings
  scarcityEnabled?: boolean;
  scarcityText?: string;
}

// Section catalog for the "Add Section" modal
export interface SectionCatalogItem {
  type: SectionType;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  category: 'content' | 'media' | 'social-proof' | 'conversion';
}

export const sectionCatalog: SectionCatalogItem[] = [
  {
    type: 'hero',
    name: 'Hero Section',
    description: 'Seção de topo com headline, mídia e CTA',
    icon: 'Layout',
    category: 'content'
  },
  {
    type: 'text',
    name: 'Texto Livre',
    description: 'Bloco de texto para copy longa e argumentação',
    icon: 'FileText',
    category: 'content'
  },
  {
    type: 'full-image',
    name: 'Imagem Full Width',
    description: 'Banner promocional ou imagem em destaque',
    icon: 'Image',
    category: 'media'
  },
  {
    type: 'dual-column',
    name: 'Coluna Dupla',
    description: 'Imagem + Texto lado a lado',
    icon: 'Columns',
    category: 'content'
  },
  {
    type: 'video-grid',
    name: 'Grid de Vídeos',
    description: 'Múltiplos vídeos de depoimentos',
    icon: 'Video',
    category: 'social-proof'
  },
  {
    type: 'benefits',
    name: 'Lista de Benefícios',
    description: 'Checklist de benefícios ou bônus',
    icon: 'CheckSquare',
    category: 'content'
  },
  {
    type: 'faq',
    name: 'FAQ (Accordion)',
    description: 'Perguntas frequentes expansíveis',
    icon: 'HelpCircle',
    category: 'content'
  },
  {
    type: 'testimonials',
    name: 'Depoimentos',
    description: 'Depoimentos de clientes em texto',
    icon: 'MessageSquare',
    category: 'social-proof'
  },
  {
    type: 'cta',
    name: 'Botão CTA',
    description: 'Botão de chamada para ação',
    icon: 'MousePointerClick',
    category: 'conversion'
  },
  {
    type: 'spacer',
    name: 'Espaçador',
    description: 'Espaço vertical entre seções',
    icon: 'Maximize2',
    category: 'content'
  }
];

// Helper to create default section data
export const createDefaultSection = (type: SectionType, order: number): ContentSection => {
  const id = `section_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  switch (type) {
    case 'hero':
      return {
        id,
        type: 'hero',
        order,
        data: {
          headline: 'Transforme Sua Vida Hoje',
          subheadline: 'Descubra o método que já ajudou milhares de pessoas',
          mediaType: 'image',
          showCta: true,
          ctaText: 'QUERO AGORA',
          ctaUrl: ''
        }
      };
    case 'text':
      return {
        id,
        type: 'text',
        order,
        data: {
          content: 'Escreva seu texto aqui. Este bloco suporta parágrafos longos para argumentação e copy de vendas.',
          alignment: 'left',
          maxWidth: 'lg'
        }
      };
    case 'full-image':
      return {
        id,
        type: 'full-image',
        order,
        data: {
          imageUrl: '',
          alt: 'Imagem promocional'
        }
      };
    case 'dual-column':
      return {
        id,
        type: 'dual-column',
        order,
        data: {
          layout: 'image-left',
          imageUrl: '',
          title: 'Título da Seção',
          content: 'Descrição do conteúdo desta seção. Explique os benefícios ou características.'
        }
      };
    case 'video-grid':
      return {
        id,
        type: 'video-grid',
        order,
        data: {
          title: 'Veja o que nossos clientes dizem',
          videos: [],
          columns: 3
        }
      };
    case 'benefits':
      return {
        id,
        type: 'benefits',
        order,
        data: {
          title: 'Por que escolher',
          style: 'cards',
          items: [
            { id: '1', title: 'Resultado Garantido', description: 'Transformação real', icon: 'Sparkles' },
            { id: '2', title: 'Suporte 24h', description: 'Equipe pronta para ajudar', icon: 'MessageCircle' },
            { id: '3', title: 'Bônus Exclusivos', description: 'Materiais extras', icon: 'Gift' }
          ]
        }
      };
    case 'faq':
      return {
        id,
        type: 'faq',
        order,
        data: {
          title: 'Perguntas Frequentes',
          items: [
            { id: '1', question: 'Como funciona a garantia?', answer: 'Você tem 7 dias para testar.' },
            { id: '2', question: 'Quanto tempo tenho acesso?', answer: 'Acesso vitalício!' }
          ]
        }
      };
    case 'testimonials':
      return {
        id,
        type: 'testimonials',
        order,
        data: {
          title: 'O que nossos clientes dizem',
          items: [
            { id: '1', name: 'Maria Silva', text: 'Mudou minha vida!', avatarUrl: '' },
            { id: '2', name: 'João Santos', text: 'Melhor investimento!', avatarUrl: '' }
          ],
          layout: 'grid'
        }
      };
    case 'cta':
      return {
        id,
        type: 'cta',
        order,
        data: {
          text: 'QUERO AGORA',
          url: '',
          size: 'large'
        }
      };
    case 'spacer':
      return {
        id,
        type: 'spacer',
        order,
        data: {
          height: 'md'
        }
      };
  }
};

// Helper to migrate old SalesPageContent to new format
export const migrateToSectionBuilder = (
  oldContent: any,
  headline?: string,
  subheadline?: string,
  videoUrl?: string,
  imageUrl?: string,
  ctaText?: string,
  ctaUrl?: string
): SectionBuilderContent => {
  const sections: ContentSection[] = [];
  let order = 0;

  // Create Hero section from old data
  sections.push({
    id: `section_hero_${Date.now()}`,
    type: 'hero',
    order: order++,
    data: {
      headline: headline || 'Transforme Sua Vida Hoje',
      subheadline: subheadline || '',
      mediaType: oldContent?.heroMediaType || 'image',
      videoUrl: videoUrl || '',
      imageUrl: imageUrl || '',
      carouselImages: oldContent?.carouselImages || [],
      carouselInterval: oldContent?.carouselInterval || 4,
      showCta: true,
      ctaText: ctaText || 'QUERO AGORA',
      ctaUrl: ctaUrl || ''
    }
  });

  // Benefits section
  if (oldContent?.benefits && oldContent.benefits.length > 0) {
    sections.push({
      id: `section_benefits_${Date.now()}`,
      type: 'benefits',
      order: order++,
      data: {
        title: 'Por que escolher nosso produto?',
        style: 'cards',
        items: oldContent.benefits.map((b: any, i: number) => ({
          id: String(i),
          title: b.title,
          description: b.description,
          icon: b.icon,
          emoji: b.emoji
        }))
      }
    });
  }

  // Testimonials section
  if (oldContent?.testimonials && oldContent.testimonials.length > 0) {
    sections.push({
      id: `section_testimonials_${Date.now()}`,
      type: 'testimonials',
      order: order++,
      data: {
        title: 'O que nossos clientes dizem',
        items: oldContent.testimonials.map((t: any, i: number) => ({
          id: String(i),
          name: t.name,
          text: t.text,
          avatarUrl: t.avatarUrl
        })),
        layout: 'grid'
      }
    });
  }

  // FAQ section
  if (oldContent?.faqEnabled && oldContent?.faqItems && oldContent.faqItems.length > 0) {
    sections.push({
      id: `section_faq_${Date.now()}`,
      type: 'faq',
      order: order++,
      data: {
        title: oldContent.faqTitle || 'Perguntas Frequentes',
        items: oldContent.faqItems.map((f: any, i: number) => ({
          id: String(i),
          question: f.question,
          answer: f.answer
        }))
      }
    });
  }

  // Final CTA
  sections.push({
    id: `section_cta_${Date.now()}`,
    type: 'cta',
    order: order++,
    data: {
      text: ctaText || 'QUERO AGORA',
      url: ctaUrl || '',
      size: 'large'
    }
  });

  return {
    sections,
    scarcityEnabled: oldContent?.scarcityEnabled,
    scarcityText: oldContent?.scarcityText
  };
};
