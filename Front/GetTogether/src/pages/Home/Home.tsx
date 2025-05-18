import { useState, useEffect, useRef } from 'react';
import { Box, Heading, Text, Button, SimpleGrid, Input, Flex, useToast } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import Slider from 'react-slick';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import EventCard from '../../components/EventCard/EventCard';
import { getCategories, getEvents } from '../../api/api';
import { Event as EventCardEvent } from '../../types/event';
import styles from './Home.module.scss';
import { useAuth } from '../../AuthContext/AuthContext';

// Define Category type
interface Category {
  id: number;
  category_name: string;
}

// Define Event type for API response
interface EventApiResponse {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image: string | null;
  category_id: number;
  price: number | string;
  capacity: number;
  telegram_chat_link: string | null;
  creator_id?: string | number;
  created_at?: string;
  updated_at?: string;
  organizer_verification_key?: string;
  telegram_chat_id?: string | null;
}

// Mock API for reviews
const api = {
  getReviews: async () => {
    return [
      { id: '1', event_id: '1', rating: 5, comment: 'Отличный концерт!', user: { id: '6', login: 'Fan1' } },
      { id: '2', event_id: '2', rating: 4, comment: 'Вкусная паста!', user: { id: '7', login: 'Foodie' } },
      { id: '3', event_id: '3', rating: 5, comment: 'Расслабляюще!', user: { id: '8', login: 'Yogi' } },
    ];
  },
};

function Home() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [events, setEvents] = useState<EventCardEvent[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [searchQueryByTitle, setSearchQueryByTitle] = useState('');
  const [searchQueryByLocation, setSearchQueryByLocation] = useState('');
  const sliderRef = useRef<Slider>(null);
  const toast = useToast();
  const navigate = useNavigate();

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catData, eventData, reviewData] = await Promise.all([
          getCategories(),
          getEvents(),
          api.getReviews(),
        ]);

        const mappedCategories: Category[] = catData.map((cat) => ({
          id: cat.id,
          category_name: cat.category_name,
        }));

        const mappedEvents: EventCardEvent[] = eventData.map((event: EventApiResponse) => ({
          id: String(event.id),
          title: event.title,
          description: event.description,
          date: event.date,
          price: typeof event.price === 'string' ? parseFloat(event.price) : event.price,
          capacity: event.capacity,
          location: event.location,
          image: event.image,
          category: {
            id: String(event.category_id),
            category_name: mappedCategories.find((cat) => cat.id === event.category_id)?.category_name ||
                          `Категория ${event.category_id}`,
          },
          creator: {
            id: String(event.creator_id || '0'),
            login: `Organizer_${event.creator_id || '0'}`,
            telegram: event.telegram_chat_link || `@Organizer_${event.creator_id || '0'}`,
          },
          reviews: [],
        }));

        setCategories(mappedCategories);
        setEvents(mappedEvents);
        setReviews(reviewData);
      } catch (error: any) {
        toast({
          title: 'Ошибка загрузки данных',
          description: error.message || 'Не удалось загрузить данные',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };
    fetchData();
  }, [toast]);

  // Slick settings
  const slickSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    dotsClass: 'slick-dots custom-dots',
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2, slidesToScroll: 1, arrows: true },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1, slidesToScroll: 1, arrows: false, dots: true },
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1, slidesToScroll: 1, arrows: false, dots: true },
      },
    ],
  };

  // Handle search
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

    // Navigate to /events with search parameters in state
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
            align-items: center;
            padding-top:10px;
            padding-bottom:10px;
          }
          @media(max-width: 768px) {
            .slick-track {
              height: 500px;
            }
            .slick-list {
              height: 520px;
            }
          }
        `}
      </style>
      <Header />
      <Box className={styles.content}>
        {/* Banner with search */}
        <Box className={styles.banner} bgGradient="linear(to-r, #E7EBFC, #FEFEFE)" p={{ base: '2rem', md: '4rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Heading as="h1" size={{ base: 'xl', md: '2xl' }} mb="1rem">
              Найдите своё следующее приключение
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }} mb="2rem">
              Концерты, мастер-классы, вечеринки — всё в одном месте с GetTogether
            </Text>
            <Flex gap="1rem" flexDir={{ base: 'column', md: 'row' }}>
              <Input
                placeholder="Поиск по названию"
                value={searchQueryByTitle}
                onChange={(e) => setSearchQueryByTitle(e.target.value)}
                bg="white"
                size="lg"
              />
              <Input
                placeholder="Поиск по месту проведения"
                value={searchQueryByLocation}
                onChange={(e) => setSearchQueryByLocation(e.target.value)}
                bg="white"
                size="lg"
              />
              <Button
                bg="#2E4FD7"
                color="white"
                _hover={{ bg: '#1e3fa9' }}
                size="lg"
                onClick={handleSearch}
              >
                Поиск
              </Button>
            </Flex>
          </motion.div>
        </Box>

        {/* Categories */}
        <Box className={styles.categories} p={{ base: '1rem', md: '2rem' }}>
          <Heading as="h3" size={{ base: 'md', md: 'lg' }} mb="1rem">
            Популярные категории
          </Heading>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing="1rem">
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to="/events"
                  state={{ category: String(cat.id) }}
                >
                  <Box bg="#FEFEFE" p="1rem" borderRadius="md" boxShadow="sm" textAlign="center">
                    <Text fontWeight="medium">{cat.category_name}</Text>
                  </Box>
                </Link>
              </motion.div>
            ))}
          </SimpleGrid>
        </Box>

        {/* Карусель */}
        <Box className={styles.carousel} p={{ base: '1rem', md: '2rem' }}>
          <Heading as="h3" size={{ base: 'md', md: 'lg' }} mb="1rem">
            Ближайшие мероприятия
          </Heading>
          <Slider ref={sliderRef} {...slickSettings}>
            {events.map((event) => (
              <div key={event.id} className={styles.slide}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                >
                  <EventCard event={event} />
                </motion.div>
              </div>
            ))}
          </Slider>
        </Box>

        {/* Отзывы */}
        <Box className={styles.reviews} p={{ base: '1rem', md: '2rem' }}>
          <Heading as="h3" size={{ base: 'md', md: 'lg' }} mb="1rem">
            Что говорят участники
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing="1rem">
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Box bg="#FEFEFE" p="1rem" borderRadius="md" boxShadow="sm">
                  <Text fontWeight="bold">{review.user.login}</Text>
                  <Text fontSize="sm" mb="0.5rem">
                    {events.find((e) => e.id === review.event_id)?.title}
                  </Text>
                  <Text>{review.comment}</Text>
                  <Text color="#2E4FD7">{'★'.repeat(review.rating)}</Text>
                </Box>
              </motion.div>
            ))}
          </SimpleGrid>
        </Box>

        {/* Призыв к регистрации */}
        {!user && (
                  <Box className={styles.cta} p={{ base: '2rem', md: '4rem' }} textAlign="center" bg="#E7EBFC">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Heading as="h3" size={{ base: 'md', md: 'lg' }} mb="1rem">
                      Присоединяйтесь к GetTogether!
                    </Heading>
                    <Text fontSize={{ base: 'md', md: 'lg' }} mb="2rem">
                      Создавайте и посещайте уникальные события
                    </Text>
                    <Link to="/register">
                      <Button
                        bg="#2E4FD7"
                        color="white"
                        _hover={{ bg: '#1e3fa9' }}
                        size={{ base: 'md', md: 'lg' }}
                      >
                        Зарегистрироваться
                      </Button>
                    </Link>
                  </motion.div>
                </Box>
        )}
      </Box>
      <Footer />
    </Box>
  );
}

export default Home;