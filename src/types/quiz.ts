export interface QuizOption {
  label: string;
  value: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  imageUrl?: string;
}

export interface Quiz {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  description: string | null;
  questions: QuizQuestion[];
  redirect_url: string | null;
  primary_color: string;
  is_published: boolean | null;
  views: number | null;
  created_at: string;
  updated_at: string;
}
