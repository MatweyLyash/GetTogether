export interface Event {
  id: string;
  title: string;
  description: string;
  category: { id: string; category_name: string };
  date: string;
  price: number;
  capacity: number;
  location: string;
  latitude: number | null;
  longitude: number | null;
  image: string | null;
  deletedAt: string | null;
  telegram_chat_link: string | null;
  creator: { id: string; login: string; telegram: string };
  promotion: { type: 'one_time' | 'boost' | 'repeat' | 'premium'; expires_at: string } | null;
  reviews?: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    reviewUser: { id: string; login: string };
  }>;
  tags?: { id: number; name: string }[];
}

export interface EventResponse {
  event: Event;
  registration: { id: string; status: number; telegram_invite_link: string | null; qr_code_used?: boolean } | null;
  waitlist?: { id: number; notification_method: 'telegram' | 'browser'; notified_at?: string | null } | null;
}

export interface Category {
  id: string;
  category_name: string;
}
