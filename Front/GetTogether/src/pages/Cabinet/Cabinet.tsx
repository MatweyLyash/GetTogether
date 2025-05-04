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
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
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
  price: number;
  capacity: number;
  telegram_chat_link: string | null;
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
  category_name: string; // Updated to match backend
}

interface EventRequest {
  id: string;
  user_id: string;
  event_id: string;
  status_id: number;
}

function Cabinet() {
  const { user } = useAuth();
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
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const isOrganizer = user?.role_id === 2;

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const regs = await getOwnEventsRegistration();
        const orgRequests = await getOwnOrganizerRequests();
        const cats = await getCategories();

        setRegistrations(regs || []);
        setOrganizerRequests(orgRequests || []);
        setCategories(cats || []);

        let events: Event[] = [];
        if (isOrganizer) {
          events = await getOwnEvents();
          setOwnEvents(events || []);
        }

        if (!regs?.length) {
          toast({
            title: 'Информация',
            description: 'Нет зарегистрированных мероприятий',
            status: 'info',
            duration: 3000,
            isClosable: true,
          });
        }
        if (!orgRequests?.length) {
          toast({
            title: 'Информация',
            description: 'Нет запросов на статус организатора',
            status: 'info',
            duration: 3000,
            isClosable: true,
          });
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
        if (isOrganizer && !events?.length) {
          toast({
            title: 'Информация',
            description: 'Нет созданных мероприятий',
            status: 'info',
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
  }, [user, isOrganizer, toast]);

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
    // TODO: Implement cancel registration functionality
    // This requires backend support
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
    setIsLoading(true);
    try {
      const event = await createEvent({
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        location: newEvent.location,
        category_id: Number(newEvent.category_id),
        price: Number(newEvent.price),
        capacity: Number(newEvent.capacity),
        telegram_chat_link: newEvent.telegram_chat_link || null,
      });
      setOwnEvents([...ownEvents, event]);
      setNewEvent({
        title: '',
        description: '',
        date: '',
        location: '',
        category_id: '',
        price: '',
        capacity: '',
        telegram_chat_link: '',
      });
      toast({
        title: 'Успех',
        description: 'Мероприятие создано',
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
    setIsLoading(true);
    try {
      await updateEvent(event_id, {
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        location: newEvent.location,
        category_id: Number(newEvent.category_id),
        price: Number(newEvent.price),
        capacity: Number(newEvent.capacity),
        telegram_chat_link: newEvent.telegram_chat_link || null,
      });
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
      });
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
    setIsLoading(true);
    try {
      const requests = await getEventRequests(event_id);
      setEventRequests(requests || []);
      if (!requests?.length) {
        toast({
          title: 'Информация',
          description: 'Заявок на мероприятие нет',
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

  return (
    <Box className={styles.container}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
          body { font-family: 'Inter', sans-serif; }
        `}
      </style>
      <Header />
      <Box className={styles.content}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Heading as="h1" size="xl" mb="1rem" color="#2E4FD7">
            Личный кабинет
          </Heading>
          <Text fontSize="lg" mb="2rem" color="gray.600">
            Пользователь: {user?.login || 'Гость'}
          </Text>
          <Tabs variant="soft-rounded" colorScheme="blue">
            <TabList mb="1rem">
              <Tab>Будущие</Tab>
              <Tab>Прошедшие</Tab>
              <Tab>Мои созданные</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Text fontSize="lg" mb="1rem">
                  Ваши будущие мероприятия
                </Text>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Название</Th>
                      <Th>Дата</Th>
                      <Th>Место</Th>
                      <Th>Статус</Th>
                      {/* <Th>Действия</Th> */}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {registrations
                      .filter((reg) => new Date(reg.event.date) > new Date())
                      .map((reg) => (
                        <Tr key={reg.id}>
                          <Td>{reg.event.title}</Td>
                          <Td>{new Date(reg.event.date).toLocaleDateString()}</Td>
                          <Td>{reg.event.location}</Td>
                          <Td>
                            {reg.status_id === 1 ? 'Ожидает' : reg.status_id === 2 ? 'Подтверждено' : 'Отклонено'}
                          </Td>
                          {/* <Td>
                            <Button
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleCancelRegistration(reg.id)}
                              isDisabled={isLoading}
                            >
                              Отменить
                            </Button>
                          </Td> */}
                        </Tr>
                      ))}
                  </Tbody>
                </Table>
              </TabPanel>
              <TabPanel>
                <Text fontSize="lg" mb="1rem">
                  Прошедшие мероприятия
                </Text>
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
                      .filter((reg) => new Date(reg.event.date) <= new Date() && reg.status_id === 2)
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
                              />
                              <Button
                                colorScheme="blue"
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
              </TabPanel>
              <TabPanel>
                <Text fontSize="lg" mb="1rem">
                  Мои созданные мероприятия
                </Text>
                {isOrganizer ? (
                  <>
                    <VStack spacing="4" mb="2rem" align="start">
                      <Text fontSize="lg">Создать новое мероприятие</Text>
                      <FormControl>
                        <FormLabel>Название</FormLabel>
                        <Input
                          value={newEvent.title}
                          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                          placeholder="Название мероприятия"
                          bg="#E7EBFC"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Описание</FormLabel>
                        <Textarea
                          value={newEvent.description}
                          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                          placeholder="Описание мероприятия"
                          bg="#E7EBFC"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Дата</FormLabel>
                        <Input
                          type="datetime-local"
                          value={newEvent.date}
                          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                          bg="#E7EBFC"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Место</FormLabel>
                        <Input
                          value={newEvent.location}
                          onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                          placeholder="Место проведения"
                          bg="#E7EBFC"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Категория</FormLabel>
                        <Select
                          value={newEvent.category_id}
                          onChange={(e) => setNewEvent({ ...newEvent, category_id: e.target.value })}
                          placeholder="Выберите категорию"
                          bg="#E7EBFC"
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.category_name} {/* Updated to category_name */}
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
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Ссылка на Telegram-чат</FormLabel>
                        <Input
                          value={newEvent.telegram_chat_link}
                          onChange={(e) => setNewEvent({ ...newEvent, telegram_chat_link: e.target.value })}
                          placeholder="Ссылка на Telegram-чат (опционально)"
                          bg="#E7EBFC"
                        />
                      </FormControl>
                      <Button
                        bg="#2E4FD7"
                        color="white"
                        _hover={{ bg: '#1e3fa9' }}
                        onClick={handleCreateEvent}
                        isDisabled={isLoading}
                      >
                        Создать мероприятие
                      </Button>
                    </VStack>
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
                                  size="sm"
                                  colorScheme="blue"
                                  onClick={() => {
                                    setNewEvent({
                                      title: event.title,
                                      description: event.description,
                                      date: event.date.slice(0, 16), // Format for datetime-local
                                      location: event.location,
                                      category_id: event.category_id.toString(),
                                      price: event.price.toString(),
                                      capacity: event.capacity.toString(),
                                      telegram_chat_link: event.telegram_chat_link || '',
                                    });
                                  }}
                                  isDisabled={isLoading}
                                >
                                  Редактировать
                                </Button>
                                <Button
                                  size="sm"
                                  colorScheme="blue"
                                  onClick={() => handleUpdateEvent(event.id)}
                                  isDisabled={isLoading}
                                >
                                  Сохранить
                                </Button>
                                <Button
                                  size="sm"
                                  colorScheme="red"
                                  onClick={() => handleDeleteEvent(event.id)}
                                  isDisabled={isLoading}
                                >
                                  Удалить
                                </Button>
                                <Button
                                  size="sm"
                                  colorScheme="green"
                                  onClick={() => handleFetchEventRequests(event.id)}
                                  isDisabled={isLoading}
                                >
                                  Просмотреть заявки
                                </Button>
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                    {eventRequests.length > 0 && (
                      <VStack spacing="4" mt="2rem" align="start">
                        <Text fontSize="lg">Заявки на мероприятие</Text>
                        {eventRequests.map((req) => (
                          <VStack key={req.id} spacing="2" borderWidth="1px" p="4" borderRadius="md">
                            <Text>Пользователь ID: {req.user_id}</Text>
                            <Text>
                              Статус:{' '}
                              {req.status_id === 1 ? 'Ожидает' : req.status_id === 2 ? 'Подтверждено' : 'Отклонено'}
                            </Text>
                            <HStack spacing="2">
                              <Button
                                size="sm"
                                colorScheme="green"
                                onClick={() => handleResponseToEventRequest(req.event_id, req.user_id, 2)}
                                isDisabled={isLoading || req.status_id !== 1}
                              >
                                Подтвердить
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="red"
                                onClick={() => handleResponseToEventRequest(req.event_id, req.user_id, 3)}
                                isDisabled={isLoading || req.status_id !== 1}
                              >
                                Отклонить
                              </Button>
                            </HStack>
                          </VStack>
                        ))}
                      </VStack>
                    )}
                  </>
                ) : (
                  <VStack spacing="4">
                    <Text>Вы не являетесь организатором</Text>
                    <Button
                      bg="#2E4FD7"
                      color="white"
                      _hover={{ bg: '#1e3fa9' }}
                      onClick={handleCreateOrganizerRequest}
                      isDisabled={isLoading || organizerRequests.length > 0}
                    >
                      Запросить статус организатора
                    </Button>
                    {organizerRequests.length > 0 && (
                      <Text>
                        Статус запроса:{' '}
                        {organizerRequests[0].status_id === 1
                          ? 'Ожидает'
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
          <VStack spacing="4" mt="2rem" align="start">
            <Text fontSize="lg">Привязка Telegram</Text>
            <FormControl>
              <FormLabel>Telegram</FormLabel>
              <Input
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="@username"
                bg="#E7EBFC"
              />
            </FormControl>
            <Button
              bg="#2E4FD7"
              color="white"
              _hover={{ bg: '#1e3fa9' }}
              onClick={handleLinkTelegram}
              isDisabled={isLoading}
            >
              Привязать Telegram
            </Button>
          </VStack>
        </motion.div>
      </Box>
      <Footer />
    </Box>
  );
}

export default Cabinet;