import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useToast,
  VStack,
  HStack,
  Stack,
  useBreakpointValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import {
  getOwnEventsRegistration,
  createEventRegistration,
  createReview,
  createOrganizerRequest,
  getOwnOrganizerRequests,
  linkTelegram,
  getCategories,
  createEvent,
  getOwnEvents,
  updateEvent,
  deleteEvent,
  getEventRequests,
  responseToEventRequest,
} from '../../api/api';
import { useAuth } from '../../AuthContext/AuthContext';
import styles from './Cabinet.module.scss';
import { useNavigate } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category_id: number;
  price: number; // Изменено на number, так как в форме используется Number()
  capacity: number;
  telegram_chat_link: string | null;
  creator_id?: string; // Добавлено для совместимости с ответом сервера
  created_at?: string;
  updated_at?: string;
  organizer_verification_key?: string;
  telegram_chat_id?: string | null;
  image?: string | null; // Base64-строка или null
}

// Интерфейс для ответа сервера от createEvent
interface CreateEventResponse {
  event: Event;
  message: string;
}

interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status_id: number;
  event: Event;
}

interface Review {
  rating: number;
  comment: string;
}

interface OrganizerRequest {
  id: string;
  user_id: string;
  status_id: number;
}

interface Category {
  id: number;
  category_name: string;
}

interface EventRequest {
  id: string;
  user_id: string;
  event_id: string;
  status_id: number;
  user: {
    login: string;
    telegram: string | null;
  };
}

function Cabinet() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [organizerRequests, setOrganizerRequests] = useState<OrganizerRequest[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ownEvents, setOwnEvents] = useState<Event[]>([]);
  const [eventRequests, setEventRequests] = useState<EventRequest[]>([]);
  const [telegram, setTelegram] = useState('');
  const [review, setReview] = useState<Review>({ rating: 1, comment: '' });
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    category_id: '',
    price: '',
    capacity: '',
    telegram_chat_link: '',
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const isOrganizer = user?.role_id === 2;
  const isAdmin = user?.role_id === 3;

  // Адаптивные значения
  const isMobile = useBreakpointValue({ base: true, md: false });
  const fontSizeHeading = useBreakpointValue({ base: 'lg', md: 'xl' });
  const fontSizeText = useBreakpointValue({ base: 'md', md: 'lg' });
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' });

  // Проверка авторизации и редирект
  useEffect(() => {
    console.log('Cabinet: Проверка аутентификации, authLoading =', authLoading, 'isAuthenticated =', isAuthenticated, 'user =', user);
    
    if (!authLoading && !isAuthenticated && !user) {
      console.log('Cabinet: Перенаправление на страницу входа');
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  // Fetch data
  useEffect(() => {
    console.log('Cabinet: useEffect для загрузки данных, authLoading =', authLoading, 'user =', user);
    
    const fetchData = async () => {
      if (authLoading || !user) {
        console.log('Cabinet: Пропуск загрузки данных - пользователь не авторизован или идет проверка');
        return;
      }
      
      console.log('Cabinet: Начало загрузки данных пользователя');
      setIsLoading(true);
      
      try {
        const regs = await getOwnEventsRegistration();
        const orgRequests = await getOwnOrganizerRequests();
        const cats = await getCategories();

        setRegistrations(regs || []);
        setOrganizerRequests(orgRequests || []);
        setCategories(cats || []);

        if (isOrganizer || isAdmin) {
          const events = await getOwnEvents();
          setOwnEvents(events || []);
        }

        if (!cats?.length) {
          toast({
            title: 'Предупреждение',
            description: 'Категории не загружены',
            status: 'warning',
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error: any) {
        toast({
          title: 'Ошибка загрузки данных',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [authLoading, user, isOrganizer, toast]);

  // Register for an event
  const handleRegisterEvent = async (event_id: string) => {
    setIsLoading(true);
    try {
      await createEventRegistration(event_id);
      const regs = await getOwnEventsRegistration();
      setRegistrations(regs || []);
      toast({
        title: 'Успех',
        description: 'Вы зарегистрированы на мероприятие',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel registration
  const handleCancelRegistration = async (registration_id: string) => {
    console.log('Cancel registration:', registration_id);
  };

  // Create review
  const handleCreateReview = async (event_id: string) => {
    if (!review.comment || review.rating < 1 || review.rating > 5) {
      toast({
        title: 'Ошибка',
        description: 'Заполните рейтинг (1-5) и комментарий',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsLoading(true);
    try {
      await createReview(event_id, review.rating, review.comment);
      setReview({ rating: 1, comment: '' });
      toast({
        title: 'Успех',
        description: 'Отзыв отправлен',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Request organizer status
  const handleCreateOrganizerRequest = async () => {
    setIsLoading(true);
    try {
      await createOrganizerRequest();
      const requests = await getOwnOrganizerRequests();
      setOrganizerRequests(requests || []);
      toast({
        title: 'Успех',
        description: 'Запрос на статус организатора отправлен',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Link Telegram
  const handleLinkTelegram = async () => {
    if (!telegram.startsWith('@')) {
      toast({
        title: 'Ошибка',
        description: 'Telegram должен начинаться с @',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await linkTelegram(telegram);
      toast({
        title: 'Успех',
        description: response.message,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setTelegram('');
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create event
  const handleCreateEvent = async () => {
    if (
      !newEvent.title ||
      !newEvent.description ||
      !newEvent.date ||
      !newEvent.location ||
      !newEvent.category_id ||
      !newEvent.price ||
      !newEvent.capacity
    ) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  
    const formData = new FormData();
    formData.append('title', newEvent.title);
    formData.append('description', newEvent.description);
    formData.append('date', newEvent.date);
    formData.append('location', newEvent.location);
    formData.append('category_id', newEvent.category_id);
    formData.append('price', newEvent.price);
    formData.append('capacity', newEvent.capacity);
    formData.append('telegram_chat_link', newEvent.telegram_chat_link || '');
    if (newEvent.image) {
      formData.append('image', newEvent.image);
    }
  
    console.log('Отправка данных для создания мероприятия:', formData);
  
    setIsLoading(true);
    try {
      const response = await createEvent(formData);
      console.log('Ответ от сервера:', response);
  
      const event = response.event;
  
      // Проверка возвращаемого объекта
      if (!event || !event.id || !event.title || !event.date || !event.location) {
        throw new Error('Некорректный ответ сервера: отсутствуют обязательные поля');
      }
  
      // Обновляем список мероприятий
      const updatedEvents = await getOwnEvents();
      setOwnEvents(updatedEvents || []);
  
      // Очищаем форму
      setNewEvent({
        title: '',
        description: '',
        date: '',
        location: '',
        category_id: '',
        price: '',
        capacity: '',
        telegram_chat_link: '',
        image: null,
      });
      setImagePreview(null);
  
      toast({
        title: 'Успех',
        description: response.message || 'Мероприятие создано',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Ошибка при создании мероприятия:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось создать мероприятие',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update event
  const handleUpdateEvent = async (event_id: string) => {
    if (
      !newEvent.title ||
      !newEvent.description ||
      !newEvent.date ||
      !newEvent.location ||
      !newEvent.category_id ||
      !newEvent.price ||
      !newEvent.capacity
    ) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  
    const formData = new FormData();
    formData.append('event_id', event_id);
    formData.append('title', newEvent.title);
    formData.append('description', newEvent.description);
    formData.append('date', newEvent.date);
    formData.append('location', newEvent.location);
    formData.append('category_id', newEvent.category_id);
    formData.append('price', newEvent.price);
    formData.append('capacity', newEvent.capacity);
    formData.append('telegram_chat_link', newEvent.telegram_chat_link || '');
    if (newEvent.image) {
      formData.append('image', newEvent.image);
    }
  
    setIsLoading(true);
    try {
      await updateEvent(event_id, formData);
      const events = await getOwnEvents();
      setOwnEvents(events || []);
      setNewEvent({
        title: '',
        description: '',
        date: '',
        location: '',
        category_id: '',
        price: '',
        capacity: '',
        telegram_chat_link: '',
        image: null,
      });
      setImagePreview(null);
      toast({
        title: 'Успех',
        description: 'Мероприятие обновлено',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete event
  const handleDeleteEvent = async (event_id: string) => {
    setIsLoading(true);
    try {
      await deleteEvent(event_id);
      const events = await getOwnEvents();
      setOwnEvents(events || []);
      toast({
        title: 'Успех',
        description: 'Мероприятие удалено',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Respond to event request
  const handleResponseToEventRequest = async (event_id: string, user_id: string, status_id: number) => {
    setIsLoading(true);
    try {
      await responseToEventRequest(event_id, user_id, status_id);
      const requests = await getEventRequests(event_id);
      setEventRequests(requests || []);
      toast({
        title: 'Успех',
        description: `Заявка ${status_id === 2 ? 'подтверждена' : 'отклонена'}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch event requests
  const handleFetchEventRequests = async (event_id: string) => {
    if (!event_id) {
      toast({
        title: 'Ошибка',
        description: 'ID мероприятия отсутствует',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsLoading(true);
    try {
      const requests = await getEventRequests(event_id);
      setEventRequests(requests || []);
      if (!requests?.length) {
        toast({
          title: 'Информация',
          description: 'Похоже никто пока не подал заявки. Всему своё время',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setEventRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Компонент для рендеринга будущих мероприятий в виде карточек
  const FutureEventsCards = ({ registrations }: { registrations: EventRegistration[] }) => (
    <VStack spacing="4" align="stretch">
      {registrations
        .filter((reg) => reg.event && new Date(reg.event.date) > new Date())
        .map((reg) => (
          <Box key={reg.id} borderWidth="1px" borderRadius="md" p="4">
            <Text fontWeight="bold">{reg.event.title}</Text>
            <Text>Дата: {new Date(reg.event.date).toLocaleDateString()}</Text>
            <Text>Место: {reg.event.location}</Text>
            <Text>
              Статус: {reg.status_id === 1 ? 'Ожидает' : reg.status_id === 2 ? 'Подтверждено' : 'Отклонено'}
            </Text>
          </Box>
        ))}
    </VStack>
  );

  // Компонент для рендеринга прошедших мероприятий в виде карточек
  const PastEventsCards = ({ registrations }: { registrations: EventRegistration[] }) => (
    <VStack spacing="4" align="stretch">
      {registrations
        .filter((reg) => reg.event && new Date(reg.event.date) <= new Date() && reg.status_id === 2)
        .map((reg) => (
          <Box key={reg.id} borderWidth="1px" borderRadius="md" p="4">
            <Text fontWeight="bold">{reg.event.title}</Text>
            <Text>Дата: {new Date(reg.event.date).toLocaleDateString()}</Text>
            <Text>Место: {reg.event.location}</Text>
            <VStack spacing="2" mt="2">
              <Select
                value={review.rating}
                onChange={(e) => setReview({ ...review, rating: Number(e.target.value) })}
                size={buttonSize}
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </Select>
              <Textarea
                value={review.comment}
                onChange={(e) => setReview({ ...review, comment: e.target.value })}
                placeholder="Ваш отзыв"
                size={buttonSize}
              />
              <Button
                colorScheme="blue"
                size={buttonSize}
                onClick={() => handleCreateReview(reg.event_id)}
                isDisabled={isLoading}
              >
                Отправить отзыв
              </Button>
            </VStack>
          </Box>
        ))}
    </VStack>
  );

  // Компонент для рендеринга созданных мероприятий в виде карточек
  const OwnEventsCards = ({ events }: { events: Event[] }) => (
    <VStack spacing="4" align="stretch">
      {events.map((event) => (
        <Box key={event.id} borderWidth="1px" borderRadius="md" p="4">
          <Text fontWeight="bold">{event.title}</Text>
          <Text>Дата: {new Date(event.date).toLocaleDateString()}</Text>
          <Text>Место: {event.location}</Text>
          {event.image && (
          <Box mt="2">
            <img src={event.image} alt={event.title} style={{ maxWidth: '200px', borderRadius: '8px' }} />
          </Box>
        )}
          <Stack direction={isMobile ? 'column' : 'row'} spacing="2" mt="2">
            <Button
              size={buttonSize}
              colorScheme="blue"
              onClick={() => {
                setNewEvent({
                  title: event.title,
                  description: event.description,
                  date: event.date.slice(0, 16),
                  location: event.location,
                  category_id: event.category_id.toString(),
                  price: event.price.toString(),
                  capacity: event.capacity.toString(),
                  telegram_chat_link: event.telegram_chat_link || '',
                  image: null as File | null,
                });
              }}
              isDisabled={isLoading}
            >
              Редактировать
            </Button>
            <Button
              size={buttonSize}
              colorScheme="blue"
              onClick={() => handleUpdateEvent(event.id)}
              isDisabled={isLoading}
            >
              Сохранить
            </Button>
            <Button
              size={buttonSize}
              colorScheme="red"
              onClick={() => handleDeleteEvent(event.id)}
              isDisabled={isLoading}
            >
              Удалить
            </Button>
            <Button
              size={buttonSize}
              colorScheme="green"
              onClick={() => handleFetchEventRequests(event.id)}
              isDisabled={isLoading}
            >
              Просмотреть заявки
            </Button>
            <Button
  size={buttonSize}
  colorScheme="purple"
  onClick={() =>
    toast({
      title: 'Ключ верификации',
      description: event.organizer_verification_key || 'Ключ отсутствует',
      status: 'info',
      duration: 5000,
      isClosable: true,
    })
  }
  isDisabled={isLoading || !event.organizer_verification_key}
>
  Показать ключ
</Button>
          </Stack>
        </Box>
      ))}
    </VStack>
  );

  return (
    <Box className={styles.container}  mx="auto" >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
          body { font-family: 'Inter', sans-serif; }
        `}
      </style>
      <Header />

      {authLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Text fontSize={fontSizeText}>Загрузка данных пользователя...</Text>
        </Box>
      ) : !user ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Text fontSize={fontSizeText}>Требуется авторизация. Перенаправление...</Text>
        </Box>
      ) : (
        <Box className={styles.content} py="6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Heading as="h1" size={fontSizeHeading} mb="1rem" color="#2E4FD7">
              Личный кабинет
            </Heading>
            <Text fontSize={fontSizeText} mb="2rem" color="gray.600">
              Пользователь: {user?.login || 'Гость'}
            </Text>
            <Tabs variant="soft-rounded" colorScheme="blue">
              <TabList mb="1rem" whiteSpace="nowrap">
                <Tab fontSize={fontSizeText}>Будущие</Tab>
                <Tab fontSize={fontSizeText}>Прошедшие</Tab>
                <Tab fontSize={fontSizeText}>Мои созданные</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Text fontSize={fontSizeText} mb="1rem">
                    Ваши будущие мероприятия
                  </Text>
                  {isMobile ? (
                    <FutureEventsCards registrations={registrations} />
                  ) : (
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Название</Th>
                          <Th>Дата</Th>
                          <Th>Место</Th>
                          <Th>Статус</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {registrations
                          .filter((reg) => reg.event && new Date(reg.event.date) > new Date())
                          .map((reg) => (
                            <Tr key={reg.id}>
                              <Td>{reg.event.title}</Td>
                              <Td>{new Date(reg.event.date).toLocaleDateString()}</Td>
                              <Td>{reg.event.location}</Td>
                              <Td>
                                {reg.status_id === 1 ? 'Ожидает' : reg.status_id === 2 ? 'Подтверждено' : 'Отклонено'}
                              </Td>
                            </Tr>
                          ))}
                      </Tbody>
                    </Table>
                  )}
                </TabPanel>
                <TabPanel>
                  <Text fontSize={fontSizeText} mb="1rem">
                    Прошедшие мероприятия
                  </Text>
                  {isMobile ? (
                    <PastEventsCards registrations={registrations} />
                  ) : (
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Название</Th>
                          <Th>Дата</Th>
                          <Th>Место</Th>
                          <Th>Отзыв</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {registrations
                          .filter((reg) => reg.event && new Date(reg.event.date) <= new Date() && reg.status_id === 2)
                          .map((reg) => (
                            <Tr key={reg.id}>
                              <Td>{reg.event.title}</Td>
                              <Td>{new Date(reg.event.date).toLocaleDateString()}</Td>
                              <Td>{reg.event.location}</Td>
                              <Td>
                                <VStack spacing="2">
                                  <Select
                                    value={review.rating}
                                    onChange={(e) => setReview({ ...review, rating: Number(e.target.value) })}
                                    size={buttonSize}
                                  >
                                    {[1, 2, 3, 4, 5].map((num) => (
                                      <option key={num} value={num}>
                                        {num}
                                      </option>
                                    ))}
                                  </Select>
                                  <Textarea
                                    value={review.comment}
                                    onChange={(e) => setReview({ ...review, comment: e.target.value })}
                                    placeholder="Ваш отзыв"
                                    size={buttonSize}
                                  />
                                  <Button
                                    colorScheme="blue"
                                    size={buttonSize}
                                    onClick={() => handleCreateReview(reg.event_id)}
                                    isDisabled={isLoading}
                                  >
                                    Отправить отзыв
                                  </Button>
                                </VStack>
                              </Td>
                            </Tr>
                          ))}
                      </Tbody>
                    </Table>
                  )}
                </TabPanel>
                <TabPanel>
                 
                  {isOrganizer || isAdmin ? (
                    <>
                      <VStack spacing="4" mb="2rem" align="stretch">
                        <Text fontSize={fontSizeText}>Создать новое мероприятие</Text>
                        <FormControl>
                          <FormLabel>Название</FormLabel>
                          <Input
                            value={newEvent.title}
                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                            placeholder="Название мероприятия"
                            bg="#E7EBFC"
                            size={buttonSize}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Описание</FormLabel>
                          <Textarea
                            value={newEvent.description}
                            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                            placeholder="Описание мероприятия"
                            bg="#E7EBFC"
                            size={buttonSize}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Дата</FormLabel>
                          <Input
                            type="datetime-local"
                            value={newEvent.date}
                            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                            bg="#E7EBFC"
                            size={buttonSize}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Место</FormLabel>
                          <Input
                            value={newEvent.location}
                            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                            placeholder="Место проведения"
                            bg="#E7EBFC"
                            size={buttonSize}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Категория</FormLabel>
                          <Select
                            value={newEvent.category_id}
                            onChange={(e) => setNewEvent({ ...newEvent, category_id: e.target.value })}
                            placeholder="Выберите категорию"
                            bg="#E7EBFC"
                            size={buttonSize}
                          >
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.category_name}
                              </option>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl>
                          <FormLabel>Цена</FormLabel>
                          <Input
                            type="number"
                            value={newEvent.price}
                            onChange={(e) => setNewEvent({ ...newEvent, price: e.target.value })}
                            placeholder="Цена"
                            bg="#E7EBFC"
                            size={buttonSize}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Вместимость</FormLabel>
                          <Input
                            type="number"
                            value={newEvent.capacity}
                            onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })}
                            placeholder="Вместимость"
                            bg="#E7EBFC"
                            size={buttonSize}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Изображение</FormLabel>
                          <Input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setNewEvent({ ...newEvent, image: file });
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setImagePreview(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              } else {
                                setImagePreview(null);
                              }
                            }}
                            bg="#E7EBFC"
                            size={buttonSize}
                          />
                          {imagePreview && (
                            <Box mt="2">
                              <img src={imagePreview} alt="Превью" style={{ maxWidth: '200px', borderRadius: '8px' }} />
                            </Box>
                          )}
                        </FormControl>
                        <FormControl>
                          <FormLabel>Ссылка на Telegram-чат</FormLabel>
                          <Input
                            value={newEvent.telegram_chat_link}
                            onChange={(e) => setNewEvent({ ...newEvent, telegram_chat_link: e.target.value })}
                            placeholder="Ссылка на Telegram-чат (опционально)"
                            bg="#E7EBFC"
                            size={buttonSize}
                          />
                        </FormControl>
                        <Button
                          bg="#2E4FD7"
                          color="white"
                          _hover={{ bg: '#1e3fa9' }}
                          onClick={handleCreateEvent}
                          isDisabled={isLoading}
                          size={buttonSize}
                        >
                          Создать мероприятие
                        </Button>
                      </VStack>
                      {isMobile ? (
                        <OwnEventsCards events={ownEvents} />
                      ) : (
                        <Box>
                        <Text fontSize={fontSizeText} mb="1rem">
                    Мои созданные мероприятия
                  </Text>
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Название</Th>
                              <Th>Дата</Th>
                              <Th>Место</Th>
                              <Th>Действия</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            
                            {ownEvents.map((event) => (
                              <Tr key={event.id}>
                                <Td>{event.title}</Td>
                                <Td>{new Date(event.date).toLocaleDateString()}</Td>
                                <Td>{event.location}</Td>
                                <Td>
                                  <HStack spacing="2">
                                    <Button
                                      size={buttonSize}
                                      colorScheme="blue"
                                      onClick={() => {
                                        setNewEvent({
                                          title: event.title,
                                          description: event.description,
                                          date: event.date.slice(0, 16),
                                          location: event.location,
                                          category_id: event.category_id.toString(),
                                          price: event.price.toString(),
                                          capacity: event.capacity.toString(),
                                          telegram_chat_link: event.telegram_chat_link || '',
                                          image: null as File | null,
                                        });
                                      }}
                                      isDisabled={isLoading}
                                    >
                                      Редактировать
                                    </Button>
                                    <Button
                                      size={buttonSize}
                                      colorScheme="blue"
                                      onClick={() => handleUpdateEvent(event.id)}
                                      isDisabled={isLoading}
                                    >
                                      Сохранить
                                    </Button>
                                    <Button
                                      size={buttonSize}
                                      colorScheme="red"
                                      onClick={() => handleDeleteEvent(event.id)}
                                      isDisabled={isLoading}
                                    >
                                      Удалить
                                    </Button>
                                    <Button
                                      size={buttonSize}
                                      colorScheme="green"
                                      onClick={() => handleFetchEventRequests(event.id)}
                                      isDisabled={isLoading}
                                    >
                                      Просмотреть заявки
                                    </Button>
                                    <Button
                                      size={buttonSize}
                                      colorScheme="purple"
                                      onClick={() =>
                                        toast({
                                          title: 'Ключ верификации',
                                          description: event.organizer_verification_key || 'Ключ отсутствует',
                                          status: 'info',
                                          duration: 5000,
                                          isClosable: true,
                                        })
                                      }
                                      isDisabled={isLoading || !event.organizer_verification_key}
                                    >
                                      Показать ключ
                                    </Button>
                                  </HStack>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                        </Box>
                      )}
                      {eventRequests.length > 0 && (
                        <VStack spacing="4" mt="2rem" align="stretch">
                          <Text fontSize={fontSizeText}>Заявки на мероприятие</Text>
                          {eventRequests.map((req) => (
                            <Box key={req.id} borderWidth="1px" borderRadius="md" p="4">
                              <Text>Имя: {req.user.login}</Text>
                              <Text>Телеграм: {req.user.telegram}</Text>
                              <Text>
                                Статус:{' '}
                                {req.status_id === 1 ? 'Ожидает' : req.status_id === 2 ? 'Подтверждено' : 'Отклонено'}
                              </Text>
                              <Stack direction={isMobile ? 'column' : 'row'} spacing="2" mt="2">
                                <Button
                                  size={buttonSize}
                                  colorScheme="green"
                                  onClick={() => handleResponseToEventRequest(req.event_id, req.user_id, 2)}
                                  isDisabled={isLoading || req.status_id !== 1}
                                >
                                  Подтвердить
                                </Button>
                                <Button
                                  size={buttonSize}
                                  colorScheme="red"
                                  onClick={() => handleResponseToEventRequest(req.event_id, req.user_id, 3)}
                                  isDisabled={isLoading || req.status_id !== 1}
                                >
                                  Отклонить
                                </Button>
                              </Stack>
                            </Box>
                          ))}
                        </VStack>
                      )}
                    </>
                  ) : (
                    <VStack spacing="4">
                      <Text fontSize={fontSizeText}>
                        {organizerRequests[0]?.status_id === 2 && user.role_id === 1
                          ? "Вы больше не организатор. Спасибо за вклад в развитие проекта!"
                          : "Вы не являетесь организатором"}
                      </Text>
                      <Button
                        bg="#2E4FD7"
                        color="white"
                        _hover={{ bg: '#1e3fa9' }}
                        onClick={handleCreateOrganizerRequest}
                        isDisabled={isLoading || organizerRequests.length > 0}
                        size={buttonSize}
                      >
                        Запросить статус организатора
                      </Button>
                      {organizerRequests[0] && (
                        <Text fontSize={fontSizeText}>
                          Статус запроса:{' '}
                          {organizerRequests[0].status_id === 1
                            ? 'Ожидает'
                            :organizerRequests[0].status_id ===2 && user.role_id===1
                            ? 'Отозван'
                            : organizerRequests[0].status_id === 2
                            ? 'Подтверждён'
                            : 'Отклонён'}
                        </Text>
                      )}
                    </VStack>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
            {(!isOrganizer && !isAdmin) && (
              <VStack spacing="4" mt="2rem" align="stretch">
                <Text fontSize={fontSizeText}>Привязка Telegram</Text>
                <FormControl>
                  <FormLabel>Telegram</FormLabel>
                  <Input
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    placeholder="@username"
                    bg="#E7EBFC"
                    size={buttonSize}
                  />
                </FormControl>
                <Button
                  bg="#2E4FD7"
                  color="white"
                  _hover={{ bg: '#1e3fa9' }}
                  onClick={handleLinkTelegram}
                  isDisabled={isLoading}
                  size={buttonSize}
                >
                  Привязать Telegram
                </Button>
              </VStack>
            )}
          </motion.div>
        </Box>
      )}
      <Footer />
    </Box>
  );
}

export default Cabinet;