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
  Textarea,
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
  useBreakpointValue,
  Badge,
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
  getOrganizerRequests,
  deleteEventByAdmin,
  updateEventByAdmin,
  adminListAchievements,
  adminCreateAchievement,
  adminUpdateAchievement,
  adminDeleteAchievement,
  Achievement,
  AchievementPayload,
  Tag,
  getTags,
  createTag,
  updateTag,
  deleteTag,
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
  tags?: Tag[];
}

interface User {
  id: string;
  login: string;
  role_id: number;
  telegram: string | null;
  is_blocked?: boolean;
}

interface OrganizerRequest {
  id: string;
  user_id: string;
  status_id: number;
  user?: {
    id: string;
    login: string;
    telegram: string | null;
  };
}

const triggerOptions = [
  { value: 'apply', label: 'Заявка' },
  { value: 'attend', label: 'Посещение' },
  { value: 'category', label: 'Категория' },
];

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
  const [activeTab, setActiveTab] = useState(0); // Для мобильного Select
  const { isOpen: isDeleteCategoryModalOpen, onOpen: onDeleteCategoryModalOpen, onClose: onDeleteCategoryModalClose } = useDisclosure();
  const { isOpen: isDeleteEventModalOpen, onOpen: onDeleteEventModalOpen, onClose: onDeleteEventModalClose } = useDisclosure();
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [achForm, setAchForm] = useState<AchievementPayload>({
    name: '',
    description: '',
    score: 1,
    trigger: 'apply',
    condition_event_id: null,
    condition_category_id: null,
    condition_payload: null,
    image: '',
  });
  const [achImagePreview, setAchImagePreview] = useState<string | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState('');
  const [editTag, setEditTag] = useState<{ id: number; name: string } | null>(null);
  const { isOpen: isDeleteTagModalOpen, onOpen: onDeleteTagModalOpen, onClose: onDeleteTagModalClose } = useDisclosure();
  const [tagToDelete, setTagToDelete] = useState<number | null>(null);
  const toast = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const achFileInputRef = useRef<HTMLInputElement>(null);

  // Определяем, мобильная ли версия
  const isMobile = useBreakpointValue({ base: true, md: false });

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
        const [catData, eventData, userData, requestData, achData, tagData] = await Promise.all([
          getCategories(),
          getEvents(),
          getUsers(),
          getOrganizerRequests(),
          adminListAchievements(),
          getTags(),
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
        setAchievements(achData || []);
        setTags(tagData || []);
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

  // ===== Achievements helpers =====
  const resetAchForm = () => {
    setEditingAchievement(null);
    setAchForm({
      name: '',
      description: '',
      score: 1,
      trigger: 'apply',
      condition_category_id: null,
      condition_payload: null,
      image: '',
    });
    setAchImagePreview(null);
  };

  const handleAchImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setAchForm((f) => ({ ...f, image: '' }));
      setAchImagePreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAchForm((f) => ({ ...f, image: result }));
      setAchImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleAchSubmit = async () => {
    // Валидация: при триггере category нужно выбрать категорию; изображение обязательно
    if (achForm.trigger === 'category' && !achForm.condition_category_id) {
      toast({
        title: 'Ошибка',
        description: 'Выберите категорию для триггера "category".',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    if (!achForm.image) {
      toast({
        title: 'Ошибка',
        description: 'Добавьте изображение для достижения.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      // упрощаем условия: для category оставляем category_id, остальное чистим
      const normalized: AchievementPayload = {
        ...achForm,
        condition_event_id: null,
        condition_payload: null,
        condition_category_id: achForm.trigger === 'category' ? achForm.condition_category_id : null,
      };
      if (editingAchievement) {
        const updated = await adminUpdateAchievement(editingAchievement.id, normalized);
        setAchievements((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        toast({ title: 'Достижение обновлено', status: 'success', duration: 3000, isClosable: true });
      } else {
        const created = await adminCreateAchievement(normalized);
        setAchievements((prev) => [...prev, created]);
        toast({ title: 'Достижение создано', status: 'success', duration: 3000, isClosable: true });
      }
      resetAchForm();
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, status: 'error', duration: 4000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAchEdit = (a: Achievement) => {
    setEditingAchievement(a);
    setAchForm({
      name: a.name,
      description: a.description || '',
      score: a.score,
      trigger: a.trigger,
      condition_category_id: a.condition_category_id || null,
      condition_payload: null,
      image: typeof a.image === 'string' ? a.image : '',
    });
    setAchImagePreview(typeof a.image === 'string' ? a.image : null);
  };

  const handleAchDelete = async (id: number) => {
    try {
      setIsLoading(true);
      await adminDeleteAchievement(id);
      setAchievements((prev) => prev.filter((a) => a.id !== id));
      toast({ title: 'Достижение удалено', status: 'success', duration: 3000, isClosable: true });
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, status: 'error', duration: 4000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

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
        description: 'Нельзя заблокировать самого себя',
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
        description: `Пользователь ${isBanned ? 'разблокирован' : 'заблокирован'}`,
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

  // Tag handlers
  const handleAddTag = async () => {
    if (!newTag) {
      toast({ title: 'Ошибка', description: 'Введите название тега', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    setIsLoading(true);
    try {
      const created = await createTag(newTag);
      setTags([...tags, created]);
      setNewTag('');
      toast({ title: 'Успех', description: 'Тег добавлен', status: 'success', duration: 3000, isClosable: true });
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameTag = async (id: number) => {
    if (!editTag || !editTag.name) {
      toast({ title: 'Ошибка', description: 'Введите название тега', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    setIsLoading(true);
    try {
      const updated = await updateTag(id, editTag.name);
      setTags(tags.map(t => t.id === id ? updated : t));
      setEditTag(null);
      toast({ title: 'Успех', description: 'Тег обновлен', status: 'success', duration: 3000, isClosable: true });
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTag = async (id: number) => {
    setTagToDelete(id);
    onDeleteTagModalOpen();
  };

  const confirmDeleteTag = async () => {
    if (!tagToDelete) return;
    setIsLoading(true);
    try {
      await deleteTag(tagToDelete);
      setTags(tags.filter(t => t.id !== tagToDelete));
      toast({ title: 'Успех', description: 'Тег удален', status: 'success', duration: 3000, isClosable: true });
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
      onDeleteTagModalClose();
      setTagToDelete(null);
    }
  };

  // Filter users by role and search query
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter ? u.role_id === Number(roleFilter) : true;
    const matchesSearch = u.login.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Функция для получения русского названия триггера
  const getTriggerLabel = (trigger: string) => {
    const option = triggerOptions.find(opt => opt.value === trigger);
    return option ? option.label : trigger;
  };

  // Функция для получения названия категории по ID
  const getCategoryName = (categoryId: number | null | undefined) => {
    if (!categoryId) return null;
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.category_name : `ID: ${categoryId}`;
  };

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
            <Heading size={{ base: 'lg', md: 'xl' }} mb="2rem">
              Панель администратора
            </Heading>

            {/* Мобильный Select для выбора раздела */}
            {isMobile && (
              <FormControl mb="1.5rem">
                <FormLabel fontWeight="bold">Выберите раздел</FormLabel>
                <Select
                  value={activeTab}
                  onChange={(e) => setActiveTab(Number(e.target.value))}
                  bg="#E7EBFC"
                  size="lg"
                >
                  <option value={0}>Категории</option>
                  <option value={1}>Пользователи</option>
                  <option value={2}>Запросы организаторов</option>
                  <option value={3}>Мероприятия</option>
                  <option value={4}>Достижения</option>
                  <option value={5}>Теги</option>
                </Select>
              </FormControl>
            )}

            <Tabs
              variant="soft-rounded"
              colorScheme="blue"
              index={activeTab}
              onChange={(index) => setActiveTab(index)}
            >
              {/* Табы только для десктопа */}
              {!isMobile && (
                <TabList mb="1rem" flexWrap="wrap" gap="0.5rem">
                  <Tab>Категории</Tab>
                  <Tab>Пользователи</Tab>
                  <Tab>Запросы организаторов</Tab>
                  <Tab>Мероприятия</Tab>
                  <Tab>Достижения</Tab>
                  <Tab>Теги</Tab>
                </TabList>
              )}
              <TabPanels>
                {/* Categories */}
                <TabPanel px={{ base: 0, md: 4 }}>
                  <VStack spacing="2rem" align="stretch" width="100%">
                    <Heading size="md">Управление категориями</Heading>
                    <FormControl>
                      <FormLabel>Добавить категорию</FormLabel>
                      <VStack spacing="2" align="stretch">
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
                          width={{ base: '100%', md: 'auto' }}
                          alignSelf={{ base: 'stretch', md: 'flex-start' }}
                        >
                          Добавить
                        </Button>
                      </VStack>
                    </FormControl>
                    <Box overflowX="auto">
                      <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
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
                                    size="sm"
                                  />
                                ) : (
                                  cat.category_name
                                )}
                              </Td>
                              <Td>
                                <VStack spacing="1" align="stretch">
                                  {editCategory?.id === cat.id ? (
                                    <>
                                      <Button
                                        colorScheme="blue"
                                        size="xs"
                                        onClick={() => handleRenameCategory(cat.id)}
                                        isDisabled={isLoading}
                                      >
                                        Сохранить
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="xs"
                                        onClick={() => setEditCategory(null)}
                                        isDisabled={isLoading}
                                      >
                                        Отмена
                                      </Button>
                                    </>
                                  ) : (
                                    <Button
                                      colorScheme="blue"
                                      size="xs"
                                      onClick={() =>
                                        setEditCategory({ id: cat.id, name: cat.category_name })
                                      }
                                      isDisabled={isLoading}
                                    >
                                      Переим.
                                    </Button>
                                  )}
                                  <Button
                                    colorScheme="red"
                                    size="xs"
                                    onClick={() => handleDeleteCategory(cat.id)}
                                    isDisabled={isLoading}
                                  >
                                    Удалить
                                  </Button>
                                </VStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  </VStack>
                </TabPanel>

                {/* Users */}
                <TabPanel px={{ base: 0, md: 4 }}>
                  <VStack spacing="4" align="stretch" width="100%">
                    <Heading size="md" mb="1rem">
                      Управление пользователями
                    </Heading>
                    <VStack spacing="4" mb="4" align="stretch">
                      <FormControl>
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
                    </VStack>
                    <Box overflowX="auto">
                      <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
                        <Thead>
                          <Tr>
                            <Th display={{ base: 'none', lg: 'table-cell' }}>ID</Th>
                            <Th>Логин</Th>
                            <Th display={{ base: 'none', md: 'table-cell' }}>Телеграм</Th>
                            <Th>Роль</Th>
                            <Th display={{ base: 'none', md: 'table-cell' }}>Статус</Th>
                            <Th>Действия</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {filteredUsers.map((u) => (
                            <Tr key={u.id}>
                              <Td display={{ base: 'none', lg: 'table-cell' }}>{u.id}</Td>
                              <Td>{u.login}</Td>
                              <Td display={{ base: 'none', md: 'table-cell' }}>{u.telegram ? `${u.telegram}` : 'Нет'}</Td>
                              <Td>
                                {u.role_id === 1
                                  ? 'Польз.'
                                  : u.role_id === 2
                                    ? 'Орг.'
                                    : 'Админ'}
                              </Td>
                              <Td display={{ base: 'none', md: 'table-cell' }}>{u.is_blocked ? 'Заблок.' : 'Активен'}</Td>
                              <Td>
                                <VStack spacing="1" align="stretch">
                                  <Button
                                    colorScheme={u.is_blocked ? 'green' : 'red'}
                                    size="xs"
                                    onClick={() => handleBanUser(u.id, u.is_blocked || false)}
                                    isDisabled={isLoading || u.id === user?.id}
                                  >
                                    {u.is_blocked ? 'Разблокировать' : 'Заблокировать'}
                                  </Button>
                                  {u.role_id === 2 && (
                                    <Button
                                      colorScheme="orange"
                                      size="xs"
                                      onClick={() => handleUnassignOrganizer(u.id)}
                                      isDisabled={isLoading}
                                    >
                                      Снять орг.
                                    </Button>
                                  )}
                                </VStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  </VStack>
                </TabPanel>

                {/* Organizer Requests */}
                <TabPanel px={{ base: 0, md: 4 }}>
                  <VStack spacing="4" align="stretch" width="100%">
                    <Heading size="md" mb="1rem">
                      Запросы на роль организатора
                    </Heading>
                    <Box overflowX="auto">
                      <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
                        <Thead>
                          <Tr>
                            <Th>Username</Th>
                            <Th display={{ base: 'none', md: 'table-cell' }}>ID Польз.</Th>
                            <Th>Telegram</Th>
                            <Th>Статус</Th>
                            <Th>Действия</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {organizerRequests.map((req) => (
                            <Tr key={req.id}>
                              <Td>{req.user?.login || req.user_id}</Td>
                              <Td display={{ base: 'none', md: 'table-cell' }}>{req.user_id}</Td>
                              <Td>
                                {req.user?.telegram ? (
                                  <a
                                    href={`https://t.me/${req.user.telegram.replace('@', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#2E4FD7', textDecoration: 'underline' }}
                                  >
                                    {req.user.telegram}
                                  </a>
                                ) : (
                                  <Text color="gray.500">Не указан</Text>
                                )}
                              </Td>
                              <Td>
                                {req.status_id === 1
                                  ? 'Ожидает'
                                  : req.status_id === 2
                                    ? 'Одобрен'
                                    : 'Отклонен'}
                              </Td>
                              <Td>
                                <VStack spacing="1" align="stretch">
                                  <Button
                                    colorScheme="green"
                                    size="xs"
                                    onClick={() => handleOrganizerResponse(req.id, true)}
                                    isDisabled={isLoading || req.status_id !== 1}
                                  >
                                    Одобрить
                                  </Button>
                                  <Button
                                    colorScheme="red"
                                    size="xs"
                                    onClick={() => handleOrganizerResponse(req.id, false)}
                                    isDisabled={isLoading || req.status_id !== 1}
                                  >
                                    Отклонить
                                  </Button>
                                </VStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  </VStack>
                </TabPanel>

                {/* Events */}
                <TabPanel px={{ base: 0, md: 4 }}>
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
                          <FormLabel>Теги</FormLabel>
                          <Flex flexWrap="wrap" gap="0.5rem">
                            {tags.map((tag) => (
                              <Badge
                                key={tag.id}
                                px={2}
                                py={1}
                                borderRadius="md"
                                cursor="pointer"
                                colorScheme={editEvent.tags?.some(t => t.id === tag.id) ? 'blue' : 'gray'}
                                onClick={() => {
                                  const currentTags = editEvent.tags || [];
                                  const isSelected = currentTags.some(t => t.id === tag.id);
                                  let newTags;
                                  if (isSelected) {
                                    newTags = currentTags.filter((t) => t.id !== tag.id);
                                  } else {
                                    newTags = [...currentTags, tag];
                                  }
                                  setEditEvent({ ...editEvent, tags: newTags });
                                }}
                              >
                                {tag.name}
                              </Badge>
                            ))}
                          </Flex>
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
                        <VStack spacing="2" align="stretch">
                          <Button
                            bg="#2E4FD7"
                            color="white"
                            _hover={{ bg: '#1e3fa9' }}
                            onClick={() => handleUpdateEvent(editEvent.id)}
                            isDisabled={isLoading}
                            width="100%"
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
                            width="100%"
                          >
                            Отменить редактирование
                          </Button>
                        </VStack>
                      </VStack>
                    )}
                    <Box overflowX="auto">
                      <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
                        <Thead>
                          <Tr>
                            <Th>Название</Th>
                            <Th display={{ base: 'none', md: 'table-cell' }}>Дата</Th>
                            <Th display={{ base: 'none', lg: 'table-cell' }}>Локация</Th>
                            <Th>Действия</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {events.map((event) => (
                            <Tr key={event.id}>
                              <Td>{event.title}</Td>
                              <Td display={{ base: 'none', md: 'table-cell' }}>{new Date(event.date).toLocaleDateString()}</Td>
                              <Td display={{ base: 'none', lg: 'table-cell' }}>{event.location}</Td>
                              <Td>
                                <VStack spacing="1" align="stretch">
                                  <Button
                                    colorScheme="blue"
                                    size="xs"
                                    onClick={() => setEditEvent(event)}
                                    isDisabled={isLoading}
                                  >
                                    Ред.
                                  </Button>
                                  <Button
                                    colorScheme="red"
                                    size="xs"
                                    onClick={() => handleDeleteEvent(event.id)}
                                    isDisabled={isLoading}
                                  >
                                    Удалить
                                  </Button>
                                </VStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  </VStack>
                </TabPanel>

                {/* Achievements */}
                <TabPanel px={{ base: 0, md: 4 }}>
                  <VStack spacing="1.5rem" align="stretch">
                    <Heading size="md">{editingAchievement ? 'Редактирование достижения' : 'Создать достижение'}</Heading>
                    <VStack spacing="1rem" align="stretch">
                      <FormControl isRequired>
                        <FormLabel>Название</FormLabel>
                        <Input
                          value={achForm.name}
                          onChange={(e) => setAchForm((f) => ({ ...f, name: e.target.value }))}
                          placeholder="Название"
                          bg="#E7EBFC"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Описание</FormLabel>
                        <Textarea
                          value={achForm.description || ''}
                          onChange={(e) => setAchForm((f) => ({ ...f, description: e.target.value }))}
                          placeholder="Краткое описание"
                          bg="#E7EBFC"
                        />
                      </FormControl>
                      <HStack spacing="1rem" align="stretch" flexWrap="wrap">
                        <FormControl width={{ base: '100%', md: '200px' }} isRequired>
                          <FormLabel>Очки / score</FormLabel>
                          <Input
                            type="number"
                            min={1}
                            value={achForm.score}
                            onChange={(e) => setAchForm((f) => ({ ...f, score: Number(e.target.value) }))}
                            bg="#E7EBFC"
                          />
                          <Text fontSize="sm" color="gray.600" mt="1">
                            Минимум действий для открытия (например, 3 посещения)
                          </Text>
                        </FormControl>
                        <FormControl width={{ base: '100%', md: '220px' }} isRequired>
                          <FormLabel>Триггер</FormLabel>
                          <Select
                            value={achForm.trigger}
                            onChange={(e) => setAchForm((f) => ({ ...f, trigger: e.target.value as AchievementPayload['trigger'] }))}
                            bg="#E7EBFC"
                          >
                            {triggerOptions.map((t) => (
                              <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                          </Select>
                        </FormControl>
                        {achForm.trigger === 'category' && (
                          <FormControl width={{ base: '100%', md: '220px' }}>
                            <FormLabel>Категория (для category)</FormLabel>
                            <Select
                              placeholder="Выберите категорию"
                              value={achForm.condition_category_id ? String(achForm.condition_category_id) : ''}
                              onChange={(e) =>
                                setAchForm((f) => ({
                                  ...f,
                                  condition_category_id: e.target.value ? Number(e.target.value) : null,
                                }))
                              }
                              bg="#E7EBFC"
                            >
                              {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.category_name}
                                </option>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      </HStack>
                      <FormControl>
                        <FormLabel>Изображение</FormLabel>
                        <Input
                          type="file"
                          accept="image/*"
                          ref={achFileInputRef}
                          onChange={handleAchImageChange}
                          style={{ display: 'none' }}
                        />
                        <Button
                          bg="#2E4FD7"
                          color="white"
                          _hover={{ bg: '#1e3fa9' }}
                          onClick={() => achFileInputRef.current?.click()}
                          size="md"
                          mb={achImagePreview || achForm.image ? 4 : 0}
                        >
                          Выбрать изображение
                        </Button>
                        {(achImagePreview || achForm.image) && (
                          <Box mt="4" textAlign="center">
                            <Text fontWeight="bold" mb="2">Превью:</Text>
                            <Image
                              src={achImagePreview || (typeof achForm.image === 'string' ? achForm.image : '')}
                              alt="Предосмотр достижения"
                              maxW="400px"
                              maxH="300px"
                              borderRadius="8px"
                              boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
                              display="block"
                              margin="0 auto"
                            />
                          </Box>
                        )}
                      </FormControl>
                      <HStack spacing="1rem">
                        <Button
                          bg="#2E4FD7"
                          color="white"
                          _hover={{ bg: '#1e3fa9' }}
                          onClick={handleAchSubmit}
                          isDisabled={isLoading}
                        >
                          {editingAchievement ? 'Сохранить' : 'Создать'}
                        </Button>
                        {editingAchievement && (
                          <Button variant="outline" onClick={resetAchForm} isDisabled={isLoading}>
                            Отмена
                          </Button>
                        )}
                      </HStack>
                    </VStack>

                    <Heading size="md">Список достижений</Heading>
                    <Box overflowX="auto">
                      <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
                        <Thead>
                          <Tr>
                            <Th>#</Th>
                            <Th>Название</Th>
                            <Th>Триггер</Th>
                            <Th>Очки</Th>
                            <Th>Условия</Th>
                            <Th>Действия</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {achievements.map((a) => {
                            const categoryName = getCategoryName(a.condition_category_id);
                            const conditions: string[] = [];
                            
                            if (a.condition_event_id) {
                              const event = events.find(e => e.id === String(a.condition_event_id));
                              conditions.push(`Мероприятие: ${event ? event.title : `ID ${a.condition_event_id}`}`);
                            }
                            if (a.condition_category_id && categoryName) {
                              conditions.push(`Категория: ${categoryName}`);
                            }
                            if (a.condition_payload) {
                              conditions.push(`Доп. условия: ${JSON.stringify(a.condition_payload)}`);
                            }
                            if (conditions.length === 0) {
                              conditions.push('Без условий');
                            }

                            return (
                              <Tr key={a.id}>
                                <Td>{a.id}</Td>
                                <Td>{a.name}</Td>
                                <Td>{getTriggerLabel(a.trigger)}</Td>
                                <Td>{a.score}</Td>
                                <Td>
                                  <VStack align="start" spacing={1}>
                                    {conditions.map((condition, idx) => (
                                      <Text key={idx} fontSize="sm">
                                        {condition}
                                      </Text>
                                    ))}
                                  </VStack>
                                </Td>
                                <Td>
                                  <HStack spacing="2">
                                    <Button size="xs" colorScheme="blue" onClick={() => handleAchEdit(a)} isDisabled={isLoading}>
                                      Ред.
                                    </Button>
                                    <Button size="xs" colorScheme="red" onClick={() => handleAchDelete(a.id)} isDisabled={isLoading}>
                                      Удалить
                                    </Button>
                                  </HStack>
                                </Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </Box>
                  </VStack>
                </TabPanel>

                {/* Tags */}
                <TabPanel px={{ base: 0, md: 4 }}>
                  <VStack spacing="2rem" align="stretch" width="100%">
                    <Heading size="md">Управление тегами</Heading>
                    <FormControl>
                      <FormLabel>Добавить тег</FormLabel>
                      <VStack spacing="2" align="stretch">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Название тега"
                          bg="#E7EBFC"
                        />
                        <Button
                          bg="#2E4FD7"
                          color="white"
                          _hover={{ bg: '#1e3fa9' }}
                          onClick={handleAddTag}
                          isDisabled={isLoading}
                          width={{ base: '100%', md: 'auto' }}
                          alignSelf={{ base: 'stretch', md: 'flex-start' }}
                        >
                          Добавить
                        </Button>
                      </VStack>
                    </FormControl>
                    <Box overflowX="auto">
                      <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
                        <Thead>
                          <Tr>
                            <Th>Название</Th>
                            <Th>Действия</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {tags.map((tag) => (
                            <Tr key={tag.id}>
                              <Td>
                                {editTag?.id === tag.id ? (
                                  <Input
                                    value={editTag.name}
                                    onChange={(e) =>
                                      setEditTag({ id: tag.id, name: e.target.value })
                                    }
                                    bg="#E7EBFC"
                                    size="sm"
                                  />
                                ) : (
                                  tag.name
                                )}
                              </Td>
                              <Td>
                                <VStack spacing="1" align="stretch">
                                  {editTag?.id === tag.id ? (
                                    <>
                                      <Button
                                        colorScheme="blue"
                                        size="xs"
                                        onClick={() => handleRenameTag(tag.id)}
                                        isDisabled={isLoading}
                                      >
                                        Сохранить
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="xs"
                                        onClick={() => setEditTag(null)}
                                        isDisabled={isLoading}
                                      >
                                        Отмена
                                      </Button>
                                    </>
                                  ) : (
                                    <Button
                                      colorScheme="blue"
                                      size="xs"
                                      onClick={() =>
                                        setEditTag({ id: tag.id, name: tag.name })
                                      }
                                      isDisabled={isLoading}
                                    >
                                      Переим.
                                    </Button>
                                  )}
                                  <Button
                                    colorScheme="red"
                                    size="xs"
                                    onClick={() => handleDeleteTag(tag.id)}
                                    isDisabled={isLoading}
                                  >
                                    Удалить
                                  </Button>
                                </VStack>
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

          {/* Delete Tag Modal */}
          <Modal isOpen={isDeleteTagModalOpen} onClose={onDeleteTagModalClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Подтверждение удаления</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text>Вы уверены, что хотите удалить этот тег? Он будет скрыт для новых мероприятий, но останется на существующих.</Text>
              </ModalBody>
              <ModalFooter>
                <Button
                  bg="gray.500"
                  color="white"
                  _hover={{ bg: 'gray.600' }}
                  mr={3}
                  onClick={onDeleteTagModalClose}
                  isDisabled={isLoading}
                >
                  Отмена
                </Button>
                <Button
                  bg="red.500"
                  color="white"
                  _hover={{ bg: 'red.600' }}
                  onClick={confirmDeleteTag}
                  isDisabled={isLoading}
                >
                  Удалить
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

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


        </Box >
      )}
      <Footer />
    </Box>
  );
}

export default Admin;