import { useEffect, useState } from 'react';
import {
  TabPanel,
  VStack,
  Heading,
  Button,
  HStack,
  Badge,
  Text,
  useBreakpointValue,
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  Stack,
  Image,
  useToast,
} from '@chakra-ui/react';
import { Tag } from '../../../api/api';
import { EventFormData, CabinetEvent } from '../types';
import { EventFormTab } from '../EventForm/EventFormTab';

interface OwnEventsTabProps {
  events: CabinetEvent[];
  categories: { id: number; category_name: string }[];
  tags: Tag[];
  isEditing: boolean;
  isLoading: boolean;
  formData: EventFormData;
  imagePreview: string | null;
  onFormDataChange: (data: Partial<EventFormData>) => void;
  onImageChange: (file: File | null) => void;
  onSubmit: () => void;
  onCancelEdit: () => void;
  onEdit: (event: CabinetEvent) => void;
  onDelete: (eventId: string) => void;
  onViewRequests: (eventId: string) => void;
  onNavigate: (eventId: string) => void;
  withPanel?: boolean;
}

export function OwnEventsTab({
  events,
  categories,
  tags,
  isEditing,
  isLoading,
  formData,
  imagePreview,
  onFormDataChange,
  onImageChange,
  onSubmit,
  onCancelEdit,
  onEdit,
  onDelete,
  onViewRequests,
  onNavigate,
  withPanel = true,
}: OwnEventsTabProps) {
  const [subTabIndex, setSubTabIndex] = useState(0);
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const toast = useToast();

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Дата не указана';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Некорректная дата';
      return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (e) {
      return 'Ошибка даты';
    }
  };

  const isPastEvent = (dateString: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    return date < new Date();
  };

  const getDateSortValue = (dateString: string) => {
    if (!dateString) return Number.MAX_SAFE_INTEGER;
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? Number.MAX_SAFE_INTEGER : date.getTime();
  };

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

  useEffect(() => {
    if (isEditing) {
      setSubTabIndex(3);
    } else if (subTabIndex === 3) {
      setSubTabIndex(0);
    }
  }, [isEditing]);

  const activeEvents = events
    .filter((event) => !isPastEvent(event.date))
    .sort((a, b) => getDateSortValue(a.date) - getDateSortValue(b.date));
  const archivedEvents = events.filter((event) => isPastEvent(event.date));

  const handleShowKey = (event: CabinetEvent) => {
    toast({
      title: 'Ключ верификации',
      description: event.organizer_verification_key || 'Ключ отсутствует',
      status: 'info',
      duration: 5000,
      isClosable: true,
    });
  };

  const EventCard = ({ event, archived = false }: { event: CabinetEvent; archived?: boolean }) => {
    const imageSrc = toImageSrc(event.image);

    return (
      <Box key={event.id} borderWidth="1px" borderRadius="md" p="4" bg="white" boxShadow="sm">
        <Stack direction={{ base: 'column', md: 'row' }} spacing="4" align="stretch">
          {imageSrc && (
            <Box flexShrink={0} w={{ base: '100%', md: '220px' }} h={{ base: '180px', md: '160px' }} overflow="hidden" borderRadius="md">
              <Image src={imageSrc} alt={event.title} w="100%" h="100%" objectFit="cover" />
            </Box>
          )}
          <VStack align="stretch" spacing="3" flex="1">
            <Box>
              <HStack spacing="2" flexWrap="wrap" mb="2">
                <Text fontWeight="bold" fontSize="lg">{event.title}</Text>
                <Badge colorScheme="blue">{event.category.category_name}</Badge>
              </HStack>
              <Text color="gray.700">Дата: {formatDate(event.date)}</Text>
              <Text color="gray.700">Место: {event.location}</Text>
              <Text color="gray.700">Мест: {event.capacity}</Text>
            </Box>

            <Stack direction={{ base: 'column', md: 'row' }} spacing="2" flexWrap="wrap">
              {!archived ? (
                <>
                  <Button size={buttonSize} colorScheme="blue" onClick={() => onEdit(event)} isDisabled={isLoading}>
                    Редактировать
                  </Button>
                  <Button size={buttonSize} colorScheme="red" onClick={() => onDelete(event.id)} isDisabled={isLoading}>
                    Удалить
                  </Button>
                </>
              ) : (
                <>
                  <Button size={buttonSize} colorScheme="teal" onClick={() => onNavigate(event.id)} isDisabled={isLoading}>
                    Перейти
                  </Button>
                  <Button size={buttonSize} colorScheme="red" onClick={() => onDelete(event.id)} isDisabled={isLoading}>
                    Удалить
                  </Button>
                </>
              )}
              <Button size={buttonSize} colorScheme="green" onClick={() => onViewRequests(event.id)} isDisabled={isLoading}>
                Показать заявки
              </Button>
              <Button size={buttonSize} colorScheme="purple" onClick={() => handleShowKey(event)} isDisabled={isLoading || !event.organizer_verification_key}>
                Показать ключ
              </Button>
            </Stack>
          </VStack>
        </Stack>
      </Box>
    );
  };

  const content = (
    <Tabs
      index={subTabIndex}
      onChange={(index) => {
        if (subTabIndex === 3 && index !== 3 && isEditing) {
          onCancelEdit();
        }
        setSubTabIndex(index);
      }}
      variant="soft-rounded"
      colorScheme="blue"
      width="100%"
      isLazy
    >
      <TabList mb="1rem" flexWrap="wrap" gap="0.5rem">
        <Tab _selected={{ bg: '#2E4FD7', color: 'white' }}>Список мероприятий</Tab>
        <Tab _selected={{ bg: '#2E4FD7', color: 'white' }}>Создать мероприятие</Tab>
        <Tab _selected={{ bg: '#2E4FD7', color: 'white' }}>Архив</Tab>
        <Tab display="none">Редактирование мероприятия</Tab>
      </TabList>
      <TabPanels width="100%">
        <TabPanel px={0}>
          <VStack spacing="4" align="stretch" w="100%">
            {activeEvents.length === 0 ? (
              <Text color="gray.600">У вас пока нет активных мероприятий</Text>
            ) : (
              activeEvents.map((event) => <EventCard key={event.id} event={event} />)
            )}
          </VStack>
        </TabPanel>

        <TabPanel px={0}>
          <EventFormTab
            categories={categories}
            tags={tags}
            isEditing={false}
            isLoading={isLoading}
            formData={formData}
            imagePreview={imagePreview}
            onFormDataChange={onFormDataChange}
            onImageChange={onImageChange}
            onSubmit={onSubmit}
            onCancelEdit={onCancelEdit}
            withPanel={false}
          />
        </TabPanel>

        <TabPanel px={0}>
          <VStack spacing="4" align="stretch" w="100%">
            <Heading size="lg" mb="2">Архив</Heading>
            {archivedEvents.length === 0 ? (
              <Text color="gray.600">Нет мероприятий в архиве</Text>
            ) : (
              archivedEvents.map((event) => <EventCard key={event.id} event={event} archived />)
            )}
          </VStack>
        </TabPanel>

        <TabPanel px={0}>
          <EventFormTab
            categories={categories}
            tags={tags}
            isEditing={isEditing}
            isLoading={isLoading}
            formData={formData}
            imagePreview={imagePreview}
            onFormDataChange={onFormDataChange}
            onImageChange={onImageChange}
            onSubmit={onSubmit}
            onCancelEdit={onCancelEdit}
            withPanel={false}
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );

  return withPanel ? <TabPanel px={0}>{content}</TabPanel> : content;
}
