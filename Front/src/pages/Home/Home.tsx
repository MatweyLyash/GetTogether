import { useState, useEffect } from 'react';
import { Box, useToast } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getCategories, getEvents } from '../../api/api';
import { Event } from '../../types/event';
import { useAuth } from '../../AuthContext/AuthContext';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { HeroBanner } from '../../components/Home/HeroBanner';
import { CategoriesGrid } from '../../components/Home/CategoriesGrid';
import { EventsCarousel } from '../../components/Home/EventsCarousel';
import { ReviewsSection } from '../../components/Home/ReviewsSection';
import { RegistrationCTA } from '../../components/Home/RegistrationCTA';
import { MapWidget } from '../../components/Map/MapWidget';
import { mapPromotion } from '../../utils/promotion';
import styles from './Home.module.scss';

interface Category {
  id: number;
  category_name: string;
}

interface EventApiResponse {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image?: string | null;
  category_id: number;
  price: number | string;
  capacity: number;
  telegram_chat_link?: string | null;
  telegram_chat_id?: string | null;
  organizer_verification_key?: string | null;
  created_at?: string;
  updated_at?: string;
  creator_id?: string | number;
  creator?: {
    id?: string | number;
    login?: string | null;
    telegram?: string | null;
  } | null;
  latitude?: number | null;
  longitude?: number | null;
  deletedAt?: string | null;
  promotions?: Array<{ id?: number; type: string; expires_at: string }> | null;
}

interface Review {
  id: string;
  event_id: string;
  rating: number;
  comment: string;
  user: {
    id: string;
    login: string;
  };
}

const mockReviews: Review[] = [
  { id: '1', event_id: '1', rating: 5, comment: 'Отличный концерт!', user: { id: '6', login: 'Fan1' } },
  { id: '2', event_id: '2', rating: 4, comment: 'Вкусная паста!', user: { id: '7', login: 'Foodie' } },
  { id: '3', event_id: '3', rating: 5, comment: 'Расслабляюще!', user: { id: '8', login: 'Yogi' } },
];

function Home() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchQueryByTitle, setSearchQueryByTitle] = useState('');
  const [searchQueryByLocation, setSearchQueryByLocation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [catData, eventData] = await Promise.all([getCategories(), getEvents()]);

        const mappedCategories: Category[] = catData.map((cat) => ({
          id: cat.id,
          category_name: cat.category_name,
        }));

        const mappedEvents: Event[] = eventData
          .filter((event: EventApiResponse) => {
            const eventDate = new Date(event.date);
            const currentDate = new Date();
            return eventDate > currentDate && !event.deletedAt;
          })
          .map((event: EventApiResponse) => {
            const creatorId = String(event.creator?.id ?? event.creator_id ?? '0');
            const creatorLogin = event.creator?.login?.trim() || 'Организатор';
            const creatorTelegram = event.creator?.telegram?.trim() || event.telegram_chat_link || null;

            return {
              id: String(event.id),
              title: event.title,
              description: event.description,
              date: event.date,
              price: typeof event.price === 'string' ? parseFloat(event.price) : event.price,
              capacity: event.capacity,
              location: event.location,
              latitude: event.latitude ?? null,
              longitude: event.longitude ?? null,
              image: event.image ?? null,
              category: {
                id: String(event.category_id),
                category_name:
                  mappedCategories.find((cat) => cat.id === event.category_id)?.category_name ||
                  `Категория ${event.category_id}`,
              },
              creator: {
                id: creatorId,
                login: creatorLogin,
                telegram: creatorTelegram || '',
              },
              reviews: [],
              deletedAt: event.deletedAt ?? null,
              category_id: event.category_id,
              telegram_chat_link: event.telegram_chat_link ?? null,
              telegram_chat_id: event.telegram_chat_id ?? null,
              organizer_verification_key: event.organizer_verification_key ?? null,
              created_at: event.created_at ?? null,
              updated_at: event.updated_at ?? null,
              promotion: mapPromotion(event.promotions),
            };
          });

        setCategories(mappedCategories);
        setEvents(mappedEvents);
        setReviews(mockReviews);
      } catch (error: any) {
        toast({
          title: 'Ошибка загрузки данных',
          description: error.message || 'Не удалось загрузить данные',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleSearch = () => {
    if (!searchQueryByTitle && !searchQueryByLocation) {
      toast({
        title: 'Ошибка',
        description: 'Введите название или локацию для поиска',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    navigate('/events', {
      state: {
        title: searchQueryByTitle,
        location: searchQueryByLocation,
      },
    });
  };

  return (
    <Box className={styles.container}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
          body { font-family: 'Inter', sans-serif; }
          .slick-track {
            display: flex;
            align-items: stretch;
            padding-top: 10px;
            padding-bottom: 10px;
          }
          .slick-slide {
            height: auto;
          }
          .slick-slide > div {
            height: 100%;
          }
        `}
      </style>
      <Header />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box className={styles.content}>
          <HeroBanner
            searchQueryByTitle={searchQueryByTitle}
            searchQueryByLocation={searchQueryByLocation}
            onSearchTitleChange={setSearchQueryByTitle}
            onSearchLocationChange={setSearchQueryByLocation}
            onSearch={handleSearch}
          />

          <CategoriesGrid categories={categories} isLoading={isLoading} />

          <EventsCarousel events={events} isLoading={isLoading} />

          <MapWidget events={events} />

          <ReviewsSection reviews={reviews} events={events} isLoading={isLoading} />

          {!user && <RegistrationCTA />}
        </Box>
      </motion.div>
      <Footer />
    </Box>
  );
}

export default Home;
