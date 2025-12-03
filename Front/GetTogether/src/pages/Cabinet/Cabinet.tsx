import { useState, useEffect, useRef } from 'react';
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

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

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category_id: number;
  price: string; // Изменено на string, так как API возвращает "0.00"
  capacity: number;
  telegram_chat_link: string | null;
  creator_id?: string;
  created_at?: string;
  updated_at?: string;
  deletedAt?: string | null;
  organizer_verification_key?: string | null;
  telegram_chat_id?: string | null;
  image?: any; // API возвращает объект Buffer, оставим any для гибкости
  reviews?: ReviewGet[];
}

interface ReviewGet {
  id: string;
  event_id: string;
  user_id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewUser: {
    id: string;
    login: string;
  };
}

interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status_id: number;
  telegram_invite_link?: string;
  createdAt?: string;
  updatedAt?: string;
  Event: Event;
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
  const [tabIndex, setTabIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isOrganizer = user?.role_id === 2;
  const isAdmin = user?.role_id === 3;
  const user_telegram = user?.telegram;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'organizer' | 'delete' | null>(null);

  const isMobile = useBreakpointValue({ base: true, md: false });
  const fontSizeHeading = useBreakpointValue({ base: 'lg', md: 'xl' });
  const fontSizeText = useBreakpointValue({ base: 'md', md: 'lg' });
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' });

  // Handle tabIndex and scroll to event from location.state
  useEffect(() => {
    const { tabIndex: incomingTabIndex, eventId, isEditing: incomingIsEditing, eventData } = (location.state || {}) as {
      tabIndex?: number;
      eventId?: string;
      isEditing?: boolean;
      eventData?: any;
    };

    if (incomingTabIndex !== undefined) {
      setTabIndex(incomingTabIndex);
    }

    if (incomingIsEditing && eventData) {
      setIsEditing(true);
      setEditingEventId(eventId || null);
      setNewEvent({
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        location: eventData.location,
        category_id: eventData.category_id,
        price: eventData.price,
        capacity: eventData.capacity,
        telegram_chat_link: eventData.telegram_chat_link,
        image: null,
      });
      if (eventData.image) {
        setImagePreview(eventData.image);
      }
    }
  }, [location.state]);

  // Check authentication and redirect if needed
  useEffect(() => {
    console.log('Cabinet: Проверка аутентификации, authLoading =', authLoading, 'isAuthenticated =', isAuthenticated, 'user =', user);

    if (!authLoading) {
      if (!isAuthenticated || !user) {
        console.log('Cabinet: Перенаправление на страницу входа');
        navigate('/login', { replace: true });
      }
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  // Fetch user data
  useEffect(() => {
    console.log('Cabinet: useEffect для загрузки данных, authLoading =', authLoading, 'user =', user);

    const fetchData = async () => {
      if (authLoading || !isAuthenticated || !user) {
        console.log('Cabinet: Пропуск загрузки данных - пользователь не авторизован или идет проверка');
        return;
      }

      console.log('Cabinet: Начало загрузки данных пользователя');
      setIsLoading(true);

      try {
        const regs = await getOwnEventsRegistration();
        console.log('Cabinet: Получены регистрации:', regs);
        setRegistrations(regs || []);

        const orgRequests = await getOwnOrganizerRequests();
        const cats = await getCategories();

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
        console.error('Cabinet: Ошибка загрузки данных:', error);
        toast({
          title: 'Ошибка загрузки данных',
          description: error.message || 'Не удалось загрузить данные',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
        console.log("telegram: ", user_telegram);
      }
    };
    fetchData();
  }, [authLoading, isAuthenticated, user, isOrganizer, isAdmin, toast]);

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

  const handleCancelRegistration = async (registration_id: string) => {
    console.log('Cancel registration:', registration_id);
  };

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

  const handleCreateOrganizerRequest = async () => {
    setIsLoading(true);
    try {
      await createOrganizerRequest();
      const requests = await getOwnOrganizerRequests();

      setOrganizerRequests(requests || []);
      toast({
        title: 'Успех',
        description: 'Запрос на получение статуса организатора отправлен',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onClose();
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось отправить запрос',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const isDateValid = (date: string) => {
    const selectedDate = new Date(date);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return selectedDate >= tomorrow;
  };

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

    if (!isDateValid(newEvent.date)) {
      toast({
        title: 'Ошибка',
        description: 'Дата мероприятия должна быть минимум на сутки позже текущего времени',
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

      if (!event || !event.id || !event.title || !event.date || !event.location) {
        throw new Error('Некорректный ответ сервера: отсутствуют обязательные поля');
      }

      const updatedEvents = await getOwnEvents();
      setOwnEvents(updatedEvents || []);

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
      setIsEditing(false);
      setEditingEventId(null);

      toast({
        title: 'Успех',
        description: response.message || `Мероприятие создано. На данный момент у пользователей не будет возможности записаться на мероприятие. Вам необходимо привязать своё мероприятие к телеграмм группе при помощи бота @GetTogetherPSKPbot. Пригласите его в свою группу и дайте ему права администратора. Введите /verify ${event.organizer_verification_key} `,
        status: 'success',
        duration: 15000,
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

  const handleUpdateEvent = async (event_id: string) => {
    const event = ownEvents.find((e) => e.id === event_id);
    if (event && new Date(event.date) <= new Date()) {
      toast({
        title: 'Ошибка',
        description: 'Нельзя редактировать прошедшее мероприятие',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

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

    if (!isDateValid(newEvent.date)) {
      toast({
        title: 'Ошибка',
        description: 'Дата мероприятия должна быть минимум на сутки позже текущего времени',
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
      setIsEditing(false);
      setEditingEventId(null);
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

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingEventId(null);
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
  };

  const handleDeleteClick = (eventId: string) => {
    setEventToDelete(eventId);
    setModalType('delete');
    onOpen();
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;

    setIsLoading(true);
    try {
      await deleteEvent(eventToDelete);
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
      onClose();
      setEventToDelete(null);
    }
  };

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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const FutureEventsCards = ({ registrations }: { registrations: EventRegistration[] }) => {
    const futureEvents = registrations.filter((reg) => reg.Event && new Date(reg.Event.date) > new Date());
    console.log('Cabinet: Будущие мероприятия после фильтрации:', futureEvents);

    return (
      <VStack spacing="4" align="stretch">
        {futureEvents.length === 0 ? (
          <Text fontSize={fontSizeText} color="gray.600">
            Нет предстоящих мероприятий
          </Text>
        ) : (
          futureEvents.map((reg) => (
            <Box key={reg.id} borderWidth="1px" borderRadius="md" p="4">
              <Text fontWeight="bold">{reg.Event.title}</Text>
              <Text>Дата: {formatDateTime(reg.Event.date)}</Text>
              <Text>Место: {reg.Event.location}</Text>
              <Text>
                Статус: {reg.status_id === 1 ? 'Ожидает' : reg.status_id === 2 ? 'Подтверждено' : 'Отклонено'}
              </Text>
              <Button
                mt="2"
                size={buttonSize}
                colorScheme="teal"
                onClick={() => navigate(`/event/${reg.event_id}`)}
                isDisabled={isLoading}
              >
                Перейти
              </Button>
            </Box>
          ))
        )
        }
      </VStack >
    );
  };

  const PastEventsCards = ({ registrations }: { registrations: EventRegistration[] }) => (
    <VStack spacing="4" align="stretch">
      {registrations
        .filter((reg) => reg.Event && new Date(reg.Event.date) <= new Date() && reg.status_id === 2)
        .map((reg) => (
          <Box key={reg.id} borderWidth="1px" borderRadius="md" p="4">
            <Text fontWeight="bold">{reg.Event.title}</Text>
            <Text>Дата: {formatDateTime(reg.Event.date)}</Text>
            <Text>Место: {reg.Event.location}</Text>
            <Button
              mt="2"
              mb="2"
              size={buttonSize}
              colorScheme="teal"
              onClick={() => navigate(`/event/${reg.event_id}`)}
              isDisabled={isLoading}
            >
              Перейти
            </Button>
            {reg.Event?.reviews?.some(review => review.reviewUser.id === user?.id) ? (
              <Text mt="2" color="green.500">Отзыв уже отправлен</Text>
            ) : (
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
            )}
          </Box>
        ))}
    </VStack>
  );

  const OwnEventsCards = ({ events }: { events: Event[] }) => {
    const activeEvents = events
      .filter((event) => new Date(event.date) > new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const archivedEvents = events.filter((event) => new Date(event.date) <= new Date());

    return (
      <VStack spacing="6" align="stretch">
        {/* Active Events */}
        <Box>
          <Text fontSize={fontSizeText} fontWeight="bold" mb="4">
            Активные мероприятия
          </Text>
          {activeEvents.length === 0 ? (
            <Text fontSize={fontSizeText} color="gray.600">
              Нет активных мероприятий
            </Text>
          ) : (
            <VStack spacing="4" align="stretch">
              {activeEvents.map((event) => (
                <Box key={event.id} id={`event-${event.id}`} borderWidth="1px" borderRadius="md" p="4">
                  <Text fontWeight="bold">{event.title}</Text>
                  <Text>Дата: {formatDateTime(event.date)}</Text>
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
                        if (event.image) {
                          setImagePreview(event.image);
                        }
                        setIsEditing(true);
                        setEditingEventId(event.id);
                      }}
                      isDisabled={isLoading}
                    >
                      Редактировать
                    </Button>
                    <Button
                      size={buttonSize}
                      colorScheme="red"
                      onClick={() => handleDeleteClick(event.id)}
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
          )}
        </Box>

        {/* Archived Events */}
        <Box mt="6">
          <Text fontSize={fontSizeText} fontWeight="bold" mb="4">
            Архив
          </Text>
          {archivedEvents.length === 0 ? (
            <Text fontSize={fontSizeText} color="gray.600">
              Нет мероприятий в архиве
            </Text>
          ) : (
            <VStack spacing="4" align="stretch">
              {archivedEvents.map((event) => (
                <Box key={event.id} id={`event-${event.id}`} borderWidth="1px" borderRadius="md" p="4">
                  <Text fontWeight="bold">{event.title}</Text>
                  <Text>Дата: {formatDateTime(event.date)}</Text>
                  <Text>Место: {event.location}</Text>
                  {event.image && (
                    <Box mt="2">
                      <img src={event.image} alt={event.title} style={{ maxWidth: '200px', borderRadius: '8px' }} />
                    </Box>
                  )}
                  <Stack direction={isMobile ? 'column' : 'row'} spacing="2" mt="2">
                    <Button
                      size={buttonSize}
                      colorScheme="teal"
                      onClick={() => navigate(`/event/${event.id}`)}
                      isDisabled={isLoading}
                    >
                      Перейти
                    </Button>
                    <Button
                      size={buttonSize}
                      colorScheme="red"
                      onClick={() => handleDeleteClick(event.id)}
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
          )}
        </Box>
      </VStack>
    );
  };

  return (
    <Box className={styles.container} mx="auto">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
          body { font-family: 'Inter', sans-serif; }
          input[type="file"] { display: none; }
        `}
      </style>
      <Header />

      {authLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Text fontSize={fontSizeText}>Загрузка данных пользователя...</Text>
        </Box>
      ) : !isAuthenticated || !user ? (
        <Navigate to="/login" replace />
      ) : (
        <Box className={styles.content} py="6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%' }}
          >
            <Heading as="h1" size={fontSizeHeading} mb="1rem" color="#2E4FD7">
              {isEditing ? 'Редактирование мероприятия' : 'Личный кабинет'}
            </Heading>
            <Text fontSize={fontSizeText} mb="2rem" color="gray.600">
              Пользователь: {user?.login || 'Гость'}
            </Text>

            {isEditing ? (
              <VStack spacing="4" mb="2rem" align="stretch" width="100%">
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
                    min={(() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      return tomorrow.toISOString().slice(0, 16);
                    })()}
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
                    ref={fileInputRef}
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
                  />
                  <Button
                    bg="#2E4FD7"
                    color="white"
                    _hover={{ bg: '#1e3fa9' }}
                    size={buttonSize}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Выбрать изображение
                  </Button>
                  {imagePreview && (
                    <Box mt="4" textAlign="center">
                      <img
                        src={imagePreview}
                        alt="Превью"
                        style={{
                          maxWidth: '400px',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                          display: 'block',
                          margin: '0 auto',
                        }}
                      />
                    </Box>
                  )}
                </FormControl>
                <FormControl>
                  <FormLabel>Ссылка на Telegram-чат</FormLabel>
                  <Input
                    value={newEvent.telegram_chat_link}
                    onChange={(e) => setNewEvent({ ...newEvent, telegram_chat_link: e.target.value })}
                    placeholder="Ссылка на Telegram-чат"
                    bg="#E7EBFC"
                    size={buttonSize}
                  />
                </FormControl>
                <HStack spacing="2">
                  <Button
                    bg="#2E4FD7"
                    color="white"
                    _hover={{ bg: '#1e3fa9' }}
                    onClick={() => editingEventId && handleUpdateEvent(editingEventId)}
                    isDisabled={isLoading}
                    size={buttonSize}
                  >
                    Сохранить изменения
                  </Button>
                  <Button
                    bg="gray.500"
                    color="white"
                    _hover={{ bg: 'gray.600' }}
                    onClick={() => {
                      setIsEditing(false);
                      setEditingEventId(null);
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
                      setTabIndex(2);
                    }}
                    isDisabled={isLoading}
                    size={buttonSize}
                  >
                    Отменить редактирование
                  </Button>
                </HStack>
              </VStack>
            ) : (
              <>
                {/* Мобильный Select для выбора раздела */}
                {isMobile && (
                  <FormControl mb="1.5rem">
                    <FormLabel fontWeight="bold">Выберите раздел</FormLabel>
                    <Select
                      value={tabIndex}
                      onChange={(e) => setTabIndex(Number(e.target.value))}
                      bg="#E7EBFC"
                      size="lg"
                    >
                      <option value={0}>Будущие мероприятия</option>
                      <option value={1}>Прошедшие мероприятия</option>
                      <option value={2}>Мои созданные</option>
                    </Select>
                  </FormControl>
                )}

                <Tabs variant="soft-rounded" colorScheme="blue" index={tabIndex} onChange={(index) => setTabIndex(index)}>
                  {/* Табы только для десктопа */}
                  {!isMobile && (
                    <TabList mb="1rem" flexWrap="wrap" gap="0.5rem">
                      <Tab fontSize={fontSizeText}>Будущие</Tab>
                      <Tab fontSize={fontSizeText}>Прошедшие</Tab>
                      <Tab fontSize={fontSizeText}>Мои созданные</Tab>
                    </TabList>
                  )}
                  <TabPanels>
                    <TabPanel>
                      <Text fontSize={fontSizeText} mb="1rem">
                        Ваши будущие мероприятия
                      </Text>
                      {isMobile ? (
                        <FutureEventsCards registrations={registrations} />
                      ) : (
                        <Box overflowX="auto">
                          <Table variant="simple" minWidth="800px">
                            <Thead>
                              <Tr>
                                <Th>Название</Th>
                                <Th>Дата</Th>
                                <Th>Место</Th>
                                <Th>Статус</Th>
                                <Th>Действия</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {registrations
                                .filter((reg) => reg.Event && new Date(reg.Event.date) > new Date())
                                .map((reg) => (
                                  <Tr key={reg.id}>
                                    <Td>{reg.Event.title}</Td>
                                    <Td>{formatDateTime(reg.Event.date)}</Td>
                                    <Td>{reg.Event.location}</Td>
                                    <Td>
                                      {reg.status_id === 1 ? 'Ожидает' : reg.status_id === 2 ? 'Подтверждено' : 'Отклонено'}
                                    </Td>
                                    <Td>
                                      <Button
                                        size={buttonSize}
                                        colorScheme="teal"
                                        onClick={() => navigate(`/event/${reg.event_id}`)}
                                        isDisabled={isLoading}
                                      >
                                        Перейти
                                      </Button>
                                    </Td>
                                  </Tr>
                                ))}
                            </Tbody>
                          </Table>
                        </Box>
                      )}
                    </TabPanel>
                    <TabPanel>
                      <Text fontSize={fontSizeText} mb="1rem">
                        Прошедшие мероприятия
                      </Text>
                      {isMobile ? (
                        <PastEventsCards registrations={registrations} />
                      ) : (
                        <Box overflowX="auto">
                          <Table variant="simple" minWidth="800px">
                            <Thead>
                              <Tr>
                                <Th>Название</Th>
                                <Th>Дата</Th>
                                <Th>Место</Th>
                                <Th>Действие</Th>
                                <Th>Отзыв</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {registrations
                                .filter((reg) => reg.Event && new Date(reg.Event.date) <= new Date() && reg.status_id === 2)
                                .map((reg) => (
                                  <Tr key={reg.id}>
                                    <Td>{reg.Event.title}</Td>
                                    <Td>{formatDateTime(reg.Event.date)}</Td>
                                    <Td>{reg.Event.location}</Td>
                                    <Td>
                                      <Button
                                        size={buttonSize}
                                        colorScheme="teal"
                                        onClick={() => navigate(`/event/${reg.Event.id}`)}
                                        isDisabled={isLoading}
                                      >
                                        Перейти
                                      </Button>
                                    </Td>
                                    <Td>
                                      {reg.Event?.reviews?.some(review => review.reviewUser.id === user?.id) ? (
                                        <Text mt="2" color="green.500">Отзыв уже отправлен</Text>
                                      ) : (
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
                                      )}
                                    </Td>
                                  </Tr>
                                ))}
                            </Tbody>
                          </Table>
                        </Box>
                      )}
                    </TabPanel>
                    <TabPanel>
                      {isOrganizer || isAdmin ? (
                        <>
                          <VStack spacing="4" mb="2rem" align="stretch" width="100%">
                            <Text fontSize={fontSizeText}>
                              {isEditing ? 'Редактировать мероприятие' : 'Создать новое мероприятие'}
                            </Text>
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
                                min={(() => {
                                  const tomorrow = new Date();
                                  tomorrow.setDate(tomorrow.getDate() + 1);
                                  return tomorrow.toISOString().slice(0, 16);
                                })()}
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
                                ref={fileInputRef}
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
                              />
                              <Button
                                bg="#2E4FD7"
                                color="white"
                                _hover={{ bg: '#1e3fa9' }}
                                size={buttonSize}
                                onClick={() => fileInputRef.current?.click()}
                              >
                                Выбрать изображение
                              </Button>
                              {imagePreview && (
                                <Box mt="4" textAlign="center">
                                  <img
                                    src={imagePreview}
                                    alt="Превью"
                                    style={{
                                      maxWidth: '400px',
                                      borderRadius: '8px',
                                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                      display: 'block',
                                      margin: '0 auto',
                                    }}
                                  />
                                </Box>
                              )}
                            </FormControl>
                            <FormControl>
                              <FormLabel>Ссылка на Telegram-чат</FormLabel>
                              <Input
                                value={newEvent.telegram_chat_link}
                                onChange={(e) => setNewEvent({ ...newEvent, telegram_chat_link: e.target.value })}
                                placeholder="Ссылка на Telegram-чат"
                                bg="#E7EBFC"
                                size={buttonSize}
                              />
                            </FormControl>
                            <HStack spacing="2">
                              {isEditing ? (
                                <>
                                  <Button
                                    bg="#2E4FD7"
                                    color="white"
                                    _hover={{ bg: '#1e3fa9' }}
                                    onClick={() => editingEventId && handleUpdateEvent(editingEventId)}
                                    isDisabled={isLoading}
                                    size={buttonSize}
                                  >
                                    Сохранить изменения
                                  </Button>
                                  <Button
                                    bg="gray.500"
                                    color="white"
                                    _hover={{ bg: 'gray.600' }}
                                    onClick={() => {
                                      setIsEditing(false);
                                      setEditingEventId(null);
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
                                      setTabIndex(2);
                                    }}
                                    isDisabled={isLoading}
                                    size={buttonSize}
                                  >
                                    Отменить редактирование
                                  </Button>
                                </>
                              ) : (
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
                              )}
                            </HStack>
                          </VStack>
                          {isMobile ? (
                            <OwnEventsCards events={ownEvents} />
                          ) : (
                            <Box>
                              <Text fontSize={fontSizeText} mb="1rem">
                                Мои созданные мероприятия
                              </Text>
                              {/* Active Events Table */}
                              <Box mb="6">
                                <Text fontSize={fontSizeText} fontWeight="bold" mb="4">
                                  Активные мероприятия
                                </Text>
                                <Box overflowX="auto">
                                  <Table variant="simple" minWidth="800px">
                                    <Thead>
                                      <Tr>
                                        <Th>Название</Th>
                                        <Th>Дата</Th>
                                        <Th>Место</Th>
                                        <Th>Действия</Th>
                                      </Tr>
                                    </Thead>
                                    <Tbody>
                                      {ownEvents
                                        .filter((event) => new Date(event.date) > new Date())
                                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                        .map((event) => (
                                          <Tr key={event.id} id={`event-${event.id}`}>
                                            <Td>{event.title}</Td>
                                            <Td>{formatDateTime(event.date)}</Td>
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
                                                    if (event.image) {
                                                      setImagePreview(event.image);
                                                    }
                                                    setIsEditing(true);
                                                    setEditingEventId(event.id);
                                                  }}
                                                  isDisabled={isLoading}
                                                >
                                                  Редактировать
                                                </Button>
                                                <Button
                                                  size={buttonSize}
                                                  colorScheme="red"
                                                  onClick={() => handleDeleteClick(event.id)}
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
                                  {ownEvents.filter((event) => new Date(event.date) > new Date()).length === 0 && (
                                    <Text fontSize={fontSizeText} color="gray.600" mt="4">
                                      Нет активных мероприятий
                                    </Text>
                                  )}
                                </Box>
                              </Box>
                              {/* Archived Events Table */}
                              <Box>
                                <Text fontSize={fontSizeText} fontWeight="bold" mb="4">
                                  Архив
                                </Text>
                                <Box overflowX="auto">
                                  <Table variant="simple" minWidth="800px">
                                    <Thead>
                                      <Tr>
                                        <Th>Название</Th>
                                        <Th>Дата</Th>
                                        <Th>Место</Th>
                                        <Th>Действия</Th>
                                      </Tr>
                                    </Thead>
                                    <Tbody>
                                      {ownEvents
                                        .filter((event) => new Date(event.date) <= new Date())
                                        .map((event) => (
                                          <Tr key={event.id} id={`event-${event.id}`}>
                                            <Td>{event.title}</Td>
                                            <Td>{formatDateTime(event.date)}</Td>
                                            <Td>{event.location}</Td>
                                            <Td>
                                              <HStack spacing="2">
                                                <Button
                                                  size={buttonSize}
                                                  colorScheme="teal"
                                                  onClick={() => navigate(`/event/${event.id}`)}
                                                  isDisabled={isLoading}
                                                >
                                                  Перейти
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
                                  {ownEvents.filter((event) => new Date(event.date) <= new Date()).length === 0 && (
                                    <Text fontSize={fontSizeText} color="gray.600" mt="4">
                                      Нет мероприятий в архиве
                                    </Text>
                                  )}
                                </Box>
                              </Box>
                            </Box>
                          )}
                          {eventRequests.length > 0 && (
                            <VStack spacing="4" mt="2rem" align="stretch" width="100%">
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
                        <VStack spacing="4" width="100%">
                          <Text fontSize={fontSizeText}>
                            {organizerRequests[0]?.status_id === 2 && user?.role_id === 1
                              ? "Вы больше не организатор. Спасибо за вклад в развитие проекта!"
                              : "Вы не являетесь организатором"}
                          </Text>
                          <Button
                            bg="#2E4FD7"
                            color="white"
                            _hover={{ bg: '#1e3fa9' }}
                            onClick={() => {
                              setModalType('organizer');
                              onOpen();
                            }}
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
                                : organizerRequests[0].status_id === 2 && user?.role_id === 1
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
              </>
            )}
            {!isAdmin && (!user?.telegram || user?.telegram.startsWith('PENDING_')) && (
              <VStack spacing="4" mt="2rem" align="stretch" width="100%">
                <Text fontSize={fontSizeText}>
                  {user?.telegram
                    ? `Подтвердите привязку Telegram-тега ${user.telegram.replace('PENDING_', '')} в течение 2 минут`
                    : "Привяжите ваш Telegram-аккаунт"}
                </Text>
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
                  {user?.telegram ? "Подтвердить Telegram" : "Привязать Telegram"}
                </Button>
              </VStack>
            )}
          </motion.div>
        </Box>
      )}
      <Footer />
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {modalType === 'delete' && 'Подтверждение удаления'}
            {modalType === 'organizer' && 'Подтверждение запроса'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {modalType === 'delete' && (
              <Text>Вы уверены, что хотите удалить это мероприятие?</Text>
            )}
            {modalType === 'organizer' && (
              <Text>Вы уверены, что хотите запросить статус организатора?</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Отмена
            </Button>
            {modalType === 'delete' && (
              <Button
                bg="red.500"
                color="white"
                _hover={{ bg: 'red.600' }}
                onClick={handleConfirmDelete}
                isLoading={isLoading}
              >
                Удалить
              </Button>
            )}
            {modalType === 'organizer' && (
              <Button
                bg="#2E4FD7"
                color="white"
                _hover={{ bg: '#1e3fa9' }}
                onClick={handleCreateOrganizerRequest}
                isLoading={isLoading}
              >
                Подтвердить
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Cabinet;