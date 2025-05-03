export interface Event {
    id: string;
    title: string;
    description: string;
    category: { id: string; category_name: string };
    date: string;
    price: number;
    free_slots: number;
    address: string;
    creator: { id: string; login: string; telegram: string };
    reviews?: Array<{
      id: string;
      rating: number;
      comment: string;
      created_at: string;
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