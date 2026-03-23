export interface Tag {
  id: number;
  name: string;
}

export interface CabinetEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category_id: number;
  price: string;
  capacity: number;
  telegram_chat_link: string | null;
  organizer_verification_key?: string | null;
  deletedAt?: string | null;
  image?: any;
  reviews?: any[];
  tags?: Tag[];
  category: { category_name: string };
  creator?: { id: string; login: string };
}

export interface CabinetEventRegistration {
  id: string;
  event_id: string;
  status_id: number;
  qr_code?: string | null;
  telegram_invite_link?: string | null;
  Event: CabinetEvent;
}

export interface CabinetOrganizerRequest {
  id: string;
  status_id: number;
  created_at?: string | null;
  createdAt?: string | null;
}

export interface CabinetEventRequest {
  id: string;
  user_id: string;
  event_id: string;
  status_id: number;
  user: { login: string; telegram: string | null };
}

export interface EventFormData {
  title: string;
  description: string;
  date: string;
  location: string;
  category_id: string;
  price: string;
  capacity: string;
  telegram_chat_link: string;
  tags: number[];
}
