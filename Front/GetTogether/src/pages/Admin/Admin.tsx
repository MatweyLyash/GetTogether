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
  deleteEventByAdmin,
  updateEventByAdmin,
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
  telegram:string|null;
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
  const { isOpen: isDeleteCategoryModalOpen, onOpen: onDeleteCategoryModalOpen, onClose: onDeleteCategoryModalClose } = useDisclosure();
  const { isOpen: isDeleteEventModalOpen, onOpen: onDeleteEventModalOpen, onClose: onDeleteEventModalClose } = useDisclosure();
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const toast = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setCategoryToDelete(categoryId);
    onDeleteCategoryModalOpen();
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    setIsLoading(true);
    try {
      await deleteCategory(categoryToDelete);
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
      onDeleteCategoryModalClose();
      setCategoryToDelete(null);
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

      await updateEventByAdmin(eventId, formData);
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
    setEventToDelete(eventId);
    onDeleteEventModalOpen();
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    setIsLoading(true);
    try {
      await deleteEventByAdmin(eventToDelete);
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
      onDeleteEventModalClose();
      setEventToDelete(null);
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
            style={{ width: '100%' }}
          >
            <Heading size="xl" mb="2rem">
              Панель администратора
            </Heading>
            <Tabs variant="soft-rounded" colorScheme="blue">
              <TabList mb="1rem" whiteSpace="nowrap">
                <Tab>Категории</Tab>
                <Tab>Пользователи</Tab>
                <Tab>Запросы организаторов</Tab>
                <Tab>Мероприятия</Tab>
              </TabList>
              <TabPanels>
                {/* Categories */}
                <TabPanel>
                  <VStack spacing="2rem" align="stretch" width="100%">
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
                    <Box overflowX="auto">
                      <Table variant="simple" minWidth="600px">
                        <Thead>
                          <Tr>
                            <Th>Название</Th>
                            <Th>Действия</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {categories.map((cat) => (
                            <Tr key={cat.id}>
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
                    </Box>
                  </VStack>
                </TabPanel>

                {/* Users */}
                <TabPanel>
                  <VStack spacing="4" align="stretch" width="100%">
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
                    <Box overflowX="auto">
                      <Table variant="simple" minWidth="800px">
                        <Thead>
                          <Tr>
                            <Th>ID пользователя</Th>
                            <Th>Логин</Th>
                            <Th>Телеграм</Th>
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
                              <Td>{u.telegram ? `${u.telegram}` : 'Нет'}</Td>
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
                    </Box>
                  </VStack>
                </TabPanel>

                {/* Organizer Requests */}
                <TabPanel>
                  <VStack spacing="4" align="stretch" width="100%">
                    <Heading size="md" mb="2rem">
                      Запросы на роль организатора
                    </Heading>
                    <Box overflowX="auto">
                      <Table variant="simple" minWidth="600px">
                        <Thead>
                          <Tr>
                            <Th>ID Пользователя</Th>
                            <Th>Статус</Th>
                            <Th>Действия</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {organizerRequests.map((req) => (
                            <Tr key={req.id}>
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
                    </Box>
                  </VStack>
                </TabPanel>

                {/* Events */}
                <TabPanel>
                  <VStack spacing="2rem" align="stretch" width="100%">
                    <Heading size="md">Управление мероприятиями</Heading>
                    {editEvent && (
                      <VStack spacing="4" align="stretch" mb="2rem">
                        <Text fontSize="lg">
                          Редактировать мероприятие
                        </Text>
                        <FormControl>
                          <FormLabel>Название</FormLabel>
                          <Input
                            value={editEvent.title}
                            onChange={(e) =>
                              setEditEvent({ ...editEvent, title: e.target.value })
                            }
                            placeholder="Название мероприятия"
                            bg="#E7EBFC"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Описание</FormLabel>
                          <Input
                            value={editEvent.description}
                            onChange={(e) =>
                              setEditEvent({ ...editEvent, description: e.target.value })
                            }
                            placeholder="Описание мероприятия"
                            bg="#E7EBFC"
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
                            bg="#E7EBFC"
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
                            value={editEvent.location}
                            onChange={(e) =>
                              setEditEvent({ ...editEvent, location: e.target.value })
                            }
                            placeholder="Место проведения"
                            bg="#E7EBFC"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Категория</FormLabel>
                          <Select
                            value={editEvent.category_id}
                            onChange={(e) =>
                              setEditEvent({ ...editEvent, category_id: Number(e.target.value) })
                            }
                            placeholder="Выберите категорию"
                            bg="#E7EBFC"
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
                            placeholder="Цена"
                            bg="#E7EBFC"
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
                            placeholder="Вместимость"
                            bg="#E7EBFC"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Ссылка на Telegram-чат</FormLabel>
                          <Input
                            value={editEvent.telegram_chat_link || ''}
                            onChange={(e) =>
                              setEditEvent({ ...editEvent, telegram_chat_link: e.target.value })
                            }
                            placeholder="Ссылка на Telegram-чат (опционально)"
                            bg="#E7EBFC"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Изображение</FormLabel>
                          
                          <Button
                            bg="#2E4FD7"
                            color="white"
                            _hover={{ bg: '#1e3fa9' }}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Выбрать изображение
                          </Button>
                          {imagePreview ? (
                            <Box mt="4" textAlign="center">
                              <Text fontWeight="bold" mb="2">Новое изображение (превью):</Text>
                              <Image
                                src={imagePreview}
                                alt="Превью нового изображения"
                                maxW="400px"
                                borderRadius="8px"
                                boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
                                display="block"
                                margin="0 auto"
                              />
                            </Box>
                          ) : editEvent.image && (
                            <Box mt="4" textAlign="center">
                              <Text fontWeight="bold" mb="2">Текущее изображение:</Text>
                              <Image
                                src={editEvent.image}
                                alt="Текущее изображение мероприятия"
                                maxW="400px"
                                borderRadius="8px"
                                boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
                                display="block"
                                margin="0 auto"
                              />
                            </Box>
                          )}
                        </FormControl>
                        <HStack spacing="2">
                          <Button
                            bg="#2E4FD7"
                            color="white"
                            _hover={{ bg: '#1e3fa9' }}
                            onClick={() => handleUpdateEvent(editEvent.id)}
                            isDisabled={isLoading}
                          >
                            Сохранить изменения
                          </Button>
                          <Button
                            bg="gray.500"
                            color="white"
                            _hover={{ bg: 'gray.600' }}
                            onClick={() => {
                              setEditEvent(null);
                              setEventImage(null);
                              setImagePreview(null);
                            }}
                            isDisabled={isLoading}
                          >
                            Отменить редактирование
                          </Button>
                        </HStack>
                      </VStack>
                    )}
                    <Box overflowX="auto">
                      <Table variant="simple" minWidth="800px">
                        <Thead>
                          <Tr>
                            <Th>Название</Th>
                            <Th>Дата</Th>
                            <Th>Локация</Th>
                            <Th>Действия</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {events.map((event) => (
                            <Tr key={event.id}>
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
                    </Box>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </motion.div>
        </Box>
      )}

      {/* Delete Category Modal */}
      <Modal isOpen={isDeleteCategoryModalOpen} onClose={onDeleteCategoryModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Подтверждение удаления</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Вы уверены, что хотите удалить эту категорию? При удалении категории все активные мероприятия станут не активными. Не расстраивайте пользователей</Text>
          </ModalBody>
          <ModalFooter>
            <Button
              bg="gray.500"
              color="white"
              _hover={{ bg: 'gray.600' }}
              mr={3}
              onClick={onDeleteCategoryModalClose}
              isDisabled={isLoading}
            >
              Отмена
            </Button>
            <Button
              bg="red.500"
              color="white"
              _hover={{ bg: 'red.600' }}
              onClick={confirmDeleteCategory}
              isDisabled={isLoading}
            >
              Удалить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Event Modal */}
      <Modal isOpen={isDeleteEventModalOpen} onClose={onDeleteEventModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Подтверждение удаления</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Вы уверены, что хотите удалить это мероприятие? Мероприятие станет не активным, а неподтверждённые заявки будут откланены</Text>
          </ModalBody>
          <ModalFooter>
            <Button
              bg="gray.500"
              color="white"
              _hover={{ bg: 'gray.600' }}
              mr={3}
              onClick={onDeleteEventModalClose}
              isDisabled={isLoading}
            >
              Отмена
            </Button>
            <Button
              bg="red.500"
              color="white"
              _hover={{ bg: 'red.600' }}
              onClick={confirmDeleteEvent}
              isDisabled={isLoading}
            >
              Удалить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleImageChange}
      />

      <Footer />
    </Box>
  );
}

export default Admin;