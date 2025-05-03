import { useState, useEffect, useRef } from 'react';
import { Box, Heading, Text, Button, SimpleGrid, Select, Input, Flex, useToast } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import EventCard from '../../components/EventCard/EventCard';
import { Event, Category } from '../../types/event';
import styles from './Home.module.scss';

// Имитация API (заменить на реальный бэкенд)
const api = {
  getCategories: async (): Promise<Category[]> => {
    return [
      { id: '1', category_name: 'Музыка' },
      { id: '2', category_name: 'Кулинария' },
      { id: '3', category_name: 'Спорт' },
      { id: '4', category_name: 'Наука' },
    ];
  },
  getEvents: async (): Promise<Event[]> => {
    return [
      {
        id: '1',
        title: 'Концерт рок-группы',
        description: 'Живое выступление',
        category: { id: '1', category_name: 'Музыка' },
        date: '2025-06-01T19:00:00Z',
        price: 1500,
        free_slots: 50,
        address: 'Москва, Клуб 123',
        creator: { id: '1', login: 'RockStar', telegram: '@RockStar' },
      },
      {
        id: '2',
        title: 'Мастер-класс по кулинарии',
        description: 'Готовим пасту',
        category: { id: '2', category_name: 'Кулинария' },
        date: '2025-06-02T18:00:00Z',
        price: 2000,
        free_slots: 10,
        address: 'Москва, Кулинарная студия',
        creator: { id: '2', login: 'ChefMaster', telegram: '@ChefMaster' },
      },
      {
        id: '3',
        title: 'Йога на закате',
        description: 'Расслабляющая практика',
        category: { id: '3', category_name: 'Спорт' },
        date: '2025-06-03T20:00:00Z',
        price: 1000,
        free_slots: 20,
        address: 'Москва, Парк Горького',
        creator: { id: '3', login: 'YogaGuru', telegram: '@YogaGuru' },
      },
      {
        id: '4',
        title: 'Лекция по астрономии',
        description: 'Звезды и галактики',
        category: { id: '4', category_name: 'Наука' },
        date: '2025-06-04T19:00:00Z',
        price: 500,
        free_slots: 30,
        address: 'Москва, Планетарий',
        creator: { id: '4', login: 'StarWatcher', telegram: '@StarWatcher' },
      },
      {
        id: '5',
        title: 'Вечеринка 80-х',
        description: 'Танцы и ретро',
        category: { id: '5', category_name: 'Вечеринки' },
        date: '2025-06-05T21:00:00Z',
        price: 800,
        free_slots: 40,
        address: 'Москва, Бар Ретро',
        creator: { id: '5', login: 'PartyKing', telegram: '@PartyKing' },
      },
    ];
  },
  getReviews: async () => {
    return [
      { id: '1', event_id: '1', rating: 5, comment: 'Отличный концерт!', user: { id: '6', login: 'Fan1' } },
      { id: '2', event_id: '2', rating: 4, comment: 'Вкусная паста!', user: { id: '7', login: 'Foodie' } },
      { id: '3', event_id: '3', rating: 5, comment: 'Расслабляюще!', user: { id: '8', login: 'Yogi' } },
    ];
  },
};

function Home() {
  const [isAuthenticated] = useState(false); // Заглушка для авторизации
  const [isOrganizer] = useState(true); // Заглушка для роли организатора
  const [categories, setCategories] = useState<Category[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const sliderRef = useRef<Slider>(null);
  const toast = useToast();

  // Загрузка данных с бэка
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catData, eventData, reviewData] = await Promise.all([
          api.getCategories(),
          api.getEvents(),
          api.getReviews(),
        ]);
        setCategories(catData);
        setEvents(eventData);
        setReviews(reviewData);
      } catch (error) {
        toast({
          title: 'Ошибка загрузки данных',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };
    fetchData();
  }, [toast]);

  // Настройки для react-slick
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

  // Обработчик поиска
  const handleSearch = () => {
    if (!searchQuery) return;
    // Здесь будет запрос на бэк с searchQuery и selectedCategory
    toast({
      title: 'Поиск',
      description: `Ищем события по запросу "${searchQuery}"`,
      status: 'info',
      duration: 3000,
      isClosable: true,
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
            .slick-list{
            }
        `}
      </style>
      <Header />
      <Box className={styles.content}>
        {/* Баннер с поиском */}
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg="white"
                size="lg"
              />
              <Select
                placeholder="Выберите категорию"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                bg="white"
                size="lg"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
              </Select>
              <Button
                bg="#2E4FD7"
                color="white"
                _hover={{ bg: '#1e3fa9' }}
                size="lg"
                onClick={handleSearch}
              >
                Найти
              </Button>
            </Flex>
          </motion.div>
        </Box>

        {/* Категории */}
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
                <Link to={`/events?category=${cat.id}`}>
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
        <div className={styles.slide}>
              <motion.div
                key={event.id}
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
            <Link to="/signup">
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
      </Box>
      <Footer />
    </Box>
  );
}

export default Home;