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
  Input,
  Select,
  FormControl,
  FormLabel,
  VStack,
  HStack,
  useToast,
  Spinner,
  Flex,
  Image,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../AuthContext/AuthContext';
import {
  getCategories,
  getEvents,
  addCategory,
  renameCategory,
  deleteCategory,
  getUsers,
  banUser,
  organizerResponse,
  unassignOrganizer,
  updateEvent,
  deleteEvent,
  getOrganizerRequests,
} from '../../api/api';
import styles from './Admin.module.scss';

// Types
interface Category {
  id: number;
  category_name: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category_id: number;
  price: number;
  capacity: number;
  image: string | null;
  telegram_chat_link: string | null;
  creator_id: string | undefined;
  created_at?: string;
  updated_at?: string;
  organizer_verification_key?: string;
  telegram_chat_id?: string | null;
}

interface User {
  id: string;
  login: string;
  role_id: number;
  is_blocked?: boolean;
}

interface OrganizerRequest {
  id: string;
  user_id: string;
  status_id: number;
}

function Admin() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [organizerRequests, setOrganizerRequests] = useState<OrganizerRequest[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editCategory, setEditCategory] = useState<{ id: number; name: string } | null>(null);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>(''); // Фильтр по роли
  const [searchQuery, setSearchQuery] = useState(''); // Поиск по имени
  const toast = useToast();
  const navigate = useNavigate();

  // Check admin access
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role_id !== 3)) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      if (authLoading || !user || user.role_id !== 3) return;
      setIsLoading(true);
      try {
        const [catData, eventData, userData, requestData] = await Promise.all([
          getCategories(),
          getEvents(),
          getUsers(),
          getOrganizerRequests(),
        ]);
        setCategories(catData || []);
        setOrganizerRequests(requestData || []);
        setEvents((eventData || []).map((event: any) => ({
          ...event,
          creator_id: event.creator_id || undefined,
        })));
        setUsers((userData || []).map((user: any) => ({
          ...user,
          is_blocked: user.is_blocked || false,
        })));
        const requests = Array.isArray(requestData) ? requestData : [];
        setOrganizerRequests(requests);
      } catch (error: any) {
        toast({
          title: 'Ошибка загрузки данных',
          description: error.message || 'Не удалось загрузить данные',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [authLoading, user, toast]);

  // Handle image selection and preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setEventImage(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview(null);
    }
  };

  // Clean up image preview URL
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Add category
  const handleAddCategory = async () => {
    if (!newCategory) {
      toast({
        title: 'Ошибка',
        description: 'Введите название категории',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsLoading(true);
    try {
      await addCategory({ category_name: newCategory });
      const updatedCategories = await getCategories();
      setCategories(updatedCategories);
      setNewCategory('');
      toast({
        title: 'Успех',
        description: 'Категория добавлена',
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

  // Rename category
  const handleRenameCategory = async (categoryId: number) => {
    if (!editCategory || !editCategory.name) {
      toast({
        title: 'Ошибка',
        description: 'Введите новое название категории',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsLoading(true);
    try {
      await renameCategory(categoryId, { category_name: editCategory.name });
      const updatedCategories = await getCategories();
      setCategories(updatedCategories);
      setEditCategory(null);
      toast({
        title: 'Успех',
        description: 'Категория переименована',
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

  // Delete category
  const handleDeleteCategory = async (categoryId: number) => {
    setIsLoading(true);
    try {
      await deleteCategory(categoryId);
      const updatedCategories = await getCategories();
      setCategories(updatedCategories);
      toast({
        title: 'Успех',
        description: 'Категория удалена',
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

  // Ban/unban user
  const handleBanUser = async (userId: string, isBanned: boolean) => {
    if (userId === user?.id) {
      toast({
        title: 'Ошибка',
        description: 'Нельзя забанить самого себя',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsLoading(true);
    try {
      await banUser(userId, !isBanned);
      const updatedUsers = await getUsers();
      setUsers((updatedUsers || []).map((user: any) => ({
        ...user,
        is_blocked: user.is_blocked || false,
      })));
      toast({
        title: 'Успех',
        description: `Пользователь ${isBanned ? 'разбанен' : 'заблокирован'}`,
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

  // Respond to organizer request
  const handleOrganizerResponse = async (requestId: string, approve: boolean) => {
    setIsLoading(true);
    try {
      await organizerResponse(requestId, approve ? 2 : 3); // 2 = Approved, 3 = Rejected
      const updatedRequests = await getOrganizerRequests();
      setOrganizerRequests(updatedRequests || []);
      toast({
        title: 'Успех',
        description: `Запрос ${approve ? 'одобрен' : 'отклонен'}`,
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

  // Unassign organizer
  const handleUnassignOrganizer = async (userId: string) => {
    setIsLoading(true);
    try {
      await unassignOrganizer(userId);
      const updatedUsers = await getUsers();
      setUsers((updatedUsers || []).map((user: any) => ({
        ...user,
        is_blocked: user.is_blocked || false,
      })));
      toast({
        title: 'Успех',
        description: 'Роль организатора снята',
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
  const handleUpdateEvent = async (eventId: string) => {
    if (
      !editEvent ||
      !editEvent.title ||
      !editEvent.description ||
      !editEvent.date ||
      !editEvent.location ||
      !editEvent.category_id ||
      !editEvent.price ||
      !editEvent.capacity
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
      const formData = new FormData();
      formData.append('title', editEvent.title);
      formData.append('description', editEvent.description);
      formData.append('date', editEvent.date);
      formData.append('location', editEvent.location);
      formData.append('category_id', String(editEvent.category_id));
      formData.append('price', String(editEvent.price));
      formData.append('capacity', String(editEvent.capacity));
      if (editEvent.telegram_chat_link) {
        formData.append('telegram_chat_link', editEvent.telegram_chat_link);
      }
      if (eventImage) {
        formData.append('image', eventImage);
      }

      await updateEvent(eventId, formData);
      const updatedEvents = await getEvents();
      setEvents((updatedEvents || []).map((event: any) => ({
        ...event,
        creator_id: event.creator_id || undefined,
      })));
      setEditEvent(null);
      setEventImage(null);
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
  const handleDeleteEvent = async (eventId: string) => {
    setIsLoading(true);
    try {
      await deleteEvent(eventId);
      const updatedEvents = await getEvents();
      setEvents((updatedEvents || []).map((event: any) => ({
        ...event,
        creator_id: event.creator_id || undefined,
      })));
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

  // Filter users by role and search query
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter ? u.role_id === Number(roleFilter) : true;
    const matchesSearch = u.login.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <Box className={styles.container} mx="auto">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
          body { font-family: 'Inter', sans-serif; }
        `}
      </style>
      <Header />
      {authLoading ? (
        <Flex justify="center" py="4rem">
          <Spinner size="xl" />
        </Flex>
      ) : !user || user.role_id !== 3 ? (
        <Text textAlign="center" fontSize="lg">
          Доступ запрещен. Перенаправление...
        </Text>
      ) : (
        <Box className={styles.content}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Heading size="xl" mb="2rem">
              Панель администратора
            </Heading>
            <Tabs variant="soft-rounded" colorScheme="blue">
              <TabList mb="1rem">
                <Tab>Категории</Tab>
                <Tab>Пользователи</Tab>
                <Tab>Запросы организаторов</Tab>
                <Tab>Мероприятия</Tab>
              </TabList>
              <TabPanels>
                {/* Categories */}
                <TabPanel>
                  <VStack spacing="2rem" align="stretch">
                    <Heading size="md">Управление категориями</Heading>
                    <FormControl>
                      <FormLabel>Добавить категорию</FormLabel>
                      <HStack>
                        <Input
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="Название категории"
                          bg="#E7EBFC"
                        />
                        <Button
                          bg="#2E4FD7"
                          color="white"
                          _hover={{ bg: '#1e3fa9' }}
                          onClick={handleAddCategory}
                          isDisabled={isLoading}
                        >
                          Добавить
                        </Button>
                      </HStack>
                    </FormControl>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>ID</Th>
                          <Th>Название</Th>
                          <Th>Действия</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {categories.map((cat) => (
                          <Tr key={cat.id}>
                            <Td>{cat.id}</Td>
                            <Td>
                              {editCategory?.id === cat.id ? (
                                <Input
                                  value={editCategory.name}
                                  onChange={(e) =>
                                    setEditCategory({ id: cat.id, name: e.target.value })
                                  }
                                  bg="#E7EBFC"
                                />
                              ) : (
                                cat.category_name
                              )}
                            </Td>
                            <Td>
                              <HStack spacing="2">
                                {editCategory?.id === cat.id ? (
                                  <>
                                    <Button
                                      colorScheme="blue"
                                      size="sm"
                                      onClick={() => handleRenameCategory(cat.id)}
                                      isDisabled={isLoading}
                                    >
                                      Сохранить
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setEditCategory(null)}
                                      isDisabled={isLoading}
                                    >
                                      Отмена
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    colorScheme="blue"
                                    size="sm"
                                    onClick={() =>
                                      setEditCategory({ id: cat.id, name: cat.category_name })
                                    }
                                    isDisabled={isLoading}
                                  >
                                    Переименовать
                                  </Button>
                                )}
                                <Button
                                  colorScheme="red"
                                  size="sm"
                                  onClick={() => handleDeleteCategory(cat.id)}
                                  isDisabled={isLoading}
                                >
                                  Удалить
                                </Button>
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </VStack>
                </TabPanel>

                {/* Users */}
                <TabPanel>
                  <VStack spacing="4" align="stretch">
                    <Heading size="md" mb="2rem">
                      Управление пользователями
                    </Heading>
                    <HStack spacing="4" mb="4">
                      <FormControl maxW="200px">
                        <FormLabel>Фильтр по роли</FormLabel>
                        <Select
                          value={roleFilter}
                          onChange={(e) => setRoleFilter(e.target.value)}
                          placeholder="Все роли"
                          bg="#E7EBFC"
                        >
                          <option value="1">Пользователь</option>
                          <option value="2">Организатор</option>
                          <option value="3">Админ</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Поиск по имени</FormLabel>
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Введите логин"
                          bg="#E7EBFC"
                        />
                      </FormControl>
                    </HStack>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>ID</Th>
                          <Th>Логин</Th>
                          <Th>Роль</Th>
                          <Th>Статус</Th>
                          <Th>Действия</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredUsers.map((u) => (
                          <Tr key={u.id}>
                            <Td>{u.id}</Td>
                            <Td>{u.login}</Td>
                            <Td>
                              {u.role_id === 1
                                ? 'Пользователь'
                                : u.role_id === 2
                                ? 'Организатор'
                                : 'Админ'}
                            </Td>
                            <Td>{u.is_blocked ? 'Заблокирован' : 'Активен'}</Td>
                            <Td>
                              <HStack spacing="2">
                                <Button
                                  colorScheme={u.is_blocked ? 'green' : 'red'}
                                  size="sm"
                                  onClick={() => handleBanUser(u.id, u.is_blocked || false)}
                                  isDisabled={isLoading || u.id === user?.id}
                                >
                                  {u.is_blocked ? 'Разбанить' : 'Забанить'}
                                </Button>
                                {u.role_id === 2 && (
                                  <Button
                                    colorScheme="orange"
                                    size="sm"
                                    onClick={() => handleUnassignOrganizer(u.id)}
                                    isDisabled={isLoading}
                                  >
                                    Снять роль организатора
                                  </Button>
                                )}
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </VStack>
                </TabPanel>

                {/* Organizer Requests */}
                <TabPanel>
                  <Heading size="md" mb="2rem">
                    Запросы на роль организатора
                  </Heading>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>ID Запроса</Th>
                        <Th>ID Пользователя</Th>
                        <Th>Статус</Th>
                        <Th>Действия</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {organizerRequests.map((req) => (
                        <Tr key={req.id}>
                          <Td>{req.id}</Td>
                          <Td>{req.user_id}</Td>
                          <Td>
                            {req.status_id === 1
                              ? 'Ожидает'
                              : req.status_id === 2
                              ? 'Одобрен'
                              : 'Отклонен'}
                          </Td>
                          <Td>
                            <HStack spacing="2">
                              <Button
                                colorScheme="green"
                                size="sm"
                                onClick={() => handleOrganizerResponse(req.id, true)}
                                isDisabled={isLoading || req.status_id !== 1}
                              >
                                Одобрить
                              </Button>
                              <Button
                                colorScheme="red"
                                size="sm"
                                onClick={() => handleOrganizerResponse(req.id, false)}
                                isDisabled={isLoading || req.status_id !== 1}
                              >
                                Отклонить
                              </Button>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TabPanel>

                {/* Events */}
                <TabPanel>
                  <VStack spacing="2rem" align="stretch">
                    <Heading size="md">Управление мероприятиями</Heading>
                    {editEvent && (
                      <VStack spacing="4" align="stretch" bg="#E7EBFC" p="4" borderRadius="md">
                        <Heading size="sm">Редактировать мероприятие</Heading>
                        <FormControl>
                          <FormLabel>Название</FormLabel>
                          <Input
                            value={editEvent.title}
                            onChange={(e) =>
                              setEditEvent({ ...editEvent, title: e.target.value })
                            }
                            bg="white"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Описание</FormLabel>
                          <Input
                            value={editEvent.description}
                            onChange={(e) =>
                              setEditEvent({ ...editEvent, description: e.target.value })
                            }
                            bg="white"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Дата</FormLabel>
                          <Input
                            type="datetime-local"
                            value={editEvent.date.slice(0, 16)}
                            onChange={(e) =>
                              setEditEvent({ ...editEvent, date: e.target.value })
                            }
                            bg="white"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Локация</FormLabel>
                          <Input
                            value={editEvent.location}
                            onChange={(e) =>
                              setEditEvent({ ...editEvent, location: e.target.value })
                            }
                            bg="white"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Категория</FormLabel>
                          <Select
                            value={editEvent.category_id}
                            onChange={(e) =>
                              setEditEvent({ ...editEvent, category_id: Number(e.target.value) })
                            }
                            bg="white"
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
                            value={editEvent.price}
                            onChange={(e) =>
                              setEditEvent({ ...editEvent, price: Number(e.target.value) })
                            }
                            bg="white"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Вместимость</FormLabel>
                          <Input
                            type="number"
                            value={editEvent.capacity}
                            onChange={(e) =>
                              setEditEvent({ ...editEvent, capacity: Number(e.target.value) })
                            }
                            bg="white"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Ссылка на Telegram</FormLabel>
                          <Input
                            value={editEvent.telegram_chat_link || ''}
                            onChange={(e) =>
                              setEditEvent({ ...editEvent, telegram_chat_link: e.target.value })
                            }
                            bg="white"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Изображение</FormLabel>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            bg="white"
                          />
                        </FormControl>
                        <VStack spacing="2" align="stretch">
                          {editEvent.image && (
                            <Box>
                              <Text fontWeight="bold">Текущее изображение:</Text>
                              <Image
                                src={editEvent.image}
                                alt="Текущее изображение мероприятия"
                                maxW="200px"
                                maxH="200px"
                                objectFit="cover"
                                borderRadius="md"
                                mt="2"
                              />
                            </Box>
                          )}
                          {imagePreview && (
                            <Box>
                              <Text fontWeight="bold">Новое изображение (превью):</Text>
                              <Image
                                src={imagePreview}
                                alt="Превью нового изображения"
                                maxW="200px"
                                maxH="200px"
                                objectFit="cover"
                                borderRadius="md"
                                mt="2"
                              />
                            </Box>
                          )}
                        </VStack>
                        <HStack>
                          <Button
                            colorScheme="blue"
                            onClick={() => handleUpdateEvent(editEvent.id)}
                            isDisabled={isLoading}
                          >
                            Сохранить
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditEvent(null);
                              setEventImage(null);
                              setImagePreview(null);
                            }}
                            isDisabled={isLoading}
                          >
                            Отмена
                          </Button>
                        </HStack>
                      </VStack>
                    )}
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>ID</Th>
                          <Th>Название</Th>
                          <Th>Дата</Th>
                          <Th>Локация</Th>
                          <Th>Действия</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {events.map((event) => (
                          <Tr key={event.id}>
                            <Td>{event.id}</Td>
                            <Td>{event.title}</Td>
                            <Td>{new Date(event.date).toLocaleDateString()}</Td>
                            <Td>{event.location}</Td>
                            <Td>
                              <HStack spacing="2">
                                <Button
                                  colorScheme="blue"
                                  size="sm"
                                  onClick={() => setEditEvent(event)}
                                  isDisabled={isLoading}
                                >
                                  Редактировать
                                </Button>
                                <Button
                                  colorScheme="red"
                                  size="sm"
                                  onClick={() => handleDeleteEvent(event.id)}
                                  isDisabled={isLoading}
                                >
                                  Удалить
                                </Button>
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </motion.div>
        </Box>
      )}
      <Footer />
    </Box>
  );
}

export default Admin;