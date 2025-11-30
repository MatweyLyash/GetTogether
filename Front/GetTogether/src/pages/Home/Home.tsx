import { useState, useEffect, useRef } from 'react';
import { Box, Heading, Text, Button, SimpleGrid, Input, Flex, useToast, useBreakpointValue, Icon, VStack, Skeleton, SkeletonText, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { SearchIcon } from '@chakra-ui/icons';
import Slider from 'react-slick';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import EventCard from '../../components/EventCard/EventCard';
import { getCategories, getEvents } from '../../api/api';
import { Event } from '../../types/event';
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
  image?: string | null;
  category_id: number;
  price: number | string;
  capacity: number;
  telegram_chat_link?: string | null;
  creator_id?: string | number;
  created_at?: string;
  updated_at?: string;
  organizer_verification_key?: string | null;
  telegram_chat_id?: string | null;
  deletedAt?: string | null;
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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

function Home() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [searchQueryByTitle, setSearchQueryByTitle] = useState('');
  const [searchQueryByLocation, setSearchQueryByLocation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const sliderRef = useRef<Slider>(null);
  const toast = useToast();
  const navigate = useNavigate();
  
  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const headingSize = useBreakpointValue({ base: 'lg', md: 'xl', lg: '2xl' });
  const subHeadingSize = useBreakpointValue({ base: 'md', md: 'lg' });
  const buttonSize = useBreakpointValue({ base: 'md', md: 'lg' });
  const categoryColumns = useBreakpointValue({ base: 2, sm: 3, md: 4 });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
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

        const mappedEvents: Event[] = eventData
          .filter((event: EventApiResponse) => {
            const eventDate = new Date(event.date);
            const currentDate = new Date();
            return eventDate > currentDate && !event.deletedAt;
          })
          .map((event: EventApiResponse) => ({
            id: String(event.id),
            title: event.title,
            description: event.description,
            date: event.date,
            price: typeof event.price === 'string' ? parseFloat(event.price) : event.price,
            capacity: event.capacity,
            location: event.location,
            image: event.image ?? null,
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
            deletedAt: event.deletedAt ?? null,
            category_id: event.category_id,
            telegram_chat_link: event.telegram_chat_link ?? null,
            telegram_chat_id: event.telegram_chat_id ?? null,
            organizer_verification_key: event.organizer_verification_key ?? null,
            created_at: event.created_at ?? null,
            updated_at: event.updated_at ?? null
          }));

        setCategories(mappedCategories);
        setEvents(mappedEvents);
        setReviews(reviewData);
      } catch (error: any) {
        setIsLoading(false);
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box className={styles.content}>
          {/* Hero Banner with search */}
          <Box 
            className={styles.banner} 
            bgGradient="linear(135deg, #E7EBFC 0%, #FEFEFE 50%, #E7EBFC 100%)"
            position="relative"
            overflow="hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <VStack spacing={{ base: 4, md: 6 }} align="center">
                <Heading 
                  as="h1" 
                  size={headingSize} 
                  textAlign="center"
                  bgGradient="linear(to-r, #2E4FD7, #5A7AE8)"
                  bgClip="text"
                >
                  Найдите своё следующее приключение
                </Heading>
                <Text 
                  fontSize={{ base: 'md', md: 'lg' }} 
                  color="gray.600"
                  textAlign="center"
                  maxW="600px"
                >
                  Концерты, мастер-классы, вечеринки — всё в одном месте с GetTogether
                </Text>
                <Flex 
                  gap={{ base: 3, md: 4 }} 
                  flexDir={{ base: 'column', md: 'row' }}
                  w="100%"
                  maxW="700px"
                  mt={2}
                >
                  <InputGroup size={buttonSize} flex={1}>
                    <InputLeftElement pointerEvents="none">
                      <SearchIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Поиск по названию"
                      value={searchQueryByTitle}
                      onChange={(e) => setSearchQueryByTitle(e.target.value)}
                      bg="white"
                      borderRadius="lg"
                      borderColor="gray.200"
                      _hover={{ borderColor: '#2E4FD7' }}
                      _focus={{ borderColor: '#2E4FD7', boxShadow: '0 0 0 1px #2E4FD7' }}
                    />
                  </InputGroup>
                  <InputGroup size={buttonSize} flex={1}>
                    <InputLeftElement pointerEvents="none">
                      <Icon viewBox="0 0 24 24" color="gray.400">
                        <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </Icon>
                    </InputLeftElement>
                    <Input
                      placeholder="Поиск по месту"
                      value={searchQueryByLocation}
                      onChange={(e) => setSearchQueryByLocation(e.target.value)}
                      bg="white"
                      borderRadius="lg"
                      borderColor="gray.200"
                      _hover={{ borderColor: '#2E4FD7' }}
                      _focus={{ borderColor: '#2E4FD7', boxShadow: '0 0 0 1px #2E4FD7' }}
                    />
                  </InputGroup>
                  <Button
                    bg="#2E4FD7"
                    color="white"
                    _hover={{ bg: '#1e3fa9', transform: 'translateY(-2px)' }}
                    _active={{ transform: 'translateY(0)' }}
                    size={buttonSize}
                    onClick={handleSearch}
                    leftIcon={<SearchIcon />}
                    borderRadius="lg"
                    transition="all 0.2s"
                    boxShadow="md"
                    minW={{ base: 'full', md: '120px' }}
                  >
                    Поиск
                  </Button>
                </Flex>
              </VStack>
            </motion.div>
          </Box>

          {/* Categories */}
          <Box className={styles.categories}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Heading as="h3" size={subHeadingSize} mb={4}>
                Популярные категории
              </Heading>
              {isLoading ? (
                <SimpleGrid columns={categoryColumns} spacing={4}>
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} height="60px" borderRadius="lg" />
                  ))}
                </SimpleGrid>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <SimpleGrid columns={categoryColumns} spacing={4}>
                    {categories.map((cat, index) => (
                      <motion.div
                        key={cat.id}
                        variants={itemVariants}
                        whileHover={{ scale: 1.05, y: -5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link
                          to="/events"
                          state={{ category: String(cat.id) }}
                        >
                          <Box 
                            bg="white" 
                            p={4} 
                            borderRadius="lg" 
                            boxShadow="sm" 
                            textAlign="center"
                            border="1px solid"
                            borderColor="gray.100"
                            _hover={{ 
                              boxShadow: 'lg', 
                              borderColor: '#2E4FD7',
                              bg: '#F8F9FE'
                            }}
                            transition="all 0.2s"
                          >
                            <Text fontWeight="medium" color="gray.700">{cat.category_name}</Text>
                          </Box>
                        </Link>
                      </motion.div>
                    ))}
                  </SimpleGrid>
                </motion.div>
              )}
            </motion.div>
          </Box>

          {/* Карусель */}
          <Box className={styles.carousel}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Heading as="h3" size={subHeadingSize} mb={4}>
                Ближайшие мероприятия
              </Heading>
              {isLoading ? (
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  {[...Array(3)].map((_, i) => (
                    <Box key={i} p={4} bg="white" borderRadius="lg" boxShadow="sm">
                      <Skeleton height="200px" borderRadius="md" mb={4} />
                      <SkeletonText noOfLines={3} spacing={2} />
                    </Box>
                  ))}
                </SimpleGrid>
              ) : events.length > 0 ? (
                <Slider ref={sliderRef} {...slickSettings}>
                  {events.map((event) => (
                    <div key={event.id} className={styles.slide}>
                      <motion.div
                        whileHover={{ scale: 1.03, y: -5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <EventCard event={event} />
                      </motion.div>
                    </div>
                  ))}
                </Slider>
              ) : (
                <Box textAlign="center" py={10} bg="gray.50" borderRadius="lg">
                  <Text color="gray.500">Нет предстоящих мероприятий</Text>
                </Box>
              )}
            </motion.div>
          </Box>

          {/* Отзывы */}
          <Box className={styles.reviews}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Heading as="h3" size={subHeadingSize} mb={4}>
                Что говорят участники
              </Heading>
              {isLoading ? (
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  {[...Array(3)].map((_, i) => (
                    <Box key={i} p={4} bg="white" borderRadius="lg" boxShadow="sm">
                      <SkeletonText noOfLines={4} spacing={3} />
                    </Box>
                  ))}
                </SimpleGrid>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    {reviews.map((review, index) => (
                      <motion.div
                        key={review.id}
                        variants={itemVariants}
                        whileHover={{ y: -5 }}
                      >
                        <Box 
                          bg="white" 
                          p={5} 
                          borderRadius="lg" 
                          boxShadow="sm"
                          border="1px solid"
                          borderColor="gray.100"
                          _hover={{ boxShadow: 'md' }}
                          transition="all 0.2s"
                        >
                          <Text fontWeight="bold" color="#2E4FD7">{review.user.login}</Text>
                          <Text fontSize="sm" color="gray.500" mb={2}>
                            {events.find((e) => e.id === review.event_id)?.title}
                          </Text>
                          <Text color="gray.700" mb={2}>{review.comment}</Text>
                          <Text color="#FFB800" fontSize="lg">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</Text>
                        </Box>
                      </motion.div>
                    ))}
                  </SimpleGrid>
                </motion.div>
              )}
            </motion.div>
          </Box>

          {/* Призыв к регистрации */}
          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Box 
                className={styles.cta} 
                p={{ base: 6, md: 10 }} 
                textAlign="center" 
                bgGradient="linear(135deg, #E7EBFC 0%, #D5DFFB 100%)"
                borderRadius="xl"
              >
                <VStack spacing={4}>
                  <Heading as="h3" size={subHeadingSize}>
                    Присоединяйтесь к GetTogether!
                  </Heading>
                  <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.600" maxW="500px">
                    Создавайте и посещайте уникальные события
                  </Text>
                  <Link to="/login">
                    <Button
                      bg="#2E4FD7"
                      color="white"
                      _hover={{ bg: '#1e3fa9', transform: 'translateY(-2px)' }}
                      _active={{ transform: 'translateY(0)' }}
                      size={buttonSize}
                      borderRadius="lg"
                      boxShadow="md"
                      transition="all 0.2s"
                      px={8}
                    >
                      Зарегистрироваться
                    </Button>
                  </Link>
                </VStack>
              </Box>
            </motion.div>
          )}
        </Box>
      </motion.div>
      <Footer />
    </Box>
  );
}

export default Home;