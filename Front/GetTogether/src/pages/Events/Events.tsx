import { useState, useEffect } from 'react';
import {
  Box,
  Text,
  SimpleGrid,
  Input,
  Select,
  Button,
  Flex,
  VStack,
  Heading,
  Spinner,
  useToast,
  FormControl,
  FormLabel,
  useBreakpointValue,
  Collapse,
  useDisclosure,
  IconButton,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import EventCard from '../../components/EventCard/EventCard';
import { getEvents, getCategories } from '../../api/api';
import { Event } from '../../types/event';
import styles from './Events.module.scss';

// Define Category type
interface Category {
  id: number;
  category_name: string;
}

// Define API Event type
interface ApiEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category_id: number;
  price: number | string;
  capacity: number;
  image?: string | null;
  telegram_chat_link?: string | null;
  creator_id?: string | number;
  created_at?: string;
  updated_at?: string;
  organizer_verification_key?: string | null;
  telegram_chat_id?: string | null;
  deletedAt?: string | null;
}

function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const location = useLocation();
  
  // Адаптивные значения
  const isMobile = useBreakpointValue({ base: true, md: false });
  const headingSize = useBreakpointValue({ base: 'lg', md: 'xl' });
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const { isOpen: isFilterOpen, onToggle: onFilterToggle } = useDisclosure({ defaultIsOpen: true });

  // Fetch events and categories
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [eventData, catData] = await Promise.all([getEvents(), getCategories()]);

        const mappedCategories: Category[] = catData.map((cat) => ({
          id: cat.id,
          category_name: cat.category_name,
        }));

        const mappedEvents: Event[] = eventData
          .filter((event: ApiEvent) => {
            const eventDate = new Date(event.date);
            const currentDate = new Date();
            return eventDate > currentDate && !event.deletedAt;
          })
          .map((event: ApiEvent) => ({
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
        setFilteredEvents(mappedEvents);

        // Apply filters from location.state
        const { title, location: loc, category } = (location.state || {}) as {
          title?: string;
          location?: string;
          category?: string;
        };

        if (title || loc || category) {
          setSearchTitle(title || '');
          setSearchLocation(loc || '');
          setSelectedCategory(category || '');

          // Perform search with the provided filters
          let filtered = mappedEvents;

          if (title) {
            filtered = filtered.filter((event) =>
              event.title.toLowerCase().includes(title.toLowerCase())
            );
          }

          if (loc) {
            filtered = filtered.filter((event) =>
              event.location.toLowerCase().includes(loc.toLowerCase())
            );
          }

          if (category) {
            filtered = filtered.filter((event) => event.category.id === category);
          }

          setFilteredEvents(filtered);
          
        }
      } catch (error: any) {
        toast({
          title: 'Ошибка загрузки данных',
          description: error.message || 'Не удалось загрузить мероприятия',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast, location.state]);

  // Handle search and filtering
  const handleSearch = () => {
    let filtered = events;

    if (searchTitle) {
      filtered = filtered.filter((event) =>
        event.title.toLowerCase().includes(searchTitle.toLowerCase())
      );
    }

    if (searchLocation) {
      filtered = filtered.filter((event) =>
        event.location.toLowerCase().includes(searchLocation.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((event) => event.category.id === selectedCategory);
    }

    if (startDate) {
      const startDateTime = new Date(startDate).getTime();
      filtered = filtered.filter((event) => new Date(event.date).getTime() >= startDateTime);
    }

    if (endDate) {
      const endDateTime = new Date(endDate).getTime();
      filtered = filtered.filter((event) => new Date(event.date).getTime() <= endDateTime);
    }

    setFilteredEvents(filtered);

  };

  // Reset filters
  const handleReset = () => {
    setSearchTitle('');
    setSearchLocation('');
    setSelectedCategory('');
    setStartDate('');
    setEndDate('');
    setFilteredEvents(events);
    toast({
      title: 'Фильтры сброшены',
      description: 'Показаны все мероприятия',
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
        `}
      </style>
      <Header />
      
      <Box className={styles.content} py="6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%' }}
        >
          <Heading 
            as="h1" 
            size={headingSize} 
            mb="1.5rem" 
            color="#2E4FD7"
            textAlign={{ base: 'center', md: 'left' }}
          >
            Список мероприятий
          </Heading>
          
          <Text fontSize={{ base: 'md', md: 'lg' }} mb="2rem" color="gray.600">
            Найдено мероприятий: {filteredEvents.length}
          </Text>

          <div className={styles.contentContainer}>
            {/* Фильтры */}
            <Box className={styles.filterSidebar}>
              {/* Кнопка сворачивания фильтров на мобильных */}
              {isMobile && (
                <HStack 
                  justify="space-between" 
                  mb={isFilterOpen ? "1rem" : 0}
                  cursor="pointer"
                  onClick={onFilterToggle}
                >
                  <Heading size="md">Фильтры</Heading>
                  <IconButton
                    aria-label="Toggle filters"
                    icon={isFilterOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    variant="ghost"
                    size="sm"
                  />
                </HStack>
              )}
              
              {!isMobile && <Heading size="md" mb="1rem">Фильтры</Heading>}
              
              <Collapse in={isMobile ? isFilterOpen : true} animateOpacity>
                <VStack spacing="1rem" align="stretch">
                  <FormControl>
                    <FormLabel fontSize="sm">Название</FormLabel>
                    <Input
                      placeholder="Поиск по названию"
                      value={searchTitle}
                      onChange={(e) => setSearchTitle(e.target.value)}
                      bg="white"
                      size={buttonSize}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontSize="sm">Локация</FormLabel>
                    <Input
                      placeholder="Поиск по локации"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      bg="white"
                      size={buttonSize}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontSize="sm">Категория</FormLabel>
                    <Select
                      placeholder="Все категории"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      bg="white"
                      size={buttonSize}
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={String(cat.id)}>
                          {cat.category_name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontSize="sm">Дата (от)</FormLabel>
                    <Input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      bg="white"
                      size={buttonSize}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontSize="sm">Дата (до)</FormLabel>
                    <Input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      bg="white"
                      size={buttonSize}
                    />
                  </FormControl>
                  
                  <VStack spacing="2" pt="1rem">
                    <Button
                      bg="#2E4FD7"
                      color="white"
                      _hover={{ bg: '#1e3fa9' }}
                      size={buttonSize}
                      width="100%"
                      onClick={handleSearch}
                      isDisabled={isLoading}
                    >
                      Применить фильтры
                    </Button>
                    <Button
                      variant="outline"
                      colorScheme="blue"
                      size={buttonSize}
                      width="100%"
                      onClick={handleReset}
                      isDisabled={isLoading}
                    >
                      Сбросить
                    </Button>
                  </VStack>
                  
                  {/* Показать активные фильтры */}
                  {(searchTitle || searchLocation || selectedCategory || startDate || endDate) && (
                    <Box pt="1rem">
                      <Text fontSize="sm" color="gray.600" mb="0.5rem">Активные фильтры:</Text>
                      <Flex flexWrap="wrap" gap="0.5rem">
                        {searchTitle && (
                          <Badge colorScheme="blue" variant="subtle">
                            Название: {searchTitle}
                          </Badge>
                        )}
                        {searchLocation && (
                          <Badge colorScheme="green" variant="subtle">
                            Локация: {searchLocation}
                          </Badge>
                        )}
                        {selectedCategory && (
                          <Badge colorScheme="purple" variant="subtle">
                            {categories.find(c => String(c.id) === selectedCategory)?.category_name}
                          </Badge>
                        )}
                        {startDate && (
                          <Badge colorScheme="orange" variant="subtle">
                            От: {new Date(startDate).toLocaleDateString()}
                          </Badge>
                        )}
                        {endDate && (
                          <Badge colorScheme="orange" variant="subtle">
                            До: {new Date(endDate).toLocaleDateString()}
                          </Badge>
                        )}
                      </Flex>
                    </Box>
                  )}
                </VStack>
              </Collapse>
            </Box>

            {/* Список мероприятий */}
            <div className={styles.eventContainer}>
              {isLoading ? (
                <Flex justify="center" align="center" py="4rem" minH="300px">
                  <VStack spacing="4">
                    <Spinner size="xl" color="#2E4FD7" thickness="4px" />
                    <Text color="gray.600">Загрузка мероприятий...</Text>
                  </VStack>
                </Flex>
              ) : filteredEvents.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Flex 
                    justify="center" 
                    align="center" 
                    py="4rem" 
                    minH="300px"
                    direction="column"
                    bg="#F7F9FC"
                    borderRadius="md"
                  >
                    <Text fontSize={{ base: 'lg', md: 'xl' }} color="gray.600" mb="2">
                      Мероприятия не найдены
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Попробуйте изменить параметры поиска
                    </Text>
                    <Button
                      mt="4"
                      variant="outline"
                      colorScheme="blue"
                      size={buttonSize}
                      onClick={handleReset}
                    >
                      Сбросить фильтры
                    </Button>
                  </Flex>
                </motion.div>
              ) : (
                <SimpleGrid
                  columns={{ base: 1, lg: 2 }}
                  spacing="1.5rem"
                >
                  {filteredEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <EventCard event={event} />
                    </motion.div>
                  ))}
                </SimpleGrid>
              )}
            </div>
          </div>
        </motion.div>
      </Box>
      
      <Footer />
    </Box>
  );
}

export default Events;