import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast, Box, Spinner, Flex, Heading, Text, FormControl, FormLabel, Input, Button, VStack, useBreakpointValue } from '@chakra-ui/react';
import {
  getOwnEventsRegistration,
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
  getMyAchievements,
  AchievementProgress,
  Tag,
  getTags,
} from '../../api/api';
import { useAuth } from '../../AuthContext/AuthContext';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { CabinetLayout } from '../../components/Cabinet/CabinetLayout';
import { CabinetTabs } from '../../components/Cabinet/CabinetTabs';
import { FutureEventsList } from '../../components/Cabinet/MyEvents/FutureEventsList';
import { PastEventsList } from '../../components/Cabinet/MyEvents/PastEventsList';
import { OrganizerRequestsTab } from '../../components/Cabinet/OrganizerRequests/OrganizerRequestsTab';
import { OwnEventsTab } from '../../components/Cabinet/OwnEvents/OwnEventsTab';
import { EventRequestsModal } from '../../components/Cabinet/OwnEvents/EventRequestsModal';
import { AchievementsTab } from '../../components/Cabinet/Achievements/AchievementsTab';
import { CabinetEvent, CabinetEventRegistration, CabinetOrganizerRequest, CabinetEventRequest, EventFormData } from '../../components/Cabinet/types';
import styles from './Cabinet.module.scss';

function Cabinet() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [registrations, setRegistrations] = useState<CabinetEventRegistration[]>([]);
  const [organizerRequests, setOrganizerRequests] = useState<CabinetOrganizerRequest[]>([]);
  const [categories, setCategories] = useState<{ id: number; category_name: string }[]>([]);
  const [ownEvents, setOwnEvents] = useState<CabinetEvent[]>([]);
  const [myAchievements, setMyAchievements] = useState<AchievementProgress[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [eventRequests, setEventRequests] = useState<CabinetEventRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [telegram, setTelegram] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventFormData, setEventFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    location: '',
    category_id: '',
    price: '',
    capacity: '',
    telegram_chat_link: '',
    tags: [],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [requestsModalOpen, setRequestsModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const fontSizeHeading = useBreakpointValue({ base: 'lg', md: 'xl' });
  const fontSizeText = useBreakpointValue({ base: 'md', md: 'lg' });
  const isOrganizer = user?.role_id === 2;
  const isAdmin = user?.role_id === 3;

  const fetchAchievements = useCallback(async () => {
    try {
      const achievements = await getMyAchievements();
      setMyAchievements(achievements || []);
    } catch (error: any) {
      toast({
        title: 'Ошибка загрузки достижений',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  }, [toast]);

  // Map API Event to CabinetEvent
  const mapToCabinetEvent = (event: any): CabinetEvent => ({
    ...event,
    category: event.category || { category_name: 'Unknown' },
  });

  const mapToOrganizerRequest = (request: any): CabinetOrganizerRequest => ({
    ...request,
    created_at: request.created_at || request.createdAt || null,
    createdAt: request.createdAt || request.created_at || null,
  });

  const toImageSrc = (image: unknown): string | null => {
    if (!image) return null;
    if (typeof image === 'string') {
      if (image.startsWith('data:') || image.startsWith('http')) return image;
      return `data:image/png;base64,${image}`;
    }

    const bytes = (image as { data?: number[] }).data || image;
    if (Array.isArray(bytes)) {
      const binary = Uint8Array.from(bytes).reduce((acc, value) => acc + String.fromCharCode(value), '');
      return `data:image/png;base64,${btoa(binary)}`;
    }

    return null;
  };

  // Map API EventRegistration to CabinetEventRegistration
  const mapToCabinetRegistration = (reg: any): CabinetEventRegistration => ({
    ...reg,
    Event: mapToCabinetEvent(reg.Event),
  });

  useEffect(() => {
    const { tabIndex: incomingTabIndex, isEditing: incomingIsEditing, eventId, eventData } = (location.state || {}) as any;
    if (incomingIsEditing) {
      setTabIndex(2);
    } else if (incomingTabIndex !== undefined) {
      setTabIndex(incomingTabIndex);
    }
    if (incomingIsEditing && eventData) {
      setIsEditing(true);
      setEditingEventId(eventId || null);
      setEventFormData({
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        location: eventData.location,
        category_id: eventData.category_id,
        price: eventData.price,
        capacity: eventData.capacity,
        telegram_chat_link: eventData.telegram_chat_link,
        tags: eventData.tags?.map((t: Tag) => t.id) || [],
      });
      if (eventData.image) setImagePreview(eventData.image);
    }
  }, [location.state]);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user)) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading || !isAuthenticated || !user) return;
      setIsLoading(true);
      try {
        const [regs, orgRequests, cats, tagList] = await Promise.all([
          getOwnEventsRegistration(),
          getOwnOrganizerRequests(),
          getCategories(),
          getTags(),
        ]);
        setRegistrations(regs.map(mapToCabinetRegistration));
        setOrganizerRequests((orgRequests || []).map(mapToOrganizerRequest));
        setCategories(cats || []);
        setTags(tagList || []);
        await fetchAchievements();
        if (isOrganizer || isAdmin) {
          const events = await getOwnEvents();
          setOwnEvents(events.map(mapToCabinetEvent));
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
  }, [authLoading, isAuthenticated, user, isOrganizer, isAdmin, toast, fetchAchievements]);

  const handleCreateReview = async (eventId: string, rating: number, comment: string) => {
    setIsLoading(true);
    try {
      await createReview(eventId, rating, comment);
      toast({ title: 'Успех', description: 'Отзыв отправлен', status: 'success', duration: 3000, isClosable: true });
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrganizerRequest = async () => {
    setIsLoading(true);
    try {
      await createOrganizerRequest();
      const requests = await getOwnOrganizerRequests();
      setOrganizerRequests((requests || []).map(mapToOrganizerRequest));
      toast({ title: 'Успех', description: 'Запрос отправлен', status: 'success', duration: 5000, isClosable: true });
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkTelegram = async (telegram: string) => {
    setIsLoading(true);
    try {
      await linkTelegram(telegram);
      setTelegram('');
      toast({ title: 'Успех', description: 'Telegram привязан', status: 'success', duration: 3000, isClosable: true });
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventFormDataChange = (data: Partial<EventFormData>) => {
    setEventFormData((prev) => ({ ...prev, ...data }));
  };

  const handleEventSubmit = async () => {
    const formData = new FormData();
    Object.entries(eventFormData).forEach(([key, value]) => {
      if (key === 'tags' && Array.isArray(value)) {
        formData.append('tags', JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });
    if (imageFile) formData.append('image', imageFile);

    setIsLoading(true);
    try {
      if (isEditing && editingEventId) {
        await updateEvent(editingEventId, formData);
        toast({ title: 'Успех', description: 'Мероприятие обновлено', status: 'success', duration: 3000, isClosable: true });
      } else {
        await createEvent(formData);
        toast({ title: 'Успех', description: 'Мероприятие создано', status: 'success', duration: 3000, isClosable: true });
      }
      const events = await getOwnEvents();
      setOwnEvents(events.map(mapToCabinetEvent));
      resetEventForm();
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  const resetEventForm = () => {
    setEventFormData({
      title: '',
      description: '',
      date: '',
      location: '',
      category_id: '',
      price: '',
      capacity: '',
      telegram_chat_link: '',
      tags: [],
    });
    setImageFile(null);
    setImagePreview(null);
    setIsEditing(false);
    setEditingEventId(null);
  };

  const handleEditEvent = (event: CabinetEvent) => {
    setIsEditing(true);
    setEditingEventId(event.id);
    setEventFormData({
      title: event.title,
      description: event.description,
      date: event.date.slice(0, 16),
      location: event.location,
      category_id: String(event.category_id),
      price: event.price,
      capacity: String(event.capacity),
      telegram_chat_link: event.telegram_chat_link || '',
      tags: event.tags?.map((t: Tag) => t.id) || [],
    });
    if (event.image) setImagePreview(toImageSrc(event.image));
    setTabIndex(2);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Вы уверены?')) return;
    setIsLoading(true);
    try {
      await deleteEvent(eventId);
      const events = await getOwnEvents();
      setOwnEvents(events.map(mapToCabinetEvent));
      toast({ title: 'Успех', description: 'Мероприятие удалено', status: 'success', duration: 3000, isClosable: true });
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRequests = async (eventId: string) => {
    setIsLoading(true);
    try {
      const requests = await getEventRequests(eventId);
      setEventRequests(requests || []);
      setSelectedEventId(eventId);
      setRequestsModalOpen(true);
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponseToRequest = async (eventId: string, userId: string, statusId: number) => {
    setIsLoading(true);
    try {
      await responseToEventRequest(eventId, userId, statusId);
      const requests = await getEventRequests(eventId);
      setEventRequests(requests || []);
      toast({ title: 'Успех', description: `Заявка ${statusId === 2 ? 'подтверждена' : 'отклонена'}`, status: 'success', duration: 3000, isClosable: true });
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  const hasPendingRequest = organizerRequests.some((r) => r.status_id === 1);

  const cabinetTabs = [
    {
      label: 'Будущие',
      content: (
        <Box>
          <Text fontSize={fontSizeText} mb="1rem">
            Ваши будущие мероприятия
          </Text>
          <FutureEventsList registrations={registrations} onNavigate={(eventId: string) => navigate(`/event/${eventId}`)} />
        </Box>
      ),
    },
    {
      label: 'Прошедшие',
      content: (
        <Box>
          <Text fontSize={fontSizeText} mb="1rem">
            Прошедшие мероприятия
          </Text>
          <PastEventsList
            registrations={registrations}
            userId={user?.id || ''}
            onNavigate={(eventId: string) => navigate(`/event/${eventId}`)}
            onSubmitReview={handleCreateReview}
            isLoading={isLoading}
          />
        </Box>
      ),
    },
    {
      label: 'Мои созданные',
      content: (
        isOrganizer || isAdmin ? (
          <OwnEventsTab
            events={ownEvents}
            categories={categories}
            tags={tags}
            isEditing={isEditing}
            isLoading={isLoading}
            formData={eventFormData}
            imagePreview={imagePreview}
            onFormDataChange={handleEventFormDataChange}
            onImageChange={(file) => {
              setImageFile(file);
              if (file) {
                setImagePreview(URL.createObjectURL(file));
              } else {
                setImagePreview(null);
              }
            }}
            onSubmit={handleEventSubmit}
            onCancelEdit={resetEventForm}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
            onViewRequests={handleViewRequests}
            onNavigate={(eventId: string) => navigate(`/event/${eventId}`)}
            withPanel={false}
          />
        ) : (
          <OrganizerRequestsTab
            requests={organizerRequests}
            onCreateRequest={handleCreateOrganizerRequest}
            isLoading={isLoading}
            hasPendingRequest={hasPendingRequest}
            isTelegramLinked={Boolean(user?.telegram && !user.telegram.startsWith('PENDING_'))}
            withPanel={false}
          />
        )
      ),
    },
    {
      label: 'Достижения',
      content: <AchievementsTab achievements={myAchievements} isLoading={isLoading} withPanel={false} />,
    },
  ];

  useEffect(() => {
    if (tabIndex >= cabinetTabs.length) {
      setTabIndex(0);
    }
  }, [tabIndex, cabinetTabs.length]);

  if (authLoading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <CabinetLayout>
      <Header />
      <Box className={styles.content}>
        <Heading as="h1" size={fontSizeHeading} mb="0.75rem" color="#422006" letterSpacing="-0.05em">
          Личный кабинет
        </Heading>
        <Text fontSize={fontSizeText} mb="2rem" color="rgba(66, 32, 6, 0.68)">
          Пользователь: {user?.login || 'Гость'}
        </Text>
        <CabinetTabs tabIndex={tabIndex} onTabChange={setTabIndex} tabs={cabinetTabs} />
        {!isAdmin && (!user?.telegram || user?.telegram.startsWith('PENDING_')) && (
          <VStack spacing="4" mt="2rem" align="stretch" width="100%" bg="rgba(255,255,255,0.82)" p="1.5rem" borderRadius="2rem" border="1px solid rgba(234, 179, 8, 0.16)" boxShadow="0 18px 34px rgba(140, 91, 14, 0.08)">
            <Text fontSize={fontSizeText} color="rgba(66, 32, 6, 0.78)">
              {user?.telegram
                ? `Подтвердите привязку Telegram-тега ${user.telegram.replace('PENDING_', '')} в течение 2 минут`
                : 'Привяжите ваш Telegram-аккаунт'}
            </Text>
            <FormControl>
              <FormLabel>Telegram</FormLabel>
              <Input
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="@username"
                bg="rgba(255,255,255,0.92)"
              />
            </FormControl>
            <Button
              bg="#facc15"
              color="#422006"
              _hover={{ bg: '#eab308', transform: 'scale(1.03)' }}
              onClick={() => handleLinkTelegram(telegram)}
              isDisabled={isLoading}
            >
              {user?.telegram ? 'Подтвердить Telegram' : 'Привязать Telegram'}
            </Button>
          </VStack>
        )}
      </Box>
      <Footer />
      <EventRequestsModal
        isOpen={requestsModalOpen}
        onClose={() => setRequestsModalOpen(false)}
        eventId={selectedEventId}
        requests={eventRequests}
        onResponse={handleResponseToRequest}
        isLoading={isLoading}
      />
    </CabinetLayout>
  );
}

export default Cabinet;
