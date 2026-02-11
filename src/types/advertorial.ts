export type AdvertorialTheme = 'portal-news' | 'story-blog' | 'review-tech';

export interface FakeComment {
  name: string;
  text: string;
  timeAgo: string;
  likes: number;
}

export interface ComparisonProduct {
  name: string;
  rating: number; // 1-5
  pros: string[];
  cons: string[];
  isWinner: boolean;
}

export interface AdvertorialContent {
  theme: AdvertorialTheme;
  headline: string;
  subheadline: string;
  authorName: string;
  authorImageUrl: string;
  authorBio: string;
  publishDate: string; // empty = auto (today)
  coverImageUrl: string;
  bodyHtml: string; // rich text body
  bodyImages: string[]; // additional body images
  ctaText: string;
  ctaUrl: string;
  ctaColor: string;
  // Toggles
  fakeCommentsEnabled: boolean;
  fakeComments: FakeComment[];
  backRedirectEnabled: boolean;
  backRedirectUrl: string;
  urgencyBarEnabled: boolean;
  urgencyBarText: string;
  // Review theme specific
  comparisonEnabled: boolean;
  comparisonProducts: ComparisonProduct[];
  // Portal News specific
  newsCategory: string;
  navCategories: string[];
  // Theme Customization
  themePreset: string;
  headlineColor: string;
  bodyTextColor: string;
  backgroundColor: string;
  accentColor: string;
  fontFamily: string;
}

export const defaultAdvertorialContent: AdvertorialContent = {
  theme: 'portal-news',
  headline: 'Novo Método Revolucionário Está Mudando a Vida de Milhares de Brasileiros',
  subheadline: 'Especialistas confirmam: técnica simples pode transformar seus resultados em poucos dias',
  authorName: 'Redação Especial',
  authorImageUrl: '',
  authorBio: 'Equipe de jornalismo investigativo especializada em saúde e bem-estar.',
  publishDate: '',
  coverImageUrl: '',
  bodyHtml: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p><p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>',
  bodyImages: [],
  ctaText: '👉 QUERO CONHECER AGORA',
  ctaUrl: '',
  ctaColor: '#22C55E',
  fakeCommentsEnabled: true,
  fakeComments: [
    { name: 'Maria S.', text: 'Funcionou pra mim! Recomendo demais 👏', timeAgo: '2 horas', likes: 47 },
    { name: 'Carlos R.', text: 'Melhor decisão que já tomei. Resultados em 3 dias.', timeAgo: '5 horas', likes: 31 },
    { name: 'Ana P.', text: 'Achei que era mentira, mas funciona mesmo!', timeAgo: '1 dia', likes: 89 },
  ],
  backRedirectEnabled: false,
  backRedirectUrl: '',
  urgencyBarEnabled: true,
  urgencyBarText: '🔴 {count} pessoas lendo este artigo agora',
  comparisonEnabled: true,
  comparisonProducts: [
    { name: 'Nosso Produto', rating: 5, pros: ['Resultado rápido', 'Preço acessível', 'Garantia total'], cons: [], isWinner: true },
    { name: 'Concorrente A', rating: 2, pros: ['Conhecido'], cons: ['Caro', 'Demora', 'Sem garantia'], isWinner: false },
  ],
  newsCategory: 'Saúde',
  navCategories: ['Política', 'Economia', 'Saúde', 'Tecnologia', 'Esportes'],
  themePreset: 'default',
  headlineColor: '#111827',
  bodyTextColor: '#374151',
  backgroundColor: '#FFFFFF',
  accentColor: '#DC2626',
  fontFamily: 'sans-serif',
};
