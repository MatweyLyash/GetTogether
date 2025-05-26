export interface Event {
    id: string;
    title: string;
    description: string;
    category: { id: string; category_name: string };
    date: string;
    price: number;
    capacity: number;
    location: string;
    image: string | null;
    deletedAt: string | null;
    telegram_chat_link:string|null;
    creator: { id: string; login: string; telegram: string };
    reviews?: Array<{
      id: string;
      rating: number;
      comment: string;
      createdAt: string;
      reviewUser: { id: string; login: string };
    }>;
  }
  
  export interface EventResponse {
    event: Event;
    registration: { status: number; telegram_invite_link: string | null } | null;
  }

  export interface Category {
    id: string;
    category_name: string;
  }