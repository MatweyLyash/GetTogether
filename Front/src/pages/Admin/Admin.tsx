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

const triggerOptions = [
  { value: 'apply', label: 'Заявка' },
  { value: 'attend', label: 'Посещение' },
  { value: 'category', label: 'Категория' },
];

function Admin() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<{ id: number; category_name: string }[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [organizerRequests, setOrganizerRequests] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editCategory, setEditCategory] = useState<{ id: number; name: string } | null>(null);
  const [editEvent, setEditEvent] = useState<any | null>(null);
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [eventTabIndex, setEventTabIndex] = useState(0);
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

  const isMobile = useBreakpointValue({ base: true, md: false });

  const toImageSrc = (image: unknown): string | null => {
    if (!image) return null;
    if (typeof image === 'string') {
      if (image.startsWith('data:') || image.startsWith('http') || image.startsWith('blob:')) return image;
      return `data:image/png;base64,${image}`;
    }

    const bytes = (image as { data?: number[] }).data || image;
    if (Array.isArray(bytes)) {
      const binary = Uint8Array.from(bytes).reduce((acc, value) => acc + String.fromCharCode(value), '');
      return `data:image/png;base64,${btoa(binary)}`;
    }

    return null;
  };

  const toDateTimeLocalValue = (value?: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role_id !== 3)) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, user, navigate]);

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
        setEvents((eventData || []).map((event: any) => ({ ...event, creator_id: event.creator_id || undefined })));
        setUsers((userData || []).map((user: any) => ({ ...user, is_blocked: user.is_blocked || false })));
        setAchievements(achData || []);
        setTags(tagData || []);
      } catch (error: any) {
        toast({ title: 'Ошибка загрузки данных', description: error.message, status: 'error', duration: 5000, isClosable: true });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [authLoading, user, toast]);

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

  const resetAchForm = () => {
    setEditingAchievement(null);
    setAchForm({ name: '', description: '', score: 1, trigger: 'apply', condition_category_id: null, condition_payload: null, image: '' });
    setAchImagePreview(null);
  };

  const handleAchSubmit = async () => {
    if (achForm.trigger === 'category' && !achForm.condition_category_id) {
      toast({ title: 'Ошибка', description: 'Выберите категорию для триггера "category"', status: 'error', duration: 4000, isClosable: true });
      return;
    }
    if (!achForm.image) {
      toast({ title: 'Ошибка', description: 'Добавьте изображение для достижения', status: 'error', duration: 4000, isClosable: true });
      return;
    }
    try {
      setIsLoading(true);
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

  const handleAddCategory = async () => {
    if (!newCategory) {
      toast({ title: 'Ошибка', description: 'Введите название категории', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    setIsLoading(true);
    try {
      await addCategory({ category_name: newCategory });
      const updated = await getCategories();
      setCategories(updated);
      setNewCategory('');
      toast({ title: 'Успех', description: 'Категория добавлена', status: 'success', duration: 3000, isClosable: true });
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameCategory = async (categoryId: number) => {
    if (!editCategory || !editCategory.name) {
      toast({ title: 'Ошибка', description: 'Введите название категории', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    setIsLoading(true);
    try {
      await renameCategory(categoryId, { category_name: editCategory.name });
      const updated = await getCategories();
      setCategories(updated);
      setEditCategory(null);
      toast({ title: 'Успех', description: 'Категория переименована', status: 'success', duration: 3000, isClosable: true });
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    setCategoryToDelete(categoryId);
    onDeleteCategoryModalOpen();
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setIsLoading(true);
    try {
      await deleteCategory(categoryToDelete);
      const updated = await getCategories();
      setCategories(updated);
      toast({ title: 'Успех', description: 'Категория удалена', status: 'success', duration: 3000, isClosable: true });
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
      onDeleteCategoryModalClose();
      setCategoryToDelete(null);
    }
  };

  const handleBanUser = async (userId: string, isBanned: boolean) => {
    if (userId === user?.id) {
      toast({ title: 'Ошибка', description: 'Нельзя заблокировать себя', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    setIsLoading(true);
    try {
      await banUser(userId, !isBanned);
      const updated = await getUsers();
      setUsers((updated || []).map((user: any) => ({ ...user, is_blocked: user.is_blocked || false })));
      toast({ title: 'Успех', description: `Пользователь ${isBanned ? 'разблокирован' : 'заблокирован'}`, status: 'success', duration: 3000, isClosable: true });
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrganizerResponse = async (requestId: string, approve: boolean) => {
    setIsLoading(true);
    try {
      await organizerResponse(requestId, approve ? 2 : 3);
      const updated = await getOrganizerRequests();
      setOrganizerRequests(updated || []);
      toast({ title: 'Успех', description: `Запрос ${approve ? 'одобрен' : 'отклонен'}`, status: 'success', duration: 3000, isClosable: true });
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnassignOrganizer = async (userId: string) => {
    setIsLoading(true);
    try {
      await unassignOrganizer(userId);
      const updated = await getUsers();
      setUsers((updated || []).map((user: any) => ({ ...user, is_blocked: user.is_blocked || false })));
      toast({ title: 'Успех', description: 'Роль организатора снята', status: 'success', duration: 3000, isClosable: true });
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

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

  const closeEventEditor = () => {
    setEditEvent(null);
    setEventImage(null);
    setImagePreview(null);
    setEventTabIndex(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openEventEditor = (event: any) => {
    setEditEvent({
      ...event,
      date: toDateTimeLocalValue(event.date),
    });
    setEventImage(null);
    setImagePreview(toImageSrc(event.image));
    setEventTabIndex(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpdateEvent = async (eventId: string) => {
    if (!editEvent || !editEvent.title || !editEvent.description || !editEvent.date || !editEvent.location || !editEvent.category_id || !editEvent.price || !editEvent.capacity) {
      toast({ title: 'Ошибка', description: 'Заполните все обязательные поля', status: 'error', duration: 3000, isClosable: true });
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
      if (editEvent.telegram_chat_link) formData.append('telegram_chat_link', editEvent.telegram_chat_link);
      if (eventImage) formData.append('image', eventImage);
      await updateEventByAdmin(eventId, formData);
      const updated = await getEvents();
      setEvents((updated || []).map((event: any) => ({ ...event, creator_id: event.creator_id || undefined })));
      closeEventEditor();
      toast({ title: 'Успех', description: 'Мероприятие обновлено', status: 'success', duration: 3000, isClosable: true });
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    setEventToDelete(eventId);
    onDeleteEventModalOpen();
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    setIsLoading(true);
    try {
      await deleteEventByAdmin(eventToDelete);
      const updated = await getEvents();
      setEvents((updated || []).map((event: any) => ({ ...event, creator_id: event.creator_id || undefined })));
      toast({ title: 'Успех', description: 'Мероприятие удалено', status: 'success', duration: 3000, isClosable: true });
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
      onDeleteEventModalClose();
      setEventToDelete(null);
    }
  };

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
      setTags(tags.map((t) => (t.id === id ? updated : t)));
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
      setTags(tags.filter((t) => t.id !== tagToDelete));
      toast({ title: 'Успех', description: 'Тег удален', status: 'success', duration: 3000, isClosable: true });
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
      onDeleteTagModalClose();
      setTagToDelete(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter ? u.role_id === Number(roleFilter) : true;
    const matchesSearch = u.login.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getTriggerLabel = (trigger: string) => {
    const option = triggerOptions.find((opt) => opt.value === trigger);
    return option ? option.label : trigger;
  };

  const getCategoryName = (categoryId: number | null | undefined) => {
    if (!categoryId) return null;
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.category_name : `ID: ${categoryId}`;
  };

  if (authLoading) {
    return (
      <Flex justify="center" py="4rem">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!user || user.role_id !== 3) {
    return <Text textAlign="center" fontSize="lg">Доступ запрещен. Перенаправление...</Text>;
  }

  return (
    <Box className={styles.container} mx="auto">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap'); body { font-family: 'Inter', sans-serif; }`}</style>
      <Header />
      <Box className={styles.content}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%' }}>
          <Heading size={{ base: 'lg', md: 'xl' }} mb="2rem">
            Панель администратора
          </Heading>

          {isMobile && (
            <FormControl mb="1.5rem">
              <FormLabel fontWeight="bold">Выберите раздел</FormLabel>
              <Select value={activeTab} onChange={(e) => setActiveTab(Number(e.target.value))} bg="#E7EBFC" size="lg">
                <option value={0}>Категории</option>
                <option value={1}>Пользователи</option>
                <option value={2}>Запросы организаторов</option>
                <option value={3}>Мероприятия</option>
                <option value={4}>Достижения</option>
                <option value={5}>Теги</option>
              </Select>
            </FormControl>
          )}

          <Tabs variant="soft-rounded" colorScheme="blue" index={activeTab} onChange={(index) => setActiveTab(index)}>
            {!isMobile && (
              <TabList mb="1rem" flexWrap="wrap" gap="0.5rem">
                <Tab _selected={{ bg: '#2E4FD7', color: 'white' }}>Категории</Tab>
                <Tab _selected={{ bg: '#2E4FD7', color: 'white' }}>Пользователи</Tab>
                <Tab _selected={{ bg: '#2E4FD7', color: 'white' }}>Запросы организаторов</Tab>
                <Tab _selected={{ bg: '#2E4FD7', color: 'white' }}>Мероприятия</Tab>
                <Tab _selected={{ bg: '#2E4FD7', color: 'white' }}>Достижения</Tab>
                <Tab _selected={{ bg: '#2E4FD7', color: 'white' }}>Теги</Tab>
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
                      <Input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Название категории" bg="#E7EBFC" />
                      <Button bg="#2E4FD7" color="white" _hover={{ bg: '#1e3fa9' }} onClick={handleAddCategory} isDisabled={isLoading} width={{ base: '100%', md: 'auto' }} alignSelf={{ base: 'stretch', md: 'flex-start' }}>
                        Добавить
                      </Button>
                    </VStack>
                  </FormControl>
                  <Heading size="md">Список категорий</Heading>
                  <Box overflowX="auto">
                    <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
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
                              {editCategory && editCategory.id === cat.id ? (
                                <Input value={editCategory.name} onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })} bg="white" size="sm" />
                              ) : (
                                cat.category_name
                              )}
                            </Td>
                            <Td>
                              <HStack spacing="2">
                                {editCategory && editCategory.id === cat.id ? (
                                  <>
                                    <Button size="xs" colorScheme="green" onClick={() => handleRenameCategory(cat.id)} isDisabled={isLoading}>
                                      Сохранить
                                    </Button>
                                    <Button size="xs" variant="outline" onClick={() => setEditCategory(null)}>
                                      Отмена
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button size="xs" colorScheme="blue" onClick={() => setEditCategory({ id: cat.id, name: cat.category_name })}>
                                      Переименовать
                                    </Button>
                                    <Button size="xs" colorScheme="red" onClick={() => handleDeleteCategory(cat.id)}>
                                      Удалить
                                    </Button>
                                  </>
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

              {/* Users */}
              <TabPanel px={{ base: 0, md: 4 }}>
                <VStack spacing="2rem" align="stretch" width="100%">
                  <Heading size="md">Управление пользователями</Heading>
                  <HStack spacing="2" flexWrap="wrap">
                    <Input
                      placeholder="Поиск по имени"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      bg="white"
                      maxW="250px"
                    />
                    <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} bg="white" maxW="200px">
                      <option value="">Все роли</option>
                      <option value="1">Пользователь</option>
                      <option value="2">Организатор</option>
                      <option value="3">Админ</option>
                    </Select>
                  </HStack>
                  <Box overflowX="auto">
                    <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
                      <Thead>
                        <Tr>
                          <Th>ID</Th>
                          <Th>Логин</Th>
                          <Th>Роль</Th>
                          <Th>Telegram</Th>
                          <Th>Статус</Th>
                          <Th>Действия</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredUsers.map((u) => (
                          <Tr key={u.id}>
                            <Td>{u.id}</Td>
                            <Td fontWeight="medium">{u.login}</Td>
                            <Td>
                              <Badge colorScheme={u.role_id === 3 ? 'red' : u.role_id === 2 ? 'green' : 'blue'}>
                                {u.role_id === 3 ? 'Админ' : u.role_id === 2 ? 'Организатор' : 'Пользователь'}
                              </Badge>
                            </Td>
                            <Td>{u.telegram || '—'}</Td>
                            <Td>
                              <Badge colorScheme={u.is_blocked ? 'red' : 'green'}>{u.is_blocked ? 'Заблокирован' : 'Активен'}</Badge>
                            </Td>
                            <Td>
                              <HStack spacing="2">
                                <Button
                                  size="xs"
                                  colorScheme={u.is_blocked ? 'green' : 'red'}
                                  onClick={() => handleBanUser(u.id, u.is_blocked)}
                                  isDisabled={isLoading}
                                >
                                  {u.is_blocked ? 'Разблокировать' : 'Заблокировать'}
                                </Button>
                                {u.role_id === 2 && (
                                  <Button size="xs" colorScheme="orange" onClick={() => handleUnassignOrganizer(u.id)} isDisabled={isLoading}>
                                    Снять роль
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
              <TabPanel px={{ base: 0, md: 4 }}>
                <VStack spacing="2rem" align="stretch" width="100%">
                  <Heading size="md">Запросы на статус организатора</Heading>
                  {organizerRequests.length === 0 ? (
                    <Text color="gray.600" textAlign="center" py={8}>
                      Нет запросов
                    </Text>
                  ) : (
                    <Box overflowX="auto">
                      <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
                        <Thead>
                          <Tr>
                            <Th>ID</Th>
                            <Th>Пользователь</Th>
                            <Th>Telegram</Th>
                            <Th>Статус</Th>
                            <Th>Действия</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {organizerRequests.map((req) => (
                            <Tr key={req.id}>
                              <Td>{req.id}</Td>
                              <Td fontWeight="medium">{req.user?.login || 'N/A'}</Td>
                              <Td>{req.user?.telegram || '—'}</Td>
                              <Td>
                                <Badge colorScheme={req.status_id === 2 ? 'green' : req.status_id === 3 ? 'red' : 'yellow'}>
                                  {req.status_id === 2 ? 'Одобрено' : req.status_id === 3 ? 'Отклонено' : 'На рассмотрении'}
                                </Badge>
                              </Td>
                              <Td>
                                {req.status_id === 1 && (
                                  <HStack spacing="2">
                                    <Button size="xs" colorScheme="green" onClick={() => handleOrganizerResponse(req.id, true)} isDisabled={isLoading}>
                                      Одобрить
                                    </Button>
                                    <Button size="xs" colorScheme="red" onClick={() => handleOrganizerResponse(req.id, false)} isDisabled={isLoading}>
                                      Отклонить
                                    </Button>
                                  </HStack>
                                )}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  )}
                </VStack>
              </TabPanel>

              {/* Events */}
              <TabPanel px={{ base: 0, md: 4 }}>
                <VStack spacing="2rem" align="stretch" width="100%">
                  <Heading size="md">Управление мероприятиями</Heading>
                  <Tabs
                    index={eventTabIndex}
                    onChange={(index) => {
                      if (eventTabIndex === 1 && index !== 1 && editEvent) {
                        closeEventEditor();
                        return;
                      }
                      setEventTabIndex(index);
                    }}
                    variant="soft-rounded"
                    colorScheme="blue"
                    width="100%"
                    isLazy
                  >
                    <TabList mb="1rem" flexWrap="wrap" gap="0.5rem">
                      <Tab _selected={{ bg: '#2E4FD7', color: 'white' }}>Список мероприятий</Tab>
                      <Tab display="none">Редактирование мероприятия</Tab>
                    </TabList>
                    <TabPanels width="100%">
                      <TabPanel px={0}>
                        <Box overflowX="auto">
                          <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
                            <Thead>
                              <Tr>
                                <Th>ID</Th>
                                <Th>Название</Th>
                                <Th>Дата</Th>
                                <Th>Место</Th>
                                <Th>Категория</Th>
                                <Th>Действия</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {events.map((event) => (
                                <Tr key={event.id}>
                                  <Td>{event.id}</Td>
                                  <Td fontWeight="medium">{event.title}</Td>
                                  <Td>{new Date(event.date).toLocaleDateString('ru-RU')}</Td>
                                  <Td>{event.location}</Td>
                                  <Td>
                                    <Badge colorScheme="blue">{getCategoryName(event.category_id)}</Badge>
                                  </Td>
                                  <Td>
                                    <HStack spacing="2">
                                      <Button size="xs" colorScheme="blue" onClick={() => openEventEditor(event)}>
                                        Ред.
                                      </Button>
                                      <Button size="xs" colorScheme="red" onClick={() => handleDeleteEvent(event.id)}>
                                        Удалить
                                      </Button>
                                    </HStack>
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </Box>
                      </TabPanel>

                      <TabPanel px={0}>
                        {editEvent && (
                          <VStack spacing="1rem" align="stretch">
                            <Heading size="md">Редактирование мероприятия</Heading>
                            <FormControl isRequired>
                              <FormLabel>Название</FormLabel>
                              <Input value={editEvent.title || ''} onChange={(e) => setEditEvent({ ...editEvent, title: e.target.value })} bg="#E7EBFC" />
                            </FormControl>
                            <FormControl isRequired>
                              <FormLabel>Описание</FormLabel>
                              <Textarea value={editEvent.description || ''} onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })} bg="#E7EBFC" />
                            </FormControl>
                            <HStack w="100%" spacing="1rem" align="stretch" flexWrap="wrap">
                              <FormControl isRequired>
                                <FormLabel>Дата</FormLabel>
                                <Input type="datetime-local" value={editEvent.date || ''} onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })} bg="#E7EBFC" />
                              </FormControl>
                              <FormControl isRequired>
                                <FormLabel>Место</FormLabel>
                                <Input value={editEvent.location || ''} onChange={(e) => setEditEvent({ ...editEvent, location: e.target.value })} bg="#E7EBFC" />
                              </FormControl>
                            </HStack>
                            <HStack w="100%" spacing="1rem" align="stretch" flexWrap="wrap">
                              <FormControl isRequired>
                                <FormLabel>Категория</FormLabel>
                                <Select value={editEvent.category_id || ''} onChange={(e) => setEditEvent({ ...editEvent, category_id: Number(e.target.value) })} bg="#E7EBFC">
                                  {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                                  ))}
                                </Select>
                              </FormControl>
                              <FormControl isRequired>
                                <FormLabel>Цена</FormLabel>
                                <Input type="number" value={editEvent.price || ''} onChange={(e) => setEditEvent({ ...editEvent, price: Number(e.target.value) })} bg="#E7EBFC" />
                              </FormControl>
                              <FormControl isRequired>
                                <FormLabel>Места</FormLabel>
                                <Input type="number" value={editEvent.capacity || ''} onChange={(e) => setEditEvent({ ...editEvent, capacity: Number(e.target.value) })} bg="#E7EBFC" />
                              </FormControl>
                            </HStack>
                            <FormControl>
                              <FormLabel>Telegram чат</FormLabel>
                              <Input value={editEvent.telegram_chat_link || ''} onChange={(e) => setEditEvent({ ...editEvent, telegram_chat_link: e.target.value })} bg="#E7EBFC" />
                            </FormControl>
                            <FormControl>
                              <FormLabel>Изображение</FormLabel>
                              <Input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} display="none" />
                              <Button onClick={() => fileInputRef.current?.click()} variant="outline" colorScheme="blue" width="100%">
                                {imagePreview ? 'Заменить изображение' : 'Загрузить изображение'}
                              </Button>
                              {imagePreview && (
                                <Box mt={3} borderRadius="12px" overflow="hidden" maxH="240px">
                                  <Image src={imagePreview} alt="Preview" w="100%" h="100%" objectFit="cover" />
                                </Box>
                              )}
                            </FormControl>
                            <HStack spacing="1rem">
                              <Button variant="outline" onClick={closeEventEditor} isDisabled={isLoading}>
                                Отмена
                              </Button>
                              <Button bg="#2E4FD7" color="white" _hover={{ bg: '#1e3fa9' }} onClick={() => handleUpdateEvent(editEvent.id)} isLoading={isLoading}>
                                Сохранить
                              </Button>
                            </HStack>
                          </VStack>
                        )}
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </VStack>
              </TabPanel>

              {/* Achievements */}
              <TabPanel px={{ base: 0, md: 4 }}>
                <VStack spacing="2rem" align="stretch" width="100%">
                  <Heading size="md">{editingAchievement ? 'Редактирование достижения' : 'Создать достижение'}</Heading>
                  <VStack spacing="1rem" align="stretch">
                    <FormControl isRequired>
                      <FormLabel>Название</FormLabel>
                      <Input value={achForm.name} onChange={(e) => setAchForm((f) => ({ ...f, name: e.target.value }))} placeholder="Название" bg="#E7EBFC" />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Описание</FormLabel>
                      <Textarea value={achForm.description || ''} onChange={(e) => setAchForm((f) => ({ ...f, description: e.target.value }))} placeholder="Краткое описание" bg="#E7EBFC" />
                    </FormControl>
                    <HStack spacing="1rem" align="stretch" flexWrap="wrap">
                      <FormControl width={{ base: '100%', md: '200px' }} isRequired>
                        <FormLabel>Очки / score</FormLabel>
                        <Input type="number" min={1} value={achForm.score} onChange={(e) => setAchForm((f) => ({ ...f, score: Number(e.target.value) }))} bg="#E7EBFC" />
                        <Text fontSize="sm" color="gray.600" mt="1">Минимум действий для открытия (например, 3 посещения)</Text>
                      </FormControl>
                      <FormControl width={{ base: '100%', md: '220px' }} isRequired>
                        <FormLabel>Триггер</FormLabel>
                        <Select value={achForm.trigger} onChange={(e) => setAchForm((f) => ({ ...f, trigger: e.target.value as AchievementPayload['trigger'] }))} bg="#E7EBFC">
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
                            onChange={(e) => setAchForm((f) => ({ ...f, condition_category_id: e.target.value ? Number(e.target.value) : null }))}
                            bg="#E7EBFC"
                          >
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </HStack>
                    <FormControl>
                      <FormLabel>Изображение (опционально)</FormLabel>
                      <Input type="file" accept="image/*" ref={achFileInputRef} onChange={handleAchImageChange} display="none" />
                      <Button onClick={() => achFileInputRef.current?.click()} variant="outline" colorScheme="blue" width="100%">
                        {achImagePreview || achForm.image ? 'Заменить изображение' : 'Загрузить изображение'}
                      </Button>
                      {(achImagePreview || achForm.image) && (
                        <Box mt={3} borderRadius="12px" overflow="hidden" maxH="240px">
                          <Image src={achImagePreview || (typeof achForm.image === 'string' ? achForm.image : '')} alt="Предосмотр достижения" w="100%" h="100%" objectFit="cover" />
                        </Box>
                      )}
                    </FormControl>
                    <HStack spacing="1rem">
                      <Button bg="#2E4FD7" color="white" _hover={{ bg: '#1e3fa9' }} onClick={handleAchSubmit} isDisabled={isLoading}>
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
                          <Th>Score</Th>
                          <Th>Условия</Th>
                          <Th>Действия</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {achievements.map((a) => (
                          <Tr key={a.id}>
                            <Td>{a.id}</Td>
                            <Td>{a.name}</Td>
                            <Td>{getTriggerLabel(a.trigger)}</Td>
                            <Td>{a.score}</Td>
                            <Td>
                              <Text fontSize="sm">
                                {a.condition_event_id ? `event_id: ${a.condition_event_id}` : ''}
                                {a.condition_category_id ? ` cat_id: ${a.condition_category_id}` : ''}
                                {a.condition_payload ? ` payload: ${JSON.stringify(a.condition_payload)}` : ''}
                              </Text>
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
                        ))}
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
                      <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Название тега" bg="#E7EBFC" />
                      <Button bg="#2E4FD7" color="white" _hover={{ bg: '#1e3fa9' }} onClick={handleAddTag} isDisabled={isLoading} width={{ base: '100%', md: 'auto' }} alignSelf={{ base: 'stretch', md: 'flex-start' }}>
                        Добавить
                      </Button>
                    </VStack>
                  </FormControl>
                  <Heading size="md">Список тегов</Heading>
                  <Box overflowX="auto">
                    <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
                      <Thead>
                        <Tr>
                          <Th>ID</Th>
                          <Th>Название</Th>
                          <Th>Действия</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {tags.map((tag) => (
                          <Tr key={tag.id}>
                            <Td>{tag.id}</Td>
                            <Td>
                              {editTag && editTag.id === tag.id ? (
                                <Input value={editTag.name} onChange={(e) => setEditTag({ ...editTag, name: e.target.value })} bg="white" size="sm" />
                              ) : (
                                tag.name
                              )}
                            </Td>
                            <Td>
                              <HStack spacing="2">
                                {editTag && editTag.id === tag.id ? (
                                  <>
                                    <Button size="xs" colorScheme="green" onClick={() => handleRenameTag(tag.id)} isDisabled={isLoading}>
                                      Сохранить
                                    </Button>
                                    <Button size="xs" variant="outline" onClick={() => setEditTag(null)}>
                                      Отмена
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button size="xs" colorScheme="blue" onClick={() => setEditTag({ id: tag.id, name: tag.name })}>
                                      Переименовать
                                    </Button>
                                    <Button size="xs" colorScheme="red" onClick={() => handleDeleteTag(tag.id)}>
                                      Удалить
                                    </Button>
                                  </>
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
            </TabPanels>
          </Tabs>
        </motion.div>
      </Box>
      <Footer />

      {/* Delete Category Modal */}
      <Modal isOpen={isDeleteCategoryModalOpen} onClose={onDeleteCategoryModalClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Удалить категорию</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Вы уверены?</ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteCategoryModalClose}>Отмена</Button>
            <Button colorScheme="red" onClick={confirmDeleteCategory} isLoading={isLoading}>Удалить</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Event Modal */}
      <Modal isOpen={isDeleteEventModalOpen} onClose={onDeleteEventModalClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Удалить мероприятие</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Вы уверены?</ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteEventModalClose}>Отмена</Button>
            <Button colorScheme="red" onClick={confirmDeleteEvent} isLoading={isLoading}>Удалить</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Delete Tag Modal */}
      <Modal isOpen={isDeleteTagModalOpen} onClose={onDeleteTagModalClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Удалить тег</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Вы уверены?</ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteTagModalClose}>Отмена</Button>
            <Button colorScheme="red" onClick={confirmDeleteTag} isLoading={isLoading}>Удалить</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Admin;
